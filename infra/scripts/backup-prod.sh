#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-infra/docker/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-backups/prod}"
POSTGRES_BACKUP_DIR="${BACKUP_ROOT}/postgres"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

timestamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$POSTGRES_BACKUP_DIR"

echo "Creating PostgreSQL backup..."
ENV_FILE="$ENV_FILE" COMPOSE_FILE="$COMPOSE_FILE" BACKUP_ROOT="$POSTGRES_BACKUP_DIR" RETENTION_DAYS="$RETENTION_DAYS" \
  ./infra/scripts/backup-db.sh

echo "Triggering Meilisearch snapshot..."
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T meilisearch sh -lc '
  if [ -z "${MEILI_MASTER_KEY:-}" ]; then
    echo "MEILI_MASTER_KEY is required to create a snapshot" >&2
    exit 1
  fi

  wget \
    --quiet \
    --output-document=- \
    --header="Authorization: Bearer ${MEILI_MASTER_KEY}" \
    --post-data="" \
    http://127.0.0.1:7700/snapshots >/dev/null
'

find "$POSTGRES_BACKUP_DIR" -type f -name 'pmtl-*.dump' -mtime +"$RETENTION_DAYS" -delete

echo "Backup completed at ${timestamp}"
