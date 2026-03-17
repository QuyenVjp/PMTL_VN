@echo off
setlocal
set "ROOT=%~dp0"
if not exist "%ROOT%infra\docker\.env.dev" (
  copy "%ROOT%infra\docker\.env.dev.example" "%ROOT%infra\docker\.env.dev" >nul
)
docker compose --env-file "%ROOT%infra\docker\.env.dev" -f "%ROOT%infra\docker\compose.dev.yml" up -d --build %*
if errorlevel 1 exit /b %errorlevel%
echo PMTL_VN dev stack is starting in Docker.
echo Web: http://localhost:3000
echo CMS: http://localhost:3001/admin
echo Logs: logs-dev.bat
echo Stop: stop-dev.bat
