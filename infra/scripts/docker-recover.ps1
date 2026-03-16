param(
  [int]$TimeoutSeconds = 120
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "[docker-recover] $Message"
}

function Test-DockerServerReady {
  try {
    docker info *> $null
    return $LASTEXITCODE -eq 0
  } catch {
    return $false
  }
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

Write-Step "Stopping lingering com.docker.build/com.docker.backend processes..."
Get-Process com.docker.build, com.docker.backend -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Step "Starting Docker Desktop..."
docker desktop start *> $null

Write-Step "Switching engine to linux (best effort)..."
docker desktop engine use linux *> $null

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
