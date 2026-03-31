Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$apiRoot = Join-Path $repoRoot "apps/api"
$apiBinRoot = Join-Path $apiRoot "node_modules/.bin"
$prismaCli = Join-Path $apiBinRoot "prisma.CMD"
$tsxCli = Join-Path $apiBinRoot "tsx.CMD"

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

function Ensure-DevPostgresReady {
  param(
    [string]$RepoRoot,
    [string]$DatabaseUrl
  )

  $uri = [Uri]$DatabaseUrl
  $dbHost = $uri.Host
  $dbPort = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }

  if (Test-TcpPort -TargetHost $dbHost -Port $dbPort) {
    Write-Host "[host-prepare] PostgreSQL đã sẵn sàng tại ${dbHost}:${dbPort}." -ForegroundColor Green
    return
  }

  Write-Host "[host-prepare] Không kết nối được PostgreSQL tại ${dbHost}:${dbPort}. Đang thử khôi phục Docker + compose..." -ForegroundColor Yellow

  $dockerRecover = Join-Path $RepoRoot "infra/scripts/docker-recover.ps1"
  if (Test-Path $dockerRecover) {
    $pwshCmd = Get-Command pwsh -ErrorAction SilentlyContinue
    $powershellCmd = Get-Command powershell -ErrorAction SilentlyContinue

    if ($pwshCmd) {
      & $pwshCmd.Source -ExecutionPolicy Bypass -File $dockerRecover -TimeoutSeconds 120
    }
    elseif ($powershellCmd) {
      & $powershellCmd.Source -ExecutionPolicy Bypass -File $dockerRecover -TimeoutSeconds 120
    }
    else {
      throw "Không tìm thấy pwsh/powershell để chạy docker-recover."
    }

    if ($LASTEXITCODE -ne 0) {
      throw "docker-recover thất bại. Không thể chuẩn bị PostgreSQL local."
    }
  }

  $composeFile = Join-Path $RepoRoot "infra/docker/compose.dev.yml"
  if (-not (Test-Path $composeFile)) {
    throw "Không tìm thấy compose file tại '$composeFile'."
  }

  & docker compose -f $composeFile up -d postgres
  if ($LASTEXITCODE -ne 0) {
    throw "Lệnh 'docker compose -f infra/docker/compose.dev.yml up -d postgres' thất bại."
  }

  $deadline = (Get-Date).AddSeconds(90)
  do {
    if (Test-TcpPort -TargetHost $dbHost -Port $dbPort) {
      Write-Host "[host-prepare] PostgreSQL đã sẵn sàng sau khi khởi động compose." -ForegroundColor Green
      return
    }
    Start-Sleep -Seconds 2
  } while ((Get-Date) -lt $deadline)

  throw "Không thể kết nối PostgreSQL tại ${dbHost}:${dbPort} sau khi bật compose."
}

function Test-HttpJson {
  param(
    [string]$Url,
    [int]$TimeoutSec = 2
  )

  try {
    $resp = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec $TimeoutSec
    return $resp
  }
  catch {
    return $null
  }
}

function Ensure-CornHubReady {
  param(
    [string]$RepoRoot
  )

  $cornApiRoot = "C:\Users\ADMIN\CornMCP\apps\corn-api"
  if (-not (Test-Path $cornApiRoot)) {
    Write-Host "[host-prepare] CornHub: không tìm thấy '$cornApiRoot' (bỏ qua)." -ForegroundColor Yellow
    return
  }

  $healthUrl = "http://localhost:4000/health"
  $projectsUrl = "http://localhost:4000/api/projects"
  $projectName = Split-Path -Leaf $RepoRoot

  $health = Test-HttpJson -Url $healthUrl
  $isCornApi = $false
  if ($health -and $health.service -eq "corn-api") {
    $isCornApi = $true
  }

  if (-not $isCornApi) {
    Write-Host "[host-prepare] CornHub API chưa chạy, đang khởi động..." -ForegroundColor Cyan
    Push-Location $cornApiRoot
    try {
      & cmd /c "start /b cmd /c pnpm dev > corn-api-bg.log 2>&1"
    }
    finally {
      Pop-Location
    }

    $deadline = (Get-Date).AddSeconds(45)
    do {
      Start-Sleep -Seconds 2
      $health = Test-HttpJson -Url $healthUrl -TimeoutSec 3
      if ($health -and $health.service -eq "corn-api") {
        $isCornApi = $true
        break
      }
    } while ((Get-Date) -lt $deadline)
  }

  if (-not $isCornApi) {
    Write-Host "[host-prepare] CornHub API chưa sẵn sàng trên :4000 (có thể bị xung đột cổng). Bỏ qua indexing tự động." -ForegroundColor Yellow
    return
  }

  try {
    $projectsResp = Invoke-RestMethod -Uri $projectsUrl -Method Get -TimeoutSec 5
    $projects = @($projectsResp.projects)
    $project = $projects | Where-Object { $_.git_repo_url -eq $RepoRoot } | Select-Object -First 1
    if (-not $project) {
      $project = $projects | Where-Object { $_.name -eq $projectName } | Select-Object -First 1
    }

    if (-not $project) {
      $createBody = @{
        name       = $projectName
        description = "Auto-registered by PMTL host prepare script"
        gitRepoUrl = $RepoRoot
        gitProvider = "local"
        orgId      = "org-default"
      } | ConvertTo-Json

      $createResp = Invoke-RestMethod -Uri $projectsUrl -Method Post -ContentType "application/json" -Body $createBody -TimeoutSec 8
      $project = [pscustomobject]@{
        id = $createResp.id
        indexed_at = $null
        indexed_symbols = 0
      }
      Write-Host "[host-prepare] CornHub: đã tạo project '$projectName' ($($project.id))." -ForegroundColor Green
    }

    $needsIndex = (-not $project.indexed_at) -or ([int]$project.indexed_symbols -eq 0)
    if ($needsIndex) {
      $indexUrl = "http://localhost:4000/api/indexing/$($project.id)/index"
      $indexBody = @{ branch = "main" } | ConvertTo-Json
      try {
        $idxResp = Invoke-RestMethod -Uri $indexUrl -Method Post -ContentType "application/json" -Body $indexBody -TimeoutSec 8
        Write-Host "[host-prepare] CornHub: indexing started (job $($idxResp.jobId))." -ForegroundColor Green
      }
      catch {
        $raw = $_.ErrorDetails.Message
        if ($raw -and $raw -match "already running") {
          Write-Host "[host-prepare] CornHub: indexing job đang chạy, bỏ qua trigger mới." -ForegroundColor Yellow
        } else {
          Write-Host "[host-prepare] CornHub: không trigger được indexing tự động." -ForegroundColor Yellow
        }
      }
    } else {
      Write-Host "[host-prepare] CornHub: project đã được index ($($project.indexed_symbols) symbols)." -ForegroundColor Green
    }
  }
  catch {
    Write-Host "[host-prepare] CornHub: lỗi khi đăng ký/index project (bỏ qua, không chặn dev stack)." -ForegroundColor Yellow
  }
}

Push-Location $repoRoot

try {
  . (Join-Path $repoRoot "infra/scripts/set-host-dev-env.ps1")
  Ensure-DevPostgresReady -RepoRoot $repoRoot -DatabaseUrl $env:DATABASE_URL

  if (-not (Test-Path $prismaCli)) {
    throw "Không tìm thấy Prisma CLI tại '$prismaCli'. Hãy chạy 'pnpm install' trước."
  }

  if (-not (Test-Path $tsxCli)) {
    throw "Không tìm thấy TSX CLI tại '$tsxCli'. Hãy chạy 'pnpm install' trước."
  }

  Push-Location $apiRoot
  try {
    Write-Host "[host-prepare] Applying Prisma schema..." -ForegroundColor Cyan
    $maxRetries = 8
    $retryDelaySec = 4
    $pushDone = $false
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
      $pushOutput = & $prismaCli db push --schema=./prisma/schema.prisma 2>&1
      $outputStr = ($pushOutput | Out-String)
      if ($LASTEXITCODE -eq 0) {
        $pushDone = $true
        break
      }
      if ($outputStr -match "P1001|Can't reach database|connection refused") {
        if ($attempt -lt $maxRetries) {
          Write-Host "[host-prepare] DB chưa sẵn sàng (thử $attempt/$maxRetries), đợi ${retryDelaySec}s..." -ForegroundColor Yellow
          Start-Sleep -Seconds $retryDelaySec
          continue
        }
        throw "Không thể kết nối database sau $maxRetries lần thử. Kiểm tra Docker compose (postgres).`nChi tiết: $outputStr"
      }
      # Non-connection error → schema drift — do NOT auto-reset (data loss risk)
      throw "[host-prepare] Schema drift detected nhưng KHÔNG tự reset DB.`nHãy chạy thủ công: pnpm --filter @pmtl/api prisma:migrate:dev`nHoặc nếu chắc chắn muốn reset: pnpm --filter @pmtl/api exec prisma db push --force-reset`nChi tiết lỗi: $outputStr"
    }
    if (-not $pushDone) {
      throw "prisma db push không hoàn thành sau $maxRetries lần thử."
    }

    Write-Host "[host-prepare] Seeding host dev data..." -ForegroundColor Cyan
    & $tsxCli prisma/seed.ts
    if ($LASTEXITCODE -ne 0) {
      throw "Lệnh 'tsx prisma/seed.ts' thất bại."
    }
  }
  finally {
    Pop-Location
  }

  Ensure-CornHubReady -RepoRoot $repoRoot
}
finally {
  Pop-Location
}
