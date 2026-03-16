@echo off
setlocal

docker info >nul 2>&1
if %errorlevel% neq 0 (
  powershell -NoLogo -NoProfile -Command "$svc = Get-Service com.docker.service -ErrorAction SilentlyContinue; if ($null -eq $svc) { Write-Host '[dev] Khong tim thay Docker Desktop Service. Hay cai/dat lai Docker Desktop.'; exit 2 }; if ($svc.Status -ne 'Running') { Write-Host '[dev] Docker Desktop Service dang tat. Hay mo PowerShell bang Administrator va chay: Start-Service com.docker.service'; exit 3 }; Write-Host '[dev] Docker Desktop Service dang chay nhung Linux engine chua len. Hay mo Docker Desktop va doi den khi `docker info` pass.'; exit 4"
  exit /b 1
)

pnpm dev
