# Runbooks

## Reindex Search

Purpose:
- rebuild post search documents in Meilisearch after schema or content mapping changes

Prerequisites:
- CMS can boot
- Meilisearch is healthy
- required env vars are loaded

Run one batch:
```bash
pnpm --filter @pmtl/cms reindex:posts -- --page=1 --limit=100
```

Run all pages:
```bash
pnpm reindex:posts
```

Expected result:
- command prints JSON with `queuedTotal` and `batches`

After run:
```bash
pnpm --filter @pmtl/cms test
curl http://localhost:7700/health
```

If results do not appear:
- confirm worker health
- inspect CMS logs for search sync failures
- inspect Meilisearch recent tasks

## Restore Database

### Development Restore

Warning:
- this replaces the current local dev schema

Hard reset local dev schema:
```bash
pnpm db:reset:dev
```

Restore from SQL dump into dev Postgres:
```bash
docker compose --env-file infra/docker/.env.dev -f infra/docker/compose.dev.yml exec -T postgres \
  psql -U pmtl -d pmtl < backup.sql
```

### Production Restore

Prerequisites:
- maintenance window approved
- fresh backup validated
- application images ready to restart

Restore from custom-format dump:
```bash
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml exec -T postgres \
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists /backups/latest.dump
```

Restore from plain SQL:
```bash
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < latest.sql
```

Post-restore checks:
```bash
pnpm --filter @pmtl/cms typecheck
pnpm test
curl http://localhost:3001/api/health
curl http://localhost:3000/api/health
```

## Production Backup

Purpose:
- create PostgreSQL custom-format backups
- trigger Meilisearch snapshot creation
- apply simple retention locally before shipping off-site

Run manual production backup:
```bash
./infra/scripts/backup-prod.sh
```

Recommended cron:
```bash
0 2 * * * cd /srv/pmtl && ./infra/scripts/backup-prod.sh
```

Expected result:
- PostgreSQL dump stored under `backups/prod/postgres/`
- Meilisearch snapshot queued inside the Meilisearch data volume

Retention:
- local default retention is `7` days via `RETENTION_DAYS`
- off-site copy should be handled separately by the host or object-storage sync job

Verification:
```bash
LATEST_DUMP="$(ls -t backups/prod/postgres/pmtl-*.dump | head -n 1)"
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml exec -T postgres \
  pg_restore --list /dev/stdin < "$LATEST_DUMP"
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml exec -T meilisearch \
  sh -lc 'ls -la ${MEILI_SNAPSHOT_DIR:-/meili_data/snapshots}'
```

Notes:
- keep `MEILI_MASTER_KEY` available in the production env file
- test full restore regularly; a backup that was never restored is not a finished control

## Monitoring

Stack:
- Prometheus scrapes Caddy metrics, blackbox probes, worker metrics, postgres-exporter, redis-exporter, node-exporter
- Alertmanager sends alerts to Telegram
- Grafana is provisioned with the default PMTL Overview dashboard
- Error logs va exceptions di len Sentry Cloud tu `web`, `cms`, `worker`

Bring monitoring stack up with production services:
```bash
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml --profile monitoring up -d
```

Production-like local alert drill:
```bash
$env:PMTL_ENV_FILE=".env.prod.monitoring.local"
$env:ALERTMANAGER_CONFIG_PATH="../monitoring/alertmanager.local.yml"
pnpm docker:prod:monitoring:test
pnpm monitoring:test
Remove-Item Env:PMTL_ENV_FILE
Remove-Item Env:ALERTMANAGER_CONFIG_PATH
```

Access locally on the VPS:
```bash
curl http://127.0.0.1:9090/-/healthy
curl http://127.0.0.1:9093/-/healthy
curl http://127.0.0.1:3300/api/health
```

Recommended SSH tunnels:
```bash
ssh -L 3300:127.0.0.1:3300 -L 9090:127.0.0.1:9090 your-vps
```

Telegram alert prerequisites:
- `ALERT_TELEGRAM_BOT_TOKEN`
- `ALERT_TELEGRAM_CHAT_ID`

Telegram smoke:
```bash
pnpm telegram:test
```

Sentry prerequisites:
- `SENTRY_ENABLED=true`
- `NEXT_PUBLIC_SENTRY_ENABLED=true`
- `SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_DSN`
- optional: `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_RELEASE`

Monitoring verification:
```bash
curl http://127.0.0.1:9090/api/v1/targets
curl http://127.0.0.1:9090/api/v1/rules
curl http://127.0.0.1:9090/api/v1/query?query=up
curl http://localhost:3001/api/worker/health
curl http://localhost:3001/api/metrics/worker
pnpm monitoring:test
```

What to check first:
- `probe_success` for `web`, `cms`, `worker`, `meilisearch`, `caddy`
- `caddy_http_request_duration_seconds_count` cho request volume va 5xx
- `pmtl_worker_healthy`
- `pmtl_worker_queue_jobs`
- `postgres_up`
- `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes`
- `node_filesystem_avail_bytes / node_filesystem_size_bytes`
- `redis_memory_used_bytes / redis_memory_max_bytes`

Worker-down drill:
```bash
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml stop worker
curl http://localhost:3001/api/worker/health
curl http://127.0.0.1:9093/api/v2/alerts
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml start worker
```

Sentry drill:
```bash
curl -X POST http://localhost:3000/api/internal/monitoring/sentry-test \
  -H "Content-Type: application/json" \
  -H "x-monitoring-test-secret: $MONITORING_TEST_SECRET" \
  -d '{"message":"PMTL web monitoring drill"}'
curl -X POST http://localhost:3001/api/internal/monitoring/sentry-test \
  -H "Content-Type: application/json" \
  -H "x-monitoring-test-secret: $MONITORING_TEST_SECRET" \
  -d '{"message":"PMTL cms monitoring drill"}'
```

## Rollback Deployment

Strategy:
- rollback by pinning previous known-good image tags for `WEB_IMAGE` and `CMS_IMAGE`
- restart `web`, `cms`, and `worker`

Steps:
1. Update production secret/env source so `WEB_IMAGE` and `CMS_IMAGE` point to the previous release.
2. Redeploy compose services.

Command:
```bash
docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml up -d web cms worker
```

Verification:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3001/api/health
pnpm test
```

Rollback decision triggers:
- repeated `5xx` on `/api/auth/*`
- broken profile upload or session handling
- search or CMS publish flows failing after release
- repeated `PMTLWebHigh5xx`, `PMTLWorkerHeartbeatStale`, hoac `PMTLHostMemoryHigh`

## Post-Incident Notes

After any reindex, restore, or rollback:
- capture exact time and operator
- capture deployed image tags
- record whether web and cms schema versions matched
- attach the relevant `x-request-id` values from logs for failed requests
