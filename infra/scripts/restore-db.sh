#!/usr/bin/env sh
set -eu

# Restore a pg_dump custom-format backup (.dump) into the Postgres container.
#
# Usage:
#   ./infra/scripts/restore-db.sh <backup-file.dump>
#
# The backup must be a custom-format dump created by backup-db.sh (pg_dump -Fc).
# This script uses pg_restore with --clean --if-exists to drop existing objects
# before restoring, making it safe for both fresh and existing databases.
#
# Constitution: design/04-execution-overlay/repo/IMPLEMENTATION_MAPPING.md
# - Launch blocker: "backup + restore drill"
# - Evidence recorded in RESTORE_DRILL_LOG.md

ENV_FILE="${ENV_FILE:-infra/docker/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
DUMP_FILE="$1"

if [ ! -f "$DUMP_FILE" ]; then
  echo "ERROR: Backup file not found: $DUMP_FILE"
  exit 1
fi

echo "=== PMTL Restore Drill ==="
echo "Backup file: $DUMP_FILE"
echo "File size: $(du -h "$DUMP_FILE" | cut -f1)"
echo "Target compose: $COMPOSE_FILE"
echo ""

# Step 1: Verify backup integrity before restoring
echo "[1/4] Verifying backup integrity..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_restore --list < "$DUMP_FILE" > /dev/null
echo "  ✓ Backup file is valid custom-format dump"

# Step 2: Restore with clean (drop + recreate)
echo "[2/4] Restoring database..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_restore \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" < "$DUMP_FILE"
echo "  ✓ Database restored"

# Step 3: Verify table count
echo "[3/4] Verifying restored tables..."
TABLE_COUNT=$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "  ✓ Tables found: $(echo "$TABLE_COUNT" | tr -d ' ')"

# Step 4: Verify row counts for critical tables
echo "[4/4] Spot-checking critical tables..."
for TABLE in users sessions audit_logs posts media_assets; do
  ROW_COUNT=$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT count(*) FROM $TABLE;" 2>/dev/null || echo "  (table not found)")
  echo "  $TABLE: $(echo "$ROW_COUNT" | tr -d ' ') rows"
done

echo ""
echo "=== Restore drill complete ==="
echo "Record evidence in: design/04-execution-overlay/repo/RESTORE_DRILL_LOG.md"
