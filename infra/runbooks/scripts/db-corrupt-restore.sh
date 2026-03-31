#!/usr/bin/env sh
# db-corrupt-restore.sh — Restore from latest backup when DB is corrupt/unresponsive.
# Wraps infra/runbooks/restore-to.sh with auto-detection of newest backup.
set -eu
CF="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
EF="${ENV_FILE:-infra/docker/.env.prod}"
BACKUP_ROOT="${BACKUP_ROOT:-backups/prod/postgres}"

echo "=== DB CORRUPT RESTORE ==="

# Step 1: Diagnose
echo "[1/4] Checking Postgres status..."
if docker compose --env-file "$EF" -f "$CF" exec -T postgres pg_isready -U "${POSTGRES_USER:-pmtl}" 2>/dev/null; then
  echo "  Postgres is responding — verifying tables..."
  TABLE_COUNT=$(docker compose --env-file "$EF" -f "$CF" exec -T postgres \
    psql -U "${POSTGRES_USER:-pmtl}" -d "${POSTGRES_DB:-pmtl}" -t -c \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
  echo "  Tables found: $TABLE_COUNT"
  if [ "${TABLE_COUNT:-0}" -gt 5 ]; then
    echo "  WARNING: DB appears OK. Confirm corruption before restoring."
    printf "  Continue with restore? (yes/no): "
    read -r CONFIRM
    [ "$CONFIRM" = "yes" ] || { echo "Aborted."; exit 1; }
  fi
fi

# Step 2: Find latest backup
echo "[2/4] Finding latest backup..."
LATEST=$(ls -t "$BACKUP_ROOT"/pmtl-*.dump* 2>/dev/null | head -1 || true)
if [ -z "$LATEST" ]; then
  echo "ERROR: No backup found in $BACKUP_ROOT"
  exit 1
fi
echo "  Latest: $LATEST ($(du -h "$LATEST" | cut -f1))"

# Step 3: Confirm
printf "[3/4] Restore from this backup? This WILL OVERWRITE current DB. (yes/no): "
read -r CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Aborted."; exit 1; }

# Step 4: Restore
echo "[4/4] Running restore..."
bash infra/runbooks/restore-to.sh "$LATEST"
