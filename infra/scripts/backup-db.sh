#!/usr/bin/env sh
set -eu

timestamp="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups

docker compose -f infra/docker/compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "backups/pmtl-${timestamp}.sql"

