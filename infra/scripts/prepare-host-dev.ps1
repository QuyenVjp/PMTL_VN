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
    & $prismaCli db push --schema=./prisma/schema.prisma
    if ($LASTEXITCODE -ne 0) {
      Write-Host "[host-prepare] Schema drift detected. Force-resetting local dev schema..." -ForegroundColor Yellow
      & $prismaCli db push --schema=./prisma/schema.prisma --force-reset
      if ($LASTEXITCODE -ne 0) {
        throw "Lệnh 'prisma db push --force-reset' thất bại."
      }
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
}
finally {
  Pop-Location
}
