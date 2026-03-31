#!/usr/bin/env sh
# ddos-mitigate.sh — Detect traffic spike and activate Cloudflare Under Attack Mode.
# Requires: CLOUDFLARE_ZONE_ID and CLOUDFLARE_API_TOKEN env vars or in .env.prod.
set -eu

# Load env if needed
if [ -f "${ENV_FILE:-infra/docker/.env.prod}" ]; then
  # shellcheck disable=SC1090
  . "${ENV_FILE:-infra/docker/.env.prod}" 2>/dev/null || true
fi

CF_ZONE="${CLOUDFLARE_ZONE_ID:-}"
CF_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
CF="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
EF="${ENV_FILE:-infra/docker/.env.prod}"
ACTION="${1:-status}"  # status | attack | normal | block-ip

echo "=== DDoS MITIGATION === Action: $ACTION"

case "$ACTION" in
  status)
    echo "[1] Top 20 source IPs in last 1000 Caddy log lines:"
    docker compose --env-file "$EF" -f "$CF" logs --tail=1000 caddy 2>/dev/null \
      | grep -oE '"remote_ip":"[^"]*"' \
      | sort | uniq -c | sort -rn | head -20 || echo "  (no Caddy logs found)"
    ;;

  attack)
    [ -z "$CF_ZONE" ] && { echo "ERROR: CLOUDFLARE_ZONE_ID not set"; exit 1; }
    [ -z "$CF_TOKEN" ] && { echo "ERROR: CLOUDFLARE_API_TOKEN not set"; exit 1; }
    echo "[1] Activating Cloudflare Under Attack Mode..."
    curl -s -X PATCH \
      "https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/settings/security_level" \
      -H "Authorization: Bearer ${CF_TOKEN}" \
      -H "Content-Type: application/json" \
      --data '{"value":"under_attack"}' | grep -o '"success":[^,}]*'
    echo ""
    echo "  ✓ Under Attack Mode ACTIVE. Monitor and run '$0 normal' when safe."
    ;;

  normal)
    [ -z "$CF_ZONE" ] && { echo "ERROR: CLOUDFLARE_ZONE_ID not set"; exit 1; }
    [ -z "$CF_TOKEN" ] && { echo "ERROR: CLOUDFLARE_API_TOKEN not set"; exit 1; }
    echo "[1] Reverting to Medium security level..."
    curl -s -X PATCH \
      "https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/settings/security_level" \
      -H "Authorization: Bearer ${CF_TOKEN}" \
      -H "Content-Type: application/json" \
      --data '{"value":"medium"}' | grep -o '"success":[^,}]*'
    echo ""
    echo "  ✓ Reverted to Medium."
    ;;

  block-ip)
    IP="${2:-}"
    [ -z "$IP" ] && { echo "Usage: $0 block-ip <IP_ADDRESS>"; exit 1; }
    [ -z "$CF_ZONE" ] && { echo "ERROR: CLOUDFLARE_ZONE_ID not set"; exit 1; }
    [ -z "$CF_TOKEN" ] && { echo "ERROR: CLOUDFLARE_API_TOKEN not set"; exit 1; }
    echo "[1] Blocking IP $IP via Cloudflare WAF rule..."
    curl -s -X POST \
      "https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/firewall/access_rules/rules" \
      -H "Authorization: Bearer ${CF_TOKEN}" \
      -H "Content-Type: application/json" \
      --data "{\"mode\":\"block\",\"configuration\":{\"target\":\"ip\",\"value\":\"${IP}\"},\"notes\":\"DDoS block $(date)\"}" \
      | grep -o '"success":[^,}]*'
    echo ""
    echo "  ✓ IP $IP blocked."
    ;;

  *)
    echo "Usage: $0 [status|attack|normal|block-ip <IP>]"
    exit 1
    ;;
esac

echo "=== Done ==="
