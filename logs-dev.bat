@echo off
setlocal
set "ROOT=%~dp0"
if not exist "%ROOT%infra\docker\.env.dev" (
  copy "%ROOT%infra\docker\.env.dev.example" "%ROOT%infra\docker\.env.dev" >nul
)
docker compose --env-file "%ROOT%infra\docker\.env.dev" -f "%ROOT%infra\docker\compose.dev.yml" logs -f --tail 200 %*
