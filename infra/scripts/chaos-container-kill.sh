#!/bin/bash
# Chaos test: Container kill and recovery
# Enterprise 2026 requirement: Test restart resilience

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

TARGET_CONTAINER="${1:-pmtl-api}"
DRY_RUN="${DRY_RUN:-false}"

log_info "Starting container kill chaos test"
log_info "Target: $TARGET_CONTAINER"

if [ "$DRY_RUN" = "true" ]; then
  log_info "[DRY_RUN] Would kill and restart $TARGET_CONTAINER"
  exit 0
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${TARGET_CONTAINER}$"; then
  log_error "Container $TARGET_CONTAINER not found"
  exit 1
fi

# Record start time
START_TIME=$(date +%s)

# Kill container
log_info "Killing container..."
docker kill "$TARGET_CONTAINER"

# Wait for Docker Compose to restart it (restart: unless-stopped)
log_info "Waiting for automatic restart..."
MAX_WAIT=60
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
  if docker ps --format '{{.Names}}' | grep -q "^${TARGET_CONTAINER}$"; then
    log_success "Container restarted after ${ELAPSED}s"
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  log_error "Container did not restart within ${MAX_WAIT}s"
  exit 1
fi

# Wait for health check
log_info "Waiting for health check..."
MAX_HEALTH_WAIT=60
HEALTH_ELAPSED=0

while [ $HEALTH_ELAPSED -lt $MAX_HEALTH_WAIT ]; do
  if docker exec "$TARGET_CONTAINER" sh -c "wget -q --spider http://localhost:3001/api/health/ready" 2>/dev/null; then
    log_success "Service healthy after ${HEALTH_ELAPSED}s"
    break
  fi
  sleep 2
  HEALTH_ELAPSED=$((HEALTH_ELAPSED + 2))
done

if [ $HEALTH_ELAPSED -ge $MAX_HEALTH_WAIT ]; then
  log_error "Service did not become healthy within ${MAX_HEALTH_WAIT}s"
  exit 1
fi

END_TIME=$(date +%s)
TOTAL_RECOVERY=$((END_TIME - START_TIME))

log_success "Container kill test completed - Total recovery time: ${TOTAL_RECOVERY}s"
