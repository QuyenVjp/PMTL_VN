Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = $PSScriptRoot
$hostEnvScript = Join-Path $repoRoot "infra/scripts/set-host-dev-env.ps1"
$hostPrepareScript = Join-Path $repoRoot "infra/scripts/prepare-host-dev.ps1"

function Stop-DevPortProcesses {
  param(
    [int[]] $Ports
  )

  foreach ($port in $Ports) {
    $connections = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
    foreach ($connection in $connections) {
      $pid = $connection.OwningProcess
      if ($pid -and $pid -ne $PID) {
        Write-Host "[pmtl-run] Reclaiming port $port from PID $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
      }
    }
  }
}

Push-Location $repoRoot

try {
  $nvmCommand = Get-Command nvm -ErrorAction SilentlyContinue
  if (-not $nvmCommand) {
    throw "Không tìm thấy 'nvm' trong PATH. Hãy cài nvm-windows hoặc mở terminal có sẵn nvm."
  }

  Write-Host "[pmtl-run] Switching Node to v20 with nvm..." -ForegroundColor Cyan
  cmd /c "nvm use 20"
  if ($LASTEXITCODE -ne 0) {
    throw "Lệnh 'nvm use 20' thất bại."
  }

  . $hostEnvScript
  Stop-DevPortProcesses -Ports @(3000, 3001, 3002)

  & $hostPrepareScript

  Write-Host "[pmtl-run] Starting web + api + admin on host mode..." -ForegroundColor Cyan
  pnpm dev:host:full
  if ($LASTEXITCODE -ne 0) {
    throw "Lệnh 'pnpm dev:host:full' thất bại."
  }
}
finally {
  Pop-Location
}
