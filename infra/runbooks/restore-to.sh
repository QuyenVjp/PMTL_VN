#!/usr/bin/env sh
# restore-to.sh — Restore PMTL database to a specific backup timestamp.
#
# Usage:
#   bash infra/runbooks/restore-to.sh <timestamp-or-file>
#
# Examples:
#   bash infra/runbooks/restore-to.sh 20260331-143000
#   bash infra/runbooks/restore-to.sh backups/prod/postgres/pmtl-20260331-143000.dump
#   bash infra/runbooks/restore-to.sh backups/prod/postgres/pmtl-20260331-143000.dump.gpg
#
# If no argument: lists available backups sorted newest first and exits.
#
# Env vars (optional — defaults to prod):
#   ENV_FILE     path to .env file (default: infra/docker/.env.prod)
#   COMPOSE_FILE path to compose file (default: infra/docker/compose.prod.yml)
#   BACKUP_ROOT  directory to search (default: backups/prod/postgres)

set -eu

ENV_FILE="${ENV_FILE:-infra/docker/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-backups/prod/postgres}"

# ── List mode ─────────────────────────────────────────────────────────────────
if [ $# -eq 0 ]; then
  echo "Available backups (newest first):"
  echo ""
  ls -lht "$BACKUP_ROOT" 2>/dev/null | grep -E 'pmtl-.*\.dump(\.gpg)?$' | head -20 || echo "  No backups found in $BACKUP_ROOT"
  echo ""
  echo "Usage: bash infra/runbooks/restore-to.sh <timestamp-or-file>"
  echo "  Example: bash infra/runbooks/restore-to.sh 20260331-143000"
  exit 0
fi

TARGET="$1"

# ── Resolve dump file ──────────────────────────────────────────────────────────
if [ -f "$TARGET" ]; then
  DUMP_FILE="$TARGET"
elif [ -f "$BACKUP_ROOT/pmtl-${TARGET}.dump" ]; then
  DUMP_FILE="$BACKUP_ROOT/pmtl-${TARGET}.dump"
elif [ -f "$BACKUP_ROOT/pmtl-${TARGET}.dump.gpg" ]; then
  DUMP_FILE="$BACKUP_ROOT/pmtl-${TARGET}.dump.gpg"
else
  echo "ERROR: Cannot find backup for '$TARGET'"
  echo "Available backups:"
  ls "$BACKUP_ROOT" 2>/dev/null | grep 'pmtl-' | head -10
  exit 1
fi

# ── Decrypt if GPG-encrypted ───────────────────────────────────────────────────
WORK_FILE="$DUMP_FILE"
TEMP_FILE=""

case "$DUMP_FILE" in
  *.gpg)
    echo "[0/4] Decrypting GPG backup..."
    TEMP_FILE="$(mktemp /tmp/pmtl-restore-XXXXXX.dump)"
    gpg --batch --yes --output "$TEMP_FILE" --decrypt "$DUMP_FILE"
    WORK_FILE="$TEMP_FILE"
    echo "  ✓ Decrypted to temp file"
    ;;
esac

# ── Safety confirmation ────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  WARNING: This will OVERWRITE the current database!  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  Backup : $DUMP_FILE"
echo "  Size   : $(du -h "$WORK_FILE" | cut -f1)"
echo "  Target : $COMPOSE_FILE"
echo ""
printf "Type 'yes' to confirm: "
read -r CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
  exit 1
fi

# ── Stop API + web to prevent writes during restore ───────────────────────────
echo ""
echo "[1/4] Stopping api and web to prevent writes..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop api web 2>/dev/null || true
echo "  ✓ Stopped"

# ── Restore ───────────────────────────────────────────────────────────────────
echo "[2/4] Restoring database..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_restore \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    -U "${POSTGRES_USER:-pmtl}" \
    -d "${POSTGRES_DB:-pmtl}" < "$WORK_FILE"
echo "  ✓ Database restored"

# ── Verify ────────────────────────────────────────────────────────────────────
echo "[3/4] Verifying table count..."
TABLE_COUNT=$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  psql -U "${POSTGRES_USER:-pmtl}" -d "${POSTGRES_DB:-pmtl}" -t -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  ✓ Tables: $(echo "$TABLE_COUNT" | tr -d ' ')"

echo "[4/4] Spot-checking critical tables..."
for TABLE in users sessions audit_logs posts; do
  COUNT=$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
    psql -U "${POSTGRES_USER:-pmtl}" -d "${POSTGRES_DB:-pmtl}" -t -c \
    "SELECT count(*) FROM $TABLE;" 2>/dev/null || echo "N/A")
  echo "  $TABLE: $(echo "$COUNT" | tr -d ' ') rows"
done

# ── Restart ───────────────────────────────────────────────────────────────────
echo ""
echo "Restarting api and web..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --no-deps api web
echo ""
echo "=== Restore complete ==="
echo "Backup used : $DUMP_FILE"
echo "Health check: curl http://localhost:3001/api/health/ready"
echo ""
echo "Record evidence in: design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md"

# ── Cleanup temp file ─────────────────────────────────────────────────────────
[ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"
