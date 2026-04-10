Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$setHostEnv = Join-Path $repoRoot "infra/scripts/set-host-dev-env.ps1"
$prepareHostDev = Join-Path $repoRoot "infra/scripts/prepare-host-dev.ps1"
$ensurePortFree = Join-Path $repoRoot "infra/scripts/ensure-port-free.ts"

function Invoke-Checked {
  param(
    [string]$FilePath,
    [string[]]$ArgumentList
  )

  & $FilePath @ArgumentList
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($ArgumentList -join ' ')"
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
    [int]$TimeoutSec = 20
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
    if (Test-TcpPort -TargetHost $TargetHost -Port $Port) {
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

      if ($stderrLine) {
        Write-Host "[host-admin] $Label vẫn đang chạy sau ${elapsed}s. stderr mới nhất: $stderrLine" -ForegroundColor Yellow
      } elseif ($stdoutLine) {
        Write-Host "[host-admin] $Label vẫn đang chạy sau ${elapsed}s. stdout mới nhất: $stdoutLine" -ForegroundColor Cyan
      } else {
        Write-Host "[host-admin] $Label vẫn đang khởi động... (${elapsed}s/${TimeoutSec}s)" -ForegroundColor Cyan
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

  $pnpmPs1 = Get-Command pnpm -CommandType ExternalScript -ErrorAction SilentlyContinue
  if ($pnpmPs1 -and $pnpmPs1.Source -like "*.ps1") {
    $shellCmd = Get-Command pwsh -ErrorAction SilentlyContinue
    if (-not $shellCmd) {
      $shellCmd = Get-Command powershell -ErrorAction SilentlyContinue
    }
    if (-not $shellCmd) {
      throw "Khong tim thay pwsh/powershell de chay pnpm.ps1."
    }

    $resolvedFilePath = $shellCmd.Source
    $resolvedArguments = @(
      "-NoLogo",
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      $pnpmPs1.Source
    ) + $ArgumentList
  } else {
    $pnpmCmd = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
    if (-not $pnpmCmd) {
      throw "Khong tim thay pnpm trong PATH."
    }

    $resolvedFilePath = $pnpmCmd.Source
    $resolvedArguments = $ArgumentList
  }

  Write-Host "[host-admin] ${Label}: pnpm $($ArgumentList -join ' ')" -ForegroundColor Cyan
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
  $devOut = Join-Path $LogDir "host-admin.api-dev.out.log"
  $devErr = Join-Path $LogDir "host-admin.api-dev.err.log"
  $startOut = Join-Path $LogDir "host-admin.api-start.out.log"
  $startErr = Join-Path $LogDir "host-admin.api-start.err.log"
  Remove-Item $devOut, $devErr, $startOut, $startErr -ErrorAction SilentlyContinue

  $apiDev = Start-PnpmProcess `
    -ArgumentList @("--filter", "@pmtl/api", "dev") `
    -StdoutPath $devOut `
    -StderrPath $devErr `
    -Label "Starting API (dev mode)"

  if (Wait-ForPortWithProgress `
      -TargetHost "127.0.0.1" `
      -Port 3001 `
      -TimeoutSec 150 `
      -Process $apiDev `
      -StdoutPath $devOut `
      -StderrPath $devErr `
      -Label "API dev mode") {
    Write-Host "[host-admin] API dev mode da san sang tren :3001." -ForegroundColor Green
    return $apiDev
  }

  if (-not $apiDev.HasExited) {
    Stop-Process -Id $apiDev.Id -Force -ErrorAction SilentlyContinue
  }

  Write-Host "[host-admin] API dev mode that bai, fallback sang dist..." -ForegroundColor Yellow

  $apiStart = Start-PnpmProcess `
    -ArgumentList @("--filter", "@pmtl/api", "start") `
    -StdoutPath $startOut `
    -StderrPath $startErr `
    -Label "Starting API (fallback dist)"

  if (Wait-ForPortWithProgress `
      -TargetHost "127.0.0.1" `
      -Port 3001 `
      -TimeoutSec 60 `
      -Process $apiStart `
      -StdoutPath $startOut `
      -StderrPath $startErr `
      -Label "API fallback dist") {
    Write-Host "[host-admin] API fallback da san sang tren :3001." -ForegroundColor Green
    return $apiStart
  }

  if (-not $apiStart.HasExited) {
    Stop-Process -Id $apiStart.Id -Force -ErrorAction SilentlyContinue
  }

  $devOutTail = if (Test-Path $devOut) { (Get-Content $devOut -Tail 30) -join [Environment]::NewLine } else { "(khong co log)" }
  $devErrTail = if (Test-Path $devErr) { (Get-Content $devErr -Tail 30) -join [Environment]::NewLine } else { "(khong co log)" }
  $startOutTail = if (Test-Path $startOut) { (Get-Content $startOut -Tail 30) -join [Environment]::NewLine } else { "(khong co log)" }
  $startErrTail = if (Test-Path $startErr) { (Get-Content $startErr -Tail 30) -join [Environment]::NewLine } else { "(khong co log)" }
  throw "Khong the khoi dong API tren :3001.`n[api-dev.out]`n$devOutTail`n`n[api-dev.err]`n$devErrTail`n`n[api-start.out]`n$startOutTail`n`n[api-start.err]`n$startErrTail"
}

Push-Location $repoRoot

$apiProcess = $null

try {
  . $setHostEnv

  # Ensure host dev dependencies are up, schema is synced, and seed data exists.
  Invoke-Checked -FilePath "pwsh" -ArgumentList @(
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $prepareHostDev
  )

  # Re-apply host env in the current process so turbo children inherit it.
  . $setHostEnv

  Invoke-Checked -FilePath "pnpm" -ArgumentList @("exec", "tsx", $ensurePortFree, "3001", "api")
  Invoke-Checked -FilePath "pnpm" -ArgumentList @("exec", "tsx", $ensurePortFree, "3002", "admin")

  $runtimeLogDir = Join-Path $repoRoot "tmp/runtime/logs"
  $apiProcess = Start-ApiWithFallback -LogDir $runtimeLogDir

  & pnpm exec turbo run dev --parallel --filter=@pmtl/admin
  exit $LASTEXITCODE
}
finally {
  if ($apiProcess -and -not $apiProcess.HasExited) {
    Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue
  }
  Pop-Location
}
