#!/usr/bin/env sh
set -eu

docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml pull
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml up -d

