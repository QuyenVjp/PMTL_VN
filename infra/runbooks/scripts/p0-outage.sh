#!/usr/bin/env sh
# p0-outage.sh — P0 platform outage triage and recovery.
# Run this FIRST when Uptime Kuma fires or /api/health/live is down.
set -eu
LOG="/tmp/pmtl-p0-$(date +%Y%m%d-%H%M%S).log"
CF="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
EF="${ENV_FILE:-infra/docker/.env.prod}"
log() { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG"; }

log "=== P0 OUTAGE TRIAGE START ==="
log "Log: $LOG"

# Step 1: Container health
log ""
log "[1/5] Container status:"
docker compose --env-file "$EF" -f "$CF" ps 2>&1 | tee -a "$LOG"

# Step 2: Recent errors (last 100 lines from each service)
log ""
log "[2/5] Recent api errors:"
docker compose --env-file "$EF" -f "$CF" logs --tail=50 api 2>&1 | grep -iE "error|fatal|exception|ECONNREFUSED" | tail -20 | tee -a "$LOG" || true

log "Recent web errors:"
docker compose --env-file "$EF" -f "$CF" logs --tail=30 web 2>&1 | grep -iE "error|fatal" | tail -10 | tee -a "$LOG" || true

# Step 3: Disk + memory
log ""
log "[3/5] System resources:"
df -h / 2>&1 | tee -a "$LOG"
free -h 2>&1 | tee -a "$LOG" || true

# Step 4: Health check
log ""
log "[4/5] Health check:"
curl -sf http://localhost:3001/api/health/live 2>&1 | tee -a "$LOG" && log "✓ API live" || log "✗ API DOWN"
curl -sf http://localhost:3001/api/health/ready 2>&1 | tee -a "$LOG" && log "✓ API ready" || log "✗ API NOT READY"

# Step 5: Auto-restart unhealthy containers
log ""
log "[5/5] Restarting unhealthy services..."
UNHEALTHY=$(docker compose --env-file "$EF" -f "$CF" ps --filter "health=unhealthy" --format "{{.Service}}" 2>/dev/null || true)
if [ -n "$UNHEALTHY" ]; then
  log "Unhealthy: $UNHEALTHY — restarting..."
  docker compose --env-file "$EF" -f "$CF" restart $UNHEALTHY 2>&1 | tee -a "$LOG"
  sleep 5
  curl -sf http://localhost:3001/api/health/live && log "✓ Recovered!" || log "✗ Still down — manual intervention required."
else
  log "No unhealthy containers detected. Check Caddy/network layer."
fi

log ""
log "=== P0 TRIAGE END === Log saved: $LOG"
