#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-infra/docker/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
BACKUP_ROOT="${BACKUP_ROOT:-backups/prod/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
timestamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_ROOT"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -Fc -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_ROOT/pmtl-${timestamp}.dump"

find "$BACKUP_ROOT" -type f -name 'pmtl-*.dump' -mtime +"$RETENTION_DAYS" -delete

