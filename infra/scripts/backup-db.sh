#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-infra/docker/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-backups/prod/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
GPG_RECIPIENT="${GPG_RECIPIENT:-}"
timestamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_ROOT"

DUMP_FILE="$BACKUP_ROOT/pmtl-${timestamp}.dump"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB" > "$DUMP_FILE"

# Encrypt if GPG_RECIPIENT is set
if [ -n "$GPG_RECIPIENT" ]; then
  gpg --batch --yes --recipient "$GPG_RECIPIENT" --trust-model always \
    --output "${DUMP_FILE}.gpg" --encrypt "$DUMP_FILE"
  rm -f "$DUMP_FILE"
  echo "Backup encrypted: ${DUMP_FILE}.gpg"
else
  echo "WARNING: GPG_RECIPIENT not set — backup is NOT encrypted."
  echo "Backup saved: ${DUMP_FILE}"
fi

# Cleanup old backups (both encrypted and unencrypted)
find "$BACKUP_ROOT" -type f \( -name 'pmtl-*.dump' -o -name 'pmtl-*.dump.gpg' \) -mtime +"$RETENTION_DAYS" -delete
