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

function Stop-WslForDockerRecovery {
  Write-Step "Shutting down WSL before retrying Docker engine startup..."
  try {
    & wsl --shutdown 2>&1 | Out-Null
  } catch {
    Write-Step "WSL shutdown command failed; continue with best-effort recovery."
  }

  Start-Sleep -Seconds 3

  $wslProcesses = @(Get-Process wsl -ErrorAction SilentlyContinue)
  if ($wslProcesses.Count -gt 0) {
    Write-Step "WSL helper processes are still running; terminating them."
    $wslProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
  }
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

function Get-DockerMonitorTail {
  param(
    [int]$TailLines = 40
  )

  $monitorLog = Join-Path $env:LOCALAPPDATA "Docker\log\host\monitor.log"
  if (-not (Test-Path $monitorLog)) {
    return @()
  }

  try {
    return @(Get-Content $monitorLog -Tail $TailLines -ErrorAction Stop)
  } catch {
    return @()
  }
}

function Test-DockerBackendCrashSignal {
  $tail = Get-DockerMonitorTail -TailLines 60
  if ($tail.Count -eq 0) {
    return $false
  }

  return ($tail -match "com\.docker\.backend\.exe services: exit status")
}

function Wait-DockerStable {
  param(
    [int]$ObserveSeconds = 30
  )

  Write-Step "Observing Docker backend stability for ${ObserveSeconds}s..."
  $deadline = (Get-Date).AddSeconds($ObserveSeconds)
  do {
    if (-not (Test-DockerServerReady)) {
      Write-Host "[docker-recover] Docker backend crash after startup: engine pipe disappeared during stability window."
      $tail = Get-DockerMonitorTail -TailLines 20
      if ($tail.Count -gt 0) {
        Write-Host "[docker-recover] monitor.log tail:"
        $tail | ForEach-Object { Write-Host "  $_" }
      }
      exit 2
    }

    if (Test-DockerBackendCrashSignal) {
      Write-Host "[docker-recover] Docker backend crash after startup: com.docker.backend.exe reported a fatal exit."
      $tail = Get-DockerMonitorTail -TailLines 20
      if ($tail.Count -gt 0) {
        Write-Host "[docker-recover] monitor.log tail:"
        $tail | ForEach-Object { Write-Host "  $_" }
      }
      exit 2
    }

    Start-Sleep -Seconds 3
  } while ((Get-Date) -lt $deadline)

  return $true
}

function Try-StartDockerServiceElevated {
  Write-Step "Trying privileged Docker Desktop service start as last resort..."

  try {
    Start-Service com.docker.service
    return $true
  } catch {
    Write-Host "[docker-recover] Cannot start com.docker.service in current shell."
    Write-Host "[docker-recover] Attempting elevated start via UAC prompt..."
    try {
      $elevatedShell = (Get-Command pwsh -ErrorAction SilentlyContinue)?.Source
      if (-not $elevatedShell) {
        $elevatedShell = (Get-Command powershell -ErrorAction SilentlyContinue)?.Source
      }

      if (-not $elevatedShell) {
        return $false
      }

      $proc = Start-Process -FilePath $elevatedShell -Verb RunAs -Wait -PassThru -ArgumentList @(
        "-NoProfile",
        "-Command",
        "Start-Service com.docker.service"
      )
      return $proc.ExitCode -eq 0
    } catch {
      return $false
    }
  }
}

Write-Step "Checking Docker Desktop service..."
$service = Get-Service com.docker.service -ErrorAction SilentlyContinue
if ($null -eq $service) {
  Write-Host "[docker-recover] Docker Desktop service not found. Reinstall Docker Desktop."
  exit 1
}

$serviceStartBlocked = $false
if ($service.Status -ne "Running") {
  Write-Step "com.docker.service is Stopped. This can be normal on Docker Desktop; recovering engine without forcing service first."
}

if (Test-DockerServerReady) {
  Write-Step "Docker engine is already ready."
  Wait-DockerStable -ObserveSeconds 30 | Out-Null
  exit 0
}

Write-Step "Docker API pipe chưa sẵn sàng dù Desktop có thể đang mở. Starting Docker Desktop..."
if (-not (Invoke-DockerCommand -Arguments @("desktop", "start"))) {
  Write-Step "Docker Desktop start command did not complete yet."
}

if (-not (Wait-BackendApiPipe -WaitSeconds 20)) {
  Write-Step "Docker backend pipe still missing after desktop start. Attempting Desktop restart..."
}

if ((-not (Test-Path "\\.\pipe\dockerBackendApiServer")) -and (-not (Invoke-DockerCommand -Arguments @("desktop", "restart", "--timeout", "180")))) {
  Write-Step "Desktop restart did not complete cleanly."
  Stop-WslForDockerRecovery

  Write-Step "Starting Docker Desktop after WSL shutdown..."
  if (-not (Invoke-DockerCommand -Arguments @("desktop", "start"))) {
    Write-Step "Docker Desktop start command did not complete yet. Continue waiting for daemon."
  }
}

if (-not (Wait-BackendApiPipe -WaitSeconds 15)) {
  if (Try-StartDockerServiceElevated) {
    Write-Step "com.docker.service started from elevated helper."
  } else {
    $serviceStartBlocked = $true
    Write-Host "[docker-recover] Service fallback did not complete. Continue waiting for Docker Desktop backend."
  }
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
    Wait-DockerStable -ObserveSeconds 30 | Out-Null
    exit 0
  }

  Start-Sleep -Seconds 3
} while ((Get-Date) -lt $deadline)

Write-Host "[docker-recover] Docker engine did not become ready in $TimeoutSeconds seconds."
if ($serviceStartBlocked) {
  Write-Host "[docker-recover] If this machine just rebooted, open PowerShell as Administrator and run:"
  Write-Host "  Start-Service com.docker.service"
}
Write-Host "[docker-recover] Run: docker desktop logs --tail 200"
Write-Host "[docker-recover] Run: & 'C:\Program Files\Docker\Docker\resources\com.docker.diagnose.exe' gather -upload"
exit 1
