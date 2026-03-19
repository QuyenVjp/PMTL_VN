set shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]

bootstrap:
  py infra/tools/codex_actions.py bootstrap

dev-core:
  pnpm dev:core

dev-full:
  pnpm dev:full

dev-logs:
  pnpm dev:logs

dev-stop:
  pnpm dev:stop

dev-rebuild:
  pnpm dev:rebuild

verify-web:
  py infra/tools/codex_actions.py quality-gate --scope web

verify-cms:
  py infra/tools/codex_actions.py quality-gate --scope cms

verify-all:
  py infra/tools/codex_actions.py quality-gate --scope all

smoke:
  py infra/tools/codex_actions.py smoke-suite --suite smoke

monitoring:
  py infra/tools/codex_actions.py smoke-suite --suite monitoring

telegram:
  py infra/tools/codex_actions.py smoke-suite --suite telegram

auth-check:
  py infra/tools/codex_actions.py auth-flow

search-check:
  py infra/tools/codex_actions.py search-sync --all-pages
