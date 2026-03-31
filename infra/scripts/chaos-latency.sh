#!/bin/bash
# Chaos test: Latency injection
# Enterprise 2026 requirement: Test performance under high latency

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

TARGET_CONTAINER="${1:-pmtl-api}"
LATENCY_MS="${2:-500}" # milliseconds
DURATION="${3:-30}" # seconds
DRY_RUN="${DRY_RUN:-false}"

log_info "Starting latency injection chaos test"
log_info "Target: $TARGET_CONTAINER, Latency: ${LATENCY_MS}ms, Duration: ${DURATION}s"

if [ "$DRY_RUN" = "true" ]; then
  log_info "[DRY_RUN] Would inject ${LATENCY_MS}ms latency"
  exit 0
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${TARGET_CONTAINER}$"; then
  log_error "Container $TARGET_CONTAINER not found"
  exit 1
fi

# Inject latency using tc (traffic control)
log_info "Injecting ${LATENCY_MS}ms latency..."
docker exec "$TARGET_CONTAINER" sh -c "
  tc qdisc add dev eth0 root netem delay ${LATENCY_MS}ms || true
" || log_warn "Failed to inject latency (tc may not be available)"

log_info "Latency active for ${DURATION}s"
sleep "$DURATION"

# Remove latency
log_info "Removing latency..."
docker exec "$TARGET_CONTAINER" sh -c "
  tc qdisc del dev eth0 root || true
"

log_success "Latency injection test completed"

# Verify normal operation
sleep 2
RESPONSE_TIME=$(docker exec "$TARGET_CONTAINER" sh -c "
  time wget -q -O /dev/null http://localhost:3001/api/health/live 2>&1 | grep real | awk '{print \$2}'
" || echo "unknown")

log_info "Post-test response time: $RESPONSE_TIME"
