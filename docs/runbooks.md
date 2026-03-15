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

## Post-Incident Notes

After any reindex, restore, or rollback:
- capture exact time and operator
- capture deployed image tags
- record whether web and cms schema versions matched
- attach the relevant `x-request-id` values from logs for failed requests
