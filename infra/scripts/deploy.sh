#!/usr/bin/env sh
set -eu

docker compose -f infra/docker/compose.prod.yml pull
docker compose -f infra/docker/compose.prod.yml up -d

