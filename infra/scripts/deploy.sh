#!/usr/bin/env sh
set -eu

docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml pull web cms worker caddy postgres pgbouncer meilisearch redis
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml up -d web cms worker caddy postgres pgbouncer meilisearch redis

