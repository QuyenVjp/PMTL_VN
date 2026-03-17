@echo off
setlocal
pnpm dev %*
if errorlevel 1 exit /b %errorlevel%
echo PMTL_VN dev stack is starting in Docker.
echo Web: http://localhost:3000
echo CMS: http://localhost:3001/admin
echo Logs: logs-dev.bat
echo Stop: stop-dev.bat
