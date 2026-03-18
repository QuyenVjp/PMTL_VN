@echo off
setlocal EnableDelayedExpansion

echo Chon che do dev:
echo   1. Core  - web + cms + postgres + meilisearch + redis
echo   2. Full  - core + worker + caddy
set /p PMTL_DEV_MODE=Nhap 1 hoac 2 [mac dinh: 1]: 
set "PMTL_DEV_MODE=!PMTL_DEV_MODE: =!"

if "!PMTL_DEV_MODE!"=="" set "PMTL_DEV_MODE=1"

if "!PMTL_DEV_MODE!"=="1" (
  pnpm dev:core %*
  if errorlevel 1 exit /b %errorlevel%
  echo PMTL_VN core dev stack is starting in Docker.
  echo Web: http://localhost:3000
  echo CMS: http://localhost:3001/admin
  echo Logs: logs-dev.bat core
  echo Stop: stop-dev.bat
  exit /b 0
)

if "!PMTL_DEV_MODE!"=="2" (
  pnpm dev:full %*
  if errorlevel 1 exit /b %errorlevel%
  echo PMTL_VN full dev stack is starting in Docker.
  echo Web: http://localhost:3000
  echo CMS: http://localhost:3001/admin
  echo Logs: logs-dev.bat full
  echo Stop: stop-dev.bat
  exit /b 0
)

echo Lua chon khong hop le. Hay chay lai va chon 1 hoac 2.
exit /b 1
