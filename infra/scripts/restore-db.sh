#!/usr/bin/env sh
set -eu

if [ $# -ne 1 ]; then
  echo "Usage: ./infra/scripts/restore-db.sh <backup-file.sql>"
  exit 1
fi

docker compose -f infra/docker/compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$1"

