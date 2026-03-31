#!/usr/bin/env sh
# secret-rotate.sh — Rotate a specific secret in .env.prod, revoke sessions, restart.
# Usage: bash infra/runbooks/scripts/secret-rotate.sh [jwt|postgres|meilisearch|all]
set -eu
CF="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
EF="${ENV_FILE:-infra/docker/.env.prod}"
TARGET="${1:-jwt}"

echo "=== SECRET ROTATE: $TARGET ==="
echo "WARNING: JWT rotation invalidates ALL active user sessions."
printf "Continue? (yes/no): "
read -r CONFIRM
[ "$CONFIRM" = "yes" ] || { echo "Aborted."; exit 1; }

# Helper: generate 64-char random hex secret
gen_secret() { head -c 32 /dev/urandom | od -A n -t x1 | tr -d ' \n' | head -c 64; }

rotate_jwt() {
  echo "[JWT] Generating new access + refresh secrets..."
  NEW_ACCESS="$(gen_secret)"
  NEW_REFRESH="$(gen_secret)"

  # Update .env.prod (backup first)
  cp "$EF" "${EF}.bak-$(date +%Y%m%d-%H%M%S)"
  sed -i "s/^JWT_ACCESS_SECRET=.*/JWT_ACCESS_SECRET=${NEW_ACCESS}/" "$EF"
  sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=${NEW_REFRESH}/" "$EF"
  echo "  ✓ Secrets updated in $EF"

  # Revoke all active sessions in DB
  echo "[JWT] Revoking all active sessions..."
  docker compose --env-file "$EF" -f "$CF" exec -T postgres \
    psql -U "${POSTGRES_USER:-pmtl}" -d "${POSTGRES_DB:-pmtl}" -c \
    "UPDATE sessions SET revoked_at = NOW() WHERE revoked_at IS NULL;" 2>&1 \
    || echo "  WARNING: Could not revoke sessions — DB may be down"
  echo "  ✓ Sessions revoked (all users will need to log in again)"

  # Restart API to pick up new secrets
  echo "[JWT] Restarting API..."
  docker compose --env-file "$EF" -f "$CF" up -d --no-deps api
  sleep 3
  curl -sf http://localhost:3001/api/health/live && echo "  ✓ API healthy" || echo "  ✗ API unhealthy — check logs"
}

rotate_postgres() {
  NEW_PW="$(gen_secret | head -c 32)"
  cp "$EF" "${EF}.bak-$(date +%Y%m%d-%H%M%S)"

  echo "[POSTGRES] Updating password in Postgres..."
  docker compose --env-file "$EF" -f "$CF" exec -T postgres \
    psql -U "${POSTGRES_USER:-pmtl}" -c "ALTER USER \"${POSTGRES_USER:-pmtl}\" WITH PASSWORD '${NEW_PW}';"
  echo "  ✓ Password changed in Postgres"

  sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${NEW_PW}/" "$EF"
  # Also update DATABASE_URL
  sed -i "s|postgresql://[^:]*:[^@]*@|postgresql://${POSTGRES_USER:-pmtl}:${NEW_PW}@|g" "$EF"
  echo "  ✓ .env.prod updated"

  echo "[POSTGRES] Restarting API to pick up new URL..."
  docker compose --env-file "$EF" -f "$CF" up -d --no-deps api
}

rotate_meilisearch() {
  NEW_KEY="$(gen_secret)"
  cp "$EF" "${EF}.bak-$(date +%Y%m%d-%H%M%S)"
  sed -i "s/^MEILI_MASTER_KEY=.*/MEILI_MASTER_KEY=${NEW_KEY}/" "$EF"
  sed -i "s/^MEILISEARCH_API_KEY=.*/MEILISEARCH_API_KEY=${NEW_KEY}/" "$EF"
  echo "  ✓ Meilisearch key updated"
  docker compose --env-file "$EF" -f "$CF" up -d --no-deps meilisearch api
  echo "  ✓ Meilisearch + API restarted"
}

case "$TARGET" in
  jwt) rotate_jwt ;;
  postgres) rotate_postgres ;;
  meilisearch) rotate_meilisearch ;;
  all)
    rotate_jwt
    rotate_postgres
    rotate_meilisearch
    ;;
  *)
    echo "Usage: $0 [jwt|postgres|meilisearch|all]"
    exit 1
    ;;
esac

echo ""
echo "=== Rotation complete. Update $EF permissions: chmod 600 $EF ==="
chmod 600 "$EF"
