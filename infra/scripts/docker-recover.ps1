param(
  [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "[docker-recover] $Message"
}

function Invoke-DockerCommand {
  param(
    [string[]]$Arguments
  )

  try {
    $null = & docker @Arguments 2>&1
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
}

function Test-DockerServerReady {
  return Invoke-DockerCommand -Arguments @("info")
}

function Wait-BackendApiPipe {
  param(
    [int]$WaitSeconds = 20
  )

  $deadline = (Get-Date).AddSeconds($WaitSeconds)
  do {
    if (Test-Path "\\.\pipe\dockerBackendApiServer") {
      return $true
    }

    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $deadline)

  return $false
}

Write-Step "Checking Docker Desktop service..."
$service = Get-Service com.docker.service -ErrorAction SilentlyContinue
if ($null -eq $service) {
  Write-Host "[docker-recover] Docker Desktop service not found. Reinstall Docker Desktop."
  exit 1
}

if ($service.Status -ne "Running") {
  Write-Step "Starting com.docker.service..."
  try {
    Start-Service com.docker.service
  } catch {
    Write-Host "[docker-recover] Cannot start com.docker.service in current shell."
    Write-Host "[docker-recover] Open PowerShell as Administrator and run:"
    Write-Host "  Start-Service com.docker.service"
    exit 1
  }
}

if (Test-DockerServerReady) {
  Write-Step "Docker engine is already ready."
  exit 0
}

Write-Step "Starting Docker Desktop..."
if (-not (Invoke-DockerCommand -Arguments @("desktop", "start"))) {
  Write-Step "Docker Desktop start command did not complete yet. Continue waiting for daemon."
}

Write-Step "Switching engine to linux (best effort)..."
if ((Wait-BackendApiPipe -WaitSeconds 20) -and (-not (Invoke-DockerCommand -Arguments @("desktop", "engine", "use", "linux")))) {
  Write-Step "Docker backend pipe is not ready yet. Skip engine switch for now and keep waiting."
} elseif (-not (Test-Path "\\.\pipe\dockerBackendApiServer")) {
  Write-Step "Docker backend API pipe is not available yet. Skip engine switch for now and keep waiting."
}

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
do {
  if (Test-DockerServerReady) {
    Write-Step "Docker engine is ready."
    exit 0
  }

  Start-Sleep -Seconds 3
} while ((Get-Date) -lt $deadline)

Write-Host "[docker-recover] Docker engine did not become ready in $TimeoutSeconds seconds."
Write-Host "[docker-recover] Run: docker desktop logs --tail 200"
Write-Host "[docker-recover] Run: & 'C:\Program Files\Docker\Docker\resources\com.docker.diagnose.exe' gather -upload"
exit 1
