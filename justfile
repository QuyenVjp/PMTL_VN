set shell := ["pwsh.exe", "-NoLogo", "-NoProfile", "-Command"]

bootstrap:
  python infra/tools/codex_actions.py bootstrap

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
  pnpm dev:host:admin:stack

admin-dev-only:
  pnpm dev:host:admin

admin-run:
  powershell -ExecutionPolicy Bypass -File ./infra/scripts/run-admin.ps1

admin-build:
  pnpm build:admin

storybook:
  pnpm storybook

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
  python infra/tools/codex_actions.py quality-gate --scope web

verify-api:
  python infra/tools/codex_actions.py quality-gate --scope api

# Legacy alias for backward compatibility
verify-cms:
  python infra/tools/codex_actions.py quality-gate --scope cms

verify-all:
  python infra/tools/codex_actions.py quality-gate --scope all

smoke:
  python infra/tools/codex_actions.py smoke-suite --suite smoke

mcp-smoke:
  python infra/tools/codex_actions.py mcp-smoke

monitoring:
  python infra/tools/codex_actions.py smoke-suite --suite monitoring

telegram:
  python infra/tools/codex_actions.py smoke-suite --suite telegram

auth-check:
  python infra/tools/codex_actions.py auth-flow

search-check:
  python infra/tools/codex_actions.py search-sync --all-pages

skill-audit:
  python infra/tools/codex_actions.py skill-audit

autoresearch:
  python infra/tools/autoresearch/runner.py --max-iters 120 --patience 20 --min-delta 0.0001

openspace *ARGS:
  python infra/tools/openspace_bridge.py {{ARGS}}

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
