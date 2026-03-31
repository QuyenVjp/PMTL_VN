#!/usr/bin/env sh
# oom-kill.sh — Diagnose and recover from OOM-killed containers.
set -eu
CF="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
EF="${ENV_FILE:-infra/docker/.env.prod}"

echo "=== OOM KILL DIAGNOSIS ==="

# Step 1: Current stats
echo "[1/4] Container memory stats:"
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}" 2>&1

# Step 2: Find OOM victims
echo ""
echo "[2/4] Checking for OOM-killed containers:"
for SERVICE in api web admin caddy postgres meilisearch redis; do
  CONTAINER=$(docker compose --env-file "$EF" -f "$CF" ps -q "$SERVICE" 2>/dev/null || true)
  [ -z "$CONTAINER" ] && continue
  OOM=$(docker inspect "$CONTAINER" --format '{{.State.OOMKilled}}' 2>/dev/null || echo "false")
  STATUS=$(docker inspect "$CONTAINER" --format '{{.State.Status}}' 2>/dev/null || echo "unknown")
  EXIT=$(docker inspect "$CONTAINER" --format '{{.State.ExitCode}}' 2>/dev/null || echo "?")
  echo "  $SERVICE: status=$STATUS oom_killed=$OOM exit_code=$EXIT"
done

# Step 3: System memory
echo ""
echo "[3/4] Host memory:"
free -h 2>/dev/null || cat /proc/meminfo | grep -E "MemTotal|MemFree|MemAvailable|Buffers|Cached" 2>/dev/null || true

# Step 4: Restart OOM-killed containers
echo ""
echo "[4/4] Restarting any crashed services..."
docker compose --env-file "$EF" -f "$CF" up -d --no-deps --remove-orphans 2>&1 | tail -5

echo ""
echo "=== Recovery notes ==="
echo "  - To increase API mem_limit: edit infra/docker/compose.prod.yml → web/api mem_limit"
echo "  - Current limits: api=1024m, web=1024m, postgres=512m"
echo "  - After limit change: docker compose up -d --no-deps <service>"
echo "  - To debug heap: docker exec <api_container> node -e 'console.log(process.memoryUsage())'"
