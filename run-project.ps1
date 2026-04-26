param(
  [switch]$FullPrepare
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$hostEnvScript    = Join-Path $repoRoot "infra/scripts/set-host-dev-env.ps1"
$hostPrepareScript = Join-Path $repoRoot "infra/scripts/prepare-host-dev.ps1"

# ── helpers ────────────────────────────────────────────────────────────────────

function Write-Step {
  param([string]$Msg)
  Write-Host "[pmtl] $Msg" -ForegroundColor Cyan
}

function Write-Ok {
  param([string]$Msg)
  Write-Host "[pmtl] ✓ $Msg" -ForegroundColor Green
}

function Write-Warn {
  param([string]$Msg)
  Write-Host "[pmtl] ⚠ $Msg" -ForegroundColor Yellow
}

function Get-ChildProcessIds {
  param([int]$ParentProcessId)

  $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId = $ParentProcessId" -ErrorAction SilentlyContinue)
  foreach ($child in $children) {
    [int]$child.ProcessId
    Get-ChildProcessIds -ParentProcessId ([int]$child.ProcessId)
  }
}

function Stop-ProcessTree {
  param(
    [int]$ProcessId,
    [string]$Reason = "cleanup"
  )

  if (-not $ProcessId -or $ProcessId -eq $PID) {
    return
  }

  $processIds = @(
    @(Get-ChildProcessIds -ParentProcessId $ProcessId) |
      Sort-Object -Unique -Descending
    $ProcessId
  ) | Where-Object { $_ -and $_ -ne $PID } | Select-Object -Unique

  foreach ($targetPid in $processIds) {
    try {
      Stop-Process -Id $targetPid -Force -ErrorAction Stop
      Write-Warn "Đã dừng PID $targetPid ($Reason)."
    } catch {
      # Process may already have exited while we were walking the tree.
    }
  }
}

function Stop-PmtlApiProcesses {
  $apiPathPattern = "*$repoRoot*"
  $apiProcessPatterns = @(
    "*--filter @pmtl/api dev*",
    "*@nestjs*cli*nest.js*start --watch*",
    "*apps\api\dist\main*"
  )

  $matches = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
      $cmd = $_.CommandLine
      $_.ProcessId -ne $PID -and
      $cmd -and
      $cmd -like $apiPathPattern -and
      ($apiProcessPatterns | Where-Object { $cmd -like $_ } | Select-Object -First 1)
    })

  foreach ($proc in ($matches | Sort-Object ProcessId -Unique)) {
    Stop-ProcessTree -ProcessId ([int]$proc.ProcessId) -Reason "PMTL API cũ"
  }
}

function Stop-DevPortProcesses {
  param([int[]] $Ports)
  $composeFile = Join-Path $repoRoot "infra/docker/compose.dev.yml"
  foreach ($port in $Ports) {
    $conns = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    foreach ($conn in $conns) {
      $pid_ = $conn.OwningProcess
      if ($pid_ -and $pid_ -ne $PID) {
        $procName = ""
        try {
          $procName = (Get-Process -Id $pid_ -ErrorAction Stop).ProcessName
        } catch {}

        # Never kill Docker engine/backend from port cleanup.
        if ($procName -in @("com.docker.backend", "Docker Desktop", "dockerd")) {
          if ($port -eq 5173 -and (Test-Path $composeFile)) {
            Write-Warn "Port 5173 đang do Docker giữ; thử stop service web trong compose thay vì kill Docker backend..."
            & docker compose -f $composeFile stop web | Out-Null
          } else {
            Write-Warn "Bỏ qua kill PID $pid_ ($procName) trên port $port để tránh sập Docker."
          }
          continue
        }

        Write-Warn "Giải phóng port $port từ PID $pid_..."
        Stop-ProcessTree -ProcessId $pid_ -Reason "port $port"
      }
    }

    $deadline = (Get-Date).AddSeconds(10)
    while ((Get-Date) -lt $deadline) {
      $stillListening = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
      if ($stillListening.Count -eq 0) {
        break
      }
      Start-Sleep -Milliseconds 250
    }
  }
}

function Test-TcpPort {
  param(
    [string]$TargetHost,
    [int]$Port,
    [int]$TimeoutMs = 1500
  )

  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $asyncResult = $client.BeginConnect($TargetHost, $Port, $null, $null)
    if (-not $asyncResult.AsyncWaitHandle.WaitOne($TimeoutMs, $false)) {
      return $false
    }
    $client.EndConnect($asyncResult)
    return $true
  }
  catch {
    return $false
  }
  finally {
    $client.Dispose()
  }
}

function Wait-ForPort {
  param(
    [string]$TargetHost,
    [int]$Port,
    [int]$TimeoutSec = 25
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  do {
    if (Test-TcpPort -TargetHost $TargetHost -Port $Port) {
      return $true
    }
    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $deadline)

  return $false
}

function Get-LatestLogLine {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    return $null
  }

  $lines = @(Get-Content $Path -Tail 20 | Where-Object { $_ -and $_.Trim() })
  if ($lines.Count -eq 0) {
    return $null
  }

  return $lines[-1]
}

function Test-LogContains {
  param(
    [string]$Path,
    [string[]]$Patterns
  )

  if (-not (Test-Path $Path)) {
    return $false
  }

  $text = (Get-Content $Path -Tail 120 -ErrorAction SilentlyContinue) -join [Environment]::NewLine
  foreach ($pattern in $Patterns) {
    if ($text -like "*$pattern*") {
      return $true
    }
  }

  return $false
}

function Test-BenignStartupLogLine {
  param([string]$Line)

  if (-not $Line) {
    return $false
  }

  return (
    $Line -like '*"typeCheck" will not have any effect when "builder" is not "swc"*' -or
    $Line -like '*Eviction policy is volatile-lru*'
  )
}

function Wait-ForPortWithProgress {
  param(
    [string]$TargetHost,
    [int]$Port,
    [int]$TimeoutSec,
    [System.Diagnostics.Process]$Process,
    [string]$StdoutPath,
    [string]$StderrPath,
    [string]$Label
  )

  $startedAt = Get-Date
  $lastProgressAt = $startedAt.AddSeconds(-15)

  do {
    if (
      (Test-TcpPort -TargetHost $TargetHost -Port $Port) -or
      (Test-TcpPort -TargetHost "localhost" -Port $Port) -or
      (Test-TcpPort -TargetHost "::1" -Port $Port) -or
      (Test-LogContains -Path $StdoutPath -Patterns @("Nest application successfully started", "API server running on port $Port"))
    ) {
      return $true
    }

    if ($Process -and $Process.HasExited) {
      return $false
    }

    $now = Get-Date
    if (($now - $lastProgressAt).TotalSeconds -ge 15) {
      $elapsed = [Math]::Floor(($now - $startedAt).TotalSeconds)
      $stderrLine = Get-LatestLogLine -Path $StderrPath
      $stdoutLine = Get-LatestLogLine -Path $StdoutPath

      if ($stderrLine -and -not (Test-BenignStartupLogLine -Line $stderrLine)) {
        Write-Warn "$Label vẫn đang chạy sau ${elapsed}s. stderr mới nhất: $stderrLine"
      } elseif ($stdoutLine) {
        Write-Step "$Label vẫn đang chạy sau ${elapsed}s. stdout mới nhất: $stdoutLine"
      } else {
        Write-Step "$Label vẫn đang khởi động... (${elapsed}s/${TimeoutSec}s)"
      }

      $lastProgressAt = $now
    }

    Start-Sleep -Milliseconds 500
  } while (((Get-Date) - $startedAt).TotalSeconds -lt $TimeoutSec)

  return $false
}

function Start-PnpmProcess {
  param(
    [string[]]$ArgumentList,
    [string]$StdoutPath,
    [string]$StderrPath,
    [string]$Label
  )

  $pnpmPs1 = @(Get-Command pnpm -CommandType ExternalScript -ErrorAction SilentlyContinue)[0]
  if ($pnpmPs1 -and $pnpmPs1.Source -like "*.ps1") {
    $shellCmd = @(Get-Command pwsh -ErrorAction SilentlyContinue)[0]
    if (-not $shellCmd) {
      $shellCmd = @(Get-Command powershell -ErrorAction SilentlyContinue)[0]
    }
    if (-not $shellCmd) {
      throw "Không tìm thấy pwsh/powershell để chạy pnpm.ps1."
    }

    $resolvedFilePath = $shellCmd.Source
    $resolvedArguments = [string[]](@(
      "-NoLogo",
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      $pnpmPs1.Source
    ) + $ArgumentList)
  } else {
    $pnpmCmd = @(Get-Command pnpm.cmd -ErrorAction SilentlyContinue)[0]
    if (-not $pnpmCmd) {
      throw "Không tìm thấy pnpm trong PATH."
    }

    $resolvedFilePath = $pnpmCmd.Source
    $resolvedArguments = [string[]]$ArgumentList
  }

  Write-Step "${Label}: pnpm $($ArgumentList -join ' ')"
  return Start-Process -FilePath $resolvedFilePath `
    -ArgumentList $resolvedArguments `
    -WorkingDirectory $repoRoot `
    -PassThru `
    -WindowStyle Hidden `
    -RedirectStandardOutput $StdoutPath `
    -RedirectStandardError $StderrPath
}

function Start-ApiWithFallback {
  param([string]$LogDir)

  New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
  Stop-PmtlApiProcesses
  Stop-DevPortProcesses -Ports @(3001)

  $devOut = Join-Path $LogDir "api-dev.out.log"
  $devErr = Join-Path $LogDir "api-dev.err.log"
  $startOut = Join-Path $LogDir "api-start.out.log"
  $startErr = Join-Path $LogDir "api-start.err.log"

  Remove-Item $devOut, $devErr, $startOut, $startErr -ErrorAction SilentlyContinue

  $apiDevProcess = Start-PnpmProcess `
    -ArgumentList @("--filter", "@pmtl/api", "dev") `
    -StdoutPath $devOut `
    -StderrPath $devErr `
    -Label "Khởi động API (dev mode)"

  # Dev cold-start can be slow on Windows after dependency/cache changes.
  if (Wait-ForPortWithProgress `
      -TargetHost "127.0.0.1" `
      -Port 3001 `
      -TimeoutSec 150 `
      -Process $apiDevProcess `
      -StdoutPath $devOut `
      -StderrPath $devErr `
      -Label "API dev mode") {
    Write-Ok "API chạy ở dev mode (port 3001)."
    return $apiDevProcess
  }

  if (-not $apiDevProcess.HasExited) {
    Stop-Process -Id $apiDevProcess.Id -Force -ErrorAction SilentlyContinue
  }

  Write-Warn "API dev mode không lên được (thường do compile errors). Chuyển sang fallback từ dist..."

  Write-Step "Build API dist trước khi fallback start..."
  & pnpm --filter @pmtl/api build
  if ($LASTEXITCODE -ne 0) {
    $devTail = if (Test-Path $devErr) { (Get-Content $devErr -Tail 40) -join [Environment]::NewLine } else { "(không có log)" }
    throw "Build API thất bại, không thể fallback.`n[api-dev.err tail]`n$devTail"
  }

  $apiStartProcess = Start-PnpmProcess `
    -ArgumentList @("--filter", "@pmtl/api", "start") `
    -StdoutPath $startOut `
    -StderrPath $startErr `
    -Label "Khởi động API (fallback dist)"

  if (Wait-ForPortWithProgress `
      -TargetHost "127.0.0.1" `
      -Port 3001 `
      -TimeoutSec 60 `
      -Process $apiStartProcess `
      -StdoutPath $startOut `
      -StderrPath $startErr `
      -Label "API fallback dist") {
    Write-Ok "API fallback đã chạy (port 3001)."
    return $apiStartProcess
  }

  if (-not $apiStartProcess.HasExited) {
    Stop-Process -Id $apiStartProcess.Id -Force -ErrorAction SilentlyContinue
  }

  $devOutTail = if (Test-Path $devOut) { (Get-Content $devOut -Tail 40) -join [Environment]::NewLine } else { "(không có log)" }
  $devErrTail = if (Test-Path $devErr) { (Get-Content $devErr -Tail 40) -join [Environment]::NewLine } else { "(không có log)" }
  $startOutTail = if (Test-Path $startOut) { (Get-Content $startOut -Tail 40) -join [Environment]::NewLine } else { "(không có log)" }
  $startErrTail = if (Test-Path $startErr) { (Get-Content $startErr -Tail 40) -join [Environment]::NewLine } else { "(không có log)" }
  throw "Không thể khởi động API trên port 3001.`n[api-dev.out tail]`n$devOutTail`n`n[api-dev.err tail]`n$devErrTail`n`n[api-start.out tail]`n$startOutTail`n`n[api-start.err tail]`n$startErrTail"
}

function Assert-NodeVersion {
  # Yêu cầu Node 20.x — chỉ switch nếu cần và nvm có trong PATH
  $rawVersion = (node --version 2>$null) -replace "^v", ""
  $major = [int]($rawVersion -split "\." | Select-Object -First 1)
  if ($major -eq 20) {
    Write-Ok "Node $rawVersion đang dùng."
    return
  }
  Write-Warn "Node $rawVersion khác v20. Đang thử chuyển sang Node 20..."
  $nvmCmd = Get-Command nvm -ErrorAction SilentlyContinue
  if (-not $nvmCmd) {
    Write-Warn "Không tìm thấy nvm. Vẫn tiếp tục với Node hiện tại — có thể gặp lỗi tương thích."
    return
  }
  # Chạy nvm use trực tiếp trong PS (không qua cmd /c để PATH được cập nhật)
  & nvm use 20 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "nvm use 20 thất bại — tiếp tục với Node $rawVersion."
  } else {
    Write-Ok "Đã chuyển sang Node 20."
  }
}

function Assert-DockerInfra {
  # Fast path: luôn yêu cầu compose up core infra, tránh check trạng thái vòng vo
  $composeFile = Join-Path $repoRoot "infra/docker/compose.dev.yml"
  if (-not (Test-Path $composeFile)) {
    Write-Warn "Không tìm thấy $composeFile — bỏ qua kiểm tra Docker infra."
    return
  }
  Write-Step "Khởi động Docker infra core (postgres + redis + meilisearch)..."
  & docker compose -f $composeFile up -d postgres redis meilisearch
  if ($LASTEXITCODE -ne 0) {
    Write-Warn "Docker engine chưa sẵn sàng. Thử mở Docker Desktop và chạy lại một lần..."
    $dockerDesktopExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktopExe) {
      Start-Process $dockerDesktopExe | Out-Null
      Start-Sleep -Seconds 12
      & docker compose -f $composeFile up -d postgres redis meilisearch
    }
  }
  if ($LASTEXITCODE -ne 0) {
    throw "Không thể khởi động Docker infra. Kiểm tra Docker Desktop có đang chạy không."
  }

  $infraPorts = @(
    @{ Name = "Postgres"; Port = 55432 },
    @{ Name = "Redis"; Port = 6379 },
    @{ Name = "Meilisearch"; Port = 7700 }
  )

  foreach ($check in $infraPorts) {
    if (-not (Wait-ForPort -TargetHost "127.0.0.1" -Port $check.Port -TimeoutSec 45)) {
      throw "$($check.Name) chưa sẵn sàng trên 127.0.0.1:$($check.Port)."
    }
  }

  Write-Ok "Docker infra core đã chạy."
}

# ── main ───────────────────────────────────────────────────────────────────────

Push-Location $repoRoot

$apiProcess = $null

try {
  Assert-NodeVersion

  Write-Step "Load biến môi trường host dev..."
  . $hostEnvScript
  Write-Ok "Env vars đã load."

  Write-Step "Giải phóng ports 5173, 3001 và 3002..."
  Stop-PmtlApiProcesses
  Stop-DevPortProcesses -Ports @(5173, 3001, 3002)

  Assert-DockerInfra

  if ($FullPrepare) {
    Write-Step "Chuẩn bị DB local đầy đủ (full prepare mode)..."
    & pwsh -ExecutionPolicy Bypass -File $hostPrepareScript
    if ($LASTEXITCODE -ne 0) {
      throw "prepare-host-dev.ps1 thất bại. Xem lỗi phía trên."
    }
    Write-Ok "DB local đã được kiểm tra."
  } else {
    Write-Warn "Fast mode: bỏ qua prepare-host-dev.ps1 để tránh check/recover Docker tự động."
    Write-Warn "Nếu cần đồng bộ DB đầy đủ, chạy lại với -FullPrepare."
  }

  $runtimeLogDir = Join-Path $repoRoot "tmp/runtime/logs"
  $apiProcess = Start-ApiWithFallback -LogDir $runtimeLogDir

  Write-Host ""
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
  Write-Host "  PMTL Dev Stack đang khởi động..." -ForegroundColor White
  Write-Host "  API  →  http://127.0.0.1:3001/api/docs  (sẵn sàng sau ~20s)" -ForegroundColor DarkGray
  Write-Host "  Admin → http://127.0.0.1:3002            (sẵn sàng sau ~5s)" -ForegroundColor DarkGray
  Write-Host "  Web  →  http://127.0.0.1:5173            (sẵn sàng sau ~15s)" -ForegroundColor DarkGray
  Write-Host "  Ctrl+C để dừng tất cả." -ForegroundColor DarkGray
  Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
  Write-Host ""

  # API đã chạy nền (dev hoặc fallback dist), turbo giữ admin + web ở foreground.
  & pnpm exec turbo run dev --parallel `
      --filter=@pmtl/admin `
      --filter=@pmtl/web

  # Nếu turbo exit (Ctrl+C hoặc crash), exit code được truyền lại
  exit $LASTEXITCODE

} catch {
  Write-Host ""
  Write-Host "[pmtl] LỖI: $_" -ForegroundColor Red
  Write-Host "[pmtl] Stack trace: $($_.ScriptStackTrace)" -ForegroundColor DarkRed
  exit 1
} finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Write-Warn "Dừng API process nền (PID $($apiProcess.Id))..."
    Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
  }
  Pop-Location
}
