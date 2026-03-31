#!/bin/bash
# Chaos test: Network partition simulation
# Enterprise 2026 requirement: Test resilience under network failure

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Configuration
TARGET_CONTAINER="${1:-pmtl-api}"
DURATION="${2:-30}" # seconds
DRY_RUN="${DRY_RUN:-false}"

log_info "Starting network partition chaos test"
log_info "Target: $TARGET_CONTAINER, Duration: ${DURATION}s"

if [ "$DRY_RUN" = "true" ]; then
  log_info "[DRY_RUN] Would partition network for $TARGET_CONTAINER"
  exit 0
fi

# Check if container exists
if ! docker ps --format '{{.Names}}' | grep -q "^${TARGET_CONTAINER}$"; then
  log_error "Container $TARGET_CONTAINER not found"
  exit 1
fi

# Create network partition using iptables in container
log_info "Creating network partition..."
docker exec "$TARGET_CONTAINER" sh -c "
  # Block all outgoing traffic except loopback
  iptables -I OUTPUT -o lo -j ACCEPT || true
  iptables -I OUTPUT -j DROP || true
" || log_warn "Failed to apply iptables (container may not have iptables)"

log_info "Network partition active for ${DURATION}s"
sleep "$DURATION"

# Restore network
log_info "Restoring network connectivity..."
docker exec "$TARGET_CONTAINER" sh -c "
  # Remove DROP rules
  iptables -D OUTPUT -j DROP || true
  iptables -D OUTPUT -o lo -j ACCEPT || true
" || log_warn "Failed to remove iptables rules"

log_success "Network partition test completed"

# Check if service recovered
sleep 5
if docker exec "$TARGET_CONTAINER" sh -c "wget -q --spider http://localhost:3001/api/health/live"; then
  log_success "Service recovered successfully"
else
  log_error "Service did not recover - manual intervention required"
  exit 1
fi
