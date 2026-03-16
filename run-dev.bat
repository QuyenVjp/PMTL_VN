@echo off
setlocal

set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%PS_EXE%" set "PS_EXE=C:\Program Files\PowerShell\7\pwsh.exe"

if not exist "%PS_EXE%" (
  echo [dev] Khong tim thay PowerShell runtime.
  exit /b 1
)

"%PS_EXE%" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "infra\scripts\docker-recover.ps1" -TimeoutSeconds 150
if %errorlevel% neq 0 exit /b 1

pnpm dev
