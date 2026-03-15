# Deploy and Ops Guidance

## Production Model
Preferred production workflow:
1. build images locally or in CI
2. push images to a registry such as GHCR or Docker Hub
3. on the VPS, pull images and run Compose

Prefer not to use the VPS as the default build machine.

## Service Boundary
Core services:
- web
- cms
- postgres
- meilisearch
- caddy

Production expansion services:
- redis
- worker
- monitoring services
- alerting/log aggregation

## Networking
- expose web and cms through Caddy
- keep Postgres internal-only
- keep Redis internal-only if introduced
- keep Meilisearch internal-only unless explicitly required otherwise

Typical host pattern:
- `example.com` → web
- `cms.example.com` → cms

## Docker Compose Guidance
Use Compose files under `infra/docker`.
Keep env examples in the same area.
Document new service requirements when changing Compose.

## Caddy Guidance
Use Caddy as the TLS terminator and reverse proxy.
Keep Caddy-specific config inside `infra/caddy`.
Do not mix application logic into proxy config.

## Scripts
Keep operational scripts in `infra/scripts`, for example:
- deploy
- DB backup
- DB restore
- health checks

Document usage in `README.md` or deployment docs when scripts change.
