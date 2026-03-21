# PGBOUNCER_STRATEGY — Connection Pooling Design

File này chốt thiết kế đầy đủ cho PgBouncer khi được kích hoạt ở Phase 2+.
Phase 1 dùng Prisma connection pool trực tiếp — PgBouncer chỉ bật khi trigger được đáp ứng.

> **Phase trigger**: `baseline/infra.md` — "PgBouncer: connection count > threshold"
> **Env vars**: `tracking/env-inventory.md` — DATABASE_URL, PGBOUNCER_URL group

---

## Phase trigger (exact)

Bật PgBouncer khi **ít nhất 1** điều kiện sau:

| Trigger | Measurement |
|---|---|
| Postgres `max_connections` > 80% utilization | `SELECT count(*) FROM pg_stat_activity` consistently > 80 of max_connections |
| Connection wait time visible in Prisma logs | Prisma query engine logs showing `pool_timeout` errors |
| Horizontal API scale planned (> 2 API instances) | Architecture decision to run multiple API pods |
| p95 query time degrades under concurrent load | Pino logs: `db.query.duration_ms p95 > 200ms` under load test |

**Prerequisite**: None — PgBouncer is standalone, no other Phase 2 component required.

---

## Architecture

```
apps/api (Prisma client)
  → DATABASE_URL → PgBouncer :5432 (pool)
  → PgBouncer → Postgres :5432

apps/worker (Prisma client)
  → DATABASE_URL → PgBouncer :5432 (pool)
  → PgBouncer → Postgres :5432
```

PgBouncer runs as a **sidecar container** in the same Docker Compose network.
Single PgBouncer instance in Phase 2; PgBouncer HA (multiple instances) is Phase 3+.

---

## Pooling mode decision

**Mode: transaction pooling**

| Mode | Pros | Cons | Decision |
|---|---|---|---|
| Session | Simple, no prep stmt issues | 1 connection per client — defeats purpose | No |
| Transaction | High multiplexing, Prisma compatible | Prepared stmts must use `pgbouncer=true` DSN param | **Yes** |
| Statement | Maximum sharing | Breaks multi-statement transactions | No |

**Why transaction mode**: Prisma uses `BEGIN`/`COMMIT` transactions — transaction mode is compatible when `pgbouncer=true` is set in the DATABASE_URL. Prisma automatically disables prepared statements in pgbouncer mode.

```
DATABASE_URL=postgresql://user:pass@pgbouncer:5432/pmtl_db?pgbouncer=true&connection_limit=5
```

The `?pgbouncer=true` param tells Prisma to use simple query protocol (no prepared statements).
`connection_limit=5` = Prisma pool size per API process (tunable via `PRISMA_CONNECTION_LIMIT`).

---

## Connection math

```
max_connections (Postgres default) = 100

Reserve:
  - Superuser connections: 3
  - Admin/monitoring: 5
  - PgBouncer → Postgres: 15 (pool_size in pgbouncer.ini)
  - Direct connections (migrations, psql): 5
  Total reserved: 28

Available for PgBouncer: 72 (use 15 as pool_size — conservative, scale later)

Clients (app-facing):
  - default_pool_size = 15  (PgBouncer ↔ Postgres connections)
  - max_client_conn = 200   (client connections into PgBouncer)

Effect: 200 Prisma clients share 15 Postgres connections at any time
Multiplexing ratio: ~13x
```

---

## PgBouncer configuration

```ini
# infra/docker/pgbouncer/pgbouncer.ini

[databases]
pmtl_db = host=db port=5432 dbname=pmtl_db

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 5432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt

pool_mode = transaction
default_pool_size = 15
max_client_conn = 200
reserve_pool_size = 5          ; emergency connections when pool_size exhausted
reserve_pool_timeout = 5       ; seconds to wait before using reserve
server_idle_timeout = 600      ; close idle Postgres connections after 10 min
client_idle_timeout = 0        ; keep client connections indefinitely (Prisma manages)
server_connect_timeout = 15
server_login_retry = 2

; Logging
log_connections = 0
log_disconnections = 0
log_pooler_errors = 1
stats_period = 60              ; stats log every 60s

; Admin console
admin_users = pgbouncer_admin
stats_users = pgbouncer_stats
```

```
# infra/docker/pgbouncer/userlist.txt
# Format: "username" "scram-sha-256$<hash>"
# Generated via: psql -c "SELECT concat('\"', usename, '\" \"', passwd, '\"') FROM pg_shadow WHERE usename='pmtl_api'"
"pmtl_api" "scram-sha-256$<hash_from_postgres>"
```

---

## Docker Compose

```yaml
# infra/docker/docker-compose.pgbouncer.yml (override file)
services:
  pgbouncer:
    image: pgbouncer/pgbouncer:1.25.1
    volumes:
      - ./pgbouncer/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini:ro
      - ./pgbouncer/userlist.txt:/etc/pgbouncer/userlist.txt:ro
    environment:
      PGBOUNCER_INI: /etc/pgbouncer/pgbouncer.ini
    ports:
      - "5433:5432"  # expose on 5433 to avoid collision with direct Postgres access
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "psql", "-h", "localhost", "-U", "pgbouncer_admin", "-p", "5432", "pgbouncer", "-c", "SHOW stats;"]
      interval: 30s
      timeout: 5s
      retries: 3
    restart: unless-stopped
```

When PgBouncer is active:
- API `DATABASE_URL` points to `postgresql://pmtl_api:pass@pgbouncer:5432/pmtl_db?pgbouncer=true`
- Direct Postgres access (migrations, psql) uses `DATABASE_URL_DIRECT` pointing to `db:5432`

---

## Migration safety

Prisma migrations **must NOT use PgBouncer** — `prisma migrate deploy` uses DDL statements that require session-mode semantics.

```bash
# Migration command uses direct connection
DATABASE_URL=$DATABASE_URL_DIRECT pnpm prisma migrate deploy
```

`DATABASE_URL_DIRECT` bypasses PgBouncer — points directly to Postgres.

---

## Env vars

| Env | Phase | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | required | — | Active connection string (direct Phase 1, PgBouncer Phase 2+) |
| `DATABASE_URL_DIRECT` | Phase 2+ | — | Direct Postgres (migrations only) |
| `PRISMA_CONNECTION_LIMIT` | no | `5` | Prisma pool size per process |
| `PRISMA_POOL_TIMEOUT` | no | `10` | Seconds to wait for connection from Prisma pool |

When PgBouncer is not active, `DATABASE_URL` points directly to Postgres and `DATABASE_URL_DIRECT` is not needed.

---

## PgBouncer admin console

```bash
# Monitor pool usage
psql -h localhost -p 5433 -U pgbouncer_admin pgbouncer -c "SHOW pools;"
psql -h localhost -p 5433 -U pgbouncer_admin pgbouncer -c "SHOW stats;"
psql -h localhost -p 5433 -U pgbouncer_admin pgbouncer -c "SHOW clients;"
psql -h localhost -p 5433 -U pgbouncer_admin pgbouncer -c "SHOW servers;"

# Reload config after ini changes (no restart needed)
psql -h localhost -p 5433 -U pgbouncer_admin pgbouncer -c "RELOAD;"

# Kill all connections to a database (for emergency drain)
psql -h localhost -p 5433 -U pgbouncer_admin pgbouncer -c "KILL pmtl_db;"
```

---

## Failure mode: PgBouncer down

| Failure | Behavior |
|---|---|
| PgBouncer container crash | Prisma connections fail → HTTP 503 from API health check → Docker restarts PgBouncer |
| `max_client_conn` hit | PgBouncer returns `too many clients` → Prisma pool timeout → HTTP 503 |
| Network split between PgBouncer and Postgres | `server_connect_timeout` 15s → client connections rejected → API healthcheck fails |

Recovery: Docker `restart: unless-stopped` will restart PgBouncer automatically.
If manual intervention needed: `docker compose restart pgbouncer`

`/health/ready` does NOT depend on PgBouncer explicitly — it checks Prisma `SELECT 1` which implicitly validates the whole chain.

---

## Monitoring

| Metric | Source | Alert |
|---|---|---|
| `pmtl_pgbouncer_pool_used` | PgBouncer `SHOW pools` → Prometheus | > 80% of `pool_size` for > 5 min |
| `pmtl_pgbouncer_wait_time` | PgBouncer `SHOW stats` `avg_wait_time` | > 10ms → warn |
| `pmtl_pgbouncer_client_conn` | PgBouncer `SHOW clients` | > 150 (75% of max_client_conn) |
| Prisma pool_timeout errors | Pino structured log | Any occurrence → warn |

PgBouncer stats exposed to Prometheus via `pgbouncer-exporter` sidecar:
```yaml
# Addition to docker-compose.pgbouncer.yml
  pgbouncer-exporter:
    image: prometheuscommunity/pgbouncer-exporter:latest
    environment:
      DATA_SOURCE_NAME: "postgresql://pgbouncer_stats@pgbouncer:5432/pgbouncer?sslmode=disable"
    ports:
      - "9127:9127"
```

---

## Rollback

```bash
# Disable PgBouncer:
# 1. Change DATABASE_URL back to point directly to Postgres (db:5432)
# 2. Redeploy API with updated env
# 3. Stop PgBouncer container: docker compose stop pgbouncer

# No data loss — PgBouncer is transparent proxy
# In-flight queries complete normally when connections drain
```

---

## Code locations

| Artifact | Location |
|---|---|
| PgBouncer config | `infra/docker/pgbouncer/pgbouncer.ini` |
| User auth file | `infra/docker/pgbouncer/userlist.txt` |
| Docker Compose | `infra/docker/docker-compose.pgbouncer.yml` |
| Prometheus exporter | `infra/docker/docker-compose.pgbouncer.yml` (pgbouncer-exporter service) |
| Migration script | `infra/scripts/migrate.sh` — uses `DATABASE_URL_DIRECT` |

---

## Implementation proof criteria

| Check | Proof |
|---|---|
| PgBouncer routes traffic | `SHOW pools` shows active connections, `cl_active > 0` |
| Prisma compatible | API queries work end-to-end with `?pgbouncer=true` DSN |
| Transaction mode correct | Multi-statement transaction (BEGIN/COMMIT) completes without error |
| Migrations bypass PgBouncer | `migrate deploy` uses `DATABASE_URL_DIRECT`, schema changes applied |
| Pool multiplexing | 20 concurrent API requests → PgBouncer shows ≤ 15 server connections |
| Failure recovery | Stop PgBouncer → Docker restarts it within 30s, API resumes serving |
| Stats visible | `SHOW stats` returns meaningful `avg_query_time`, `total_xact_count` |
