set shell := ["pwsh.exe", "-NoLogo", "-NoProfile", "-Command"]

bootstrap:
  py infra/tools/codex_actions.py bootstrap

dev-core:
  pnpm dev:core

dev-full:
  pnpm dev:full

run:
  powershell -ExecutionPolicy Bypass -File ./run-project.ps1

claude-setup:
  pwsh -ExecutionPolicy Bypass -File ./infra/scripts/bootstrap-claude-code.ps1

claude-doctor:
  pwsh -ExecutionPolicy Bypass -File ./infra/scripts/claude-code-doctor.ps1

host-prepare:
  powershell -ExecutionPolicy Bypass -File ./infra/scripts/prepare-host-dev.ps1

host-full:
  pnpm dev:host:full

admin-dev:
  pnpm dev:host:admin

admin-run:
  powershell -ExecutionPolicy Bypass -File ./infra/scripts/run-admin.ps1

admin-build:
  pnpm build:admin

admin-check:
  pnpm typecheck:admin
  pnpm build:admin

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

mcp-smoke:
  py infra/tools/codex_actions.py mcp-smoke

monitoring:
  py infra/tools/codex_actions.py smoke-suite --suite monitoring

telegram:
  py infra/tools/codex_actions.py smoke-suite --suite telegram

auth-check:
  py infra/tools/codex_actions.py auth-flow

search-check:
  py infra/tools/codex_actions.py search-sync --all-pages

skill-audit:
  py infra/tools/codex_actions.py skill-audit

openspace *ARGS:
  py infra/tools/openspace_bridge.py {{ARGS}}

# ─── CI / Deploy / Backup ─────────────────────────────────────────────────────

# Run full CI checks locally (mirrors .woodpecker.yml pipeline)
ci:
  pnpm install --frozen-lockfile
  pnpm lint
  pnpm typecheck
  pnpm --filter @pmtl/api test

# Deploy to production VPS via SSH
# Usage: just deploy-vps <sha>
# Example: just deploy-vps abc1234
deploy-vps sha="latest":
  ssh ${VPS_USER}@${VPS_HOST} "cd /opt/pmtl && \
    WEB_IMAGE=ghcr.io/${GHCR_OWNER}/pmtl-vn-web:{{sha}} \
    API_IMAGE=ghcr.io/${GHCR_OWNER}/pmtl-vn-api:{{sha}} \
    ADMIN_IMAGE=ghcr.io/${GHCR_OWNER}/pmtl-vn-admin:{{sha}} \
    docker compose -f infra/docker/compose.prod.yml pull && \
    docker compose -f infra/docker/compose.prod.yml up -d --no-deps --remove-orphans && \
    docker system prune -f --filter 'until=24h'"

# Trigger remote backup to Vietnix/MinIO/Viettel Cloud via SSH
backup-vietnix:
  ssh ${VPS_USER}@${VPS_HOST} "/opt/pmtl/scripts/backup-db.sh && \
    rclone sync /opt/pmtl/backups/daily remote:pmtl-backups/daily --log-level INFO"
