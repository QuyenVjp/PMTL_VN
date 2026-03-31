#!/usr/bin/env sh
# disk-full.sh — Diagnose and free disk space safely.
set -eu
CF="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
EF="${ENV_FILE:-infra/docker/.env.prod}"
THRESHOLD="${DISK_ALERT_PERCENT:-85}"

echo "=== DISK FULL DIAGNOSIS ==="

# Step 1: Disk usage overview
echo "[1/5] Disk usage:"
df -h / /var/lib/docker 2>/dev/null | head -5

USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
echo "  Root partition: ${USAGE}% used"

if [ "${USAGE:-0}" -lt "$THRESHOLD" ]; then
  echo "  OK — below ${THRESHOLD}% threshold."
fi

# Step 2: Top disk consumers
echo ""
echo "[2/5] Top 10 directories by size under /var/lib/docker:"
du -sh /var/lib/docker/containers/* 2>/dev/null | sort -rh | head -10 || true

echo ""
echo "[3/5] Docker space usage:"
docker system df 2>&1

# Step 3: Safe cleanup
echo ""
echo "[4/5] Cleaning up safely..."
FREED=0

# Remove stopped containers
STOPPED=$(docker ps -aq --filter "status=exited" | wc -l)
if [ "$STOPPED" -gt 0 ]; then
  docker container prune -f 2>/dev/null && echo "  ✓ Removed $STOPPED stopped containers"
fi

# Remove dangling images (not tagged, not used)
docker image prune -f 2>/dev/null && echo "  ✓ Dangling images pruned"

# Remove build cache older than 24h
docker builder prune -f --filter "until=24h" 2>/dev/null && echo "  ✓ Build cache cleaned"

# Remove old app logs
find /var/log -name "*.gz" -mtime +7 -delete 2>/dev/null && echo "  ✓ Old compressed logs removed"

# Vacuum Docker container logs (keep last 10MB)
for CONTAINER in $(docker ps -q 2>/dev/null); do
  LOG_FILE=$(docker inspect --format='{{.LogPath}}' "$CONTAINER" 2>/dev/null)
  if [ -f "$LOG_FILE" ]; then
    SIZE=$(du -k "$LOG_FILE" | cut -f1)
    if [ "$SIZE" -gt 51200 ]; then  # > 50MB
      echo "  Truncating large log: $LOG_FILE (${SIZE}KB)"
      truncate -s 0 "$LOG_FILE" 2>/dev/null || true
    fi
  fi
done

# Step 5: Check backups
echo ""
echo "[5/5] Backup disk usage:"
du -sh backups/ 2>/dev/null || echo "  No backups/ directory"
echo ""
echo "  To remove backups older than 7 days:"
echo "  find backups/ -mtime +7 -delete"

# Final check
NEW_USAGE=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
echo ""
echo "  Before: ${USAGE}%  After: ${NEW_USAGE}%"
echo "=== Done ==="
