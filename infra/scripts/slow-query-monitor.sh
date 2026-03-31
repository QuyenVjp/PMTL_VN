#!/usr/bin/env sh
# slow-query-monitor.sh — Dump top slow queries from pg_stat_statements
# and alert via Telegram if any query exceeds threshold.
#
# Usage (manual):
#   bash infra/scripts/slow-query-monitor.sh
#
# Usage (cron — see compose.prod.yml cron-jobs service):
#   Runs automatically daily at 02:30 UTC via Docker Compose cron container.
#
# Env vars:
#   POSTGRES_USER          (required)
#   POSTGRES_DB            (required)
#   SLOW_QUERY_THRESHOLD_MS  default: 1000 (1 second)
#   TOP_N_QUERIES            default: 50
#   TELEGRAM_BOT_TOKEN       optional — alert if set
#   TELEGRAM_CHAT_ID         optional — alert if set
#   ENV_FILE                 default: infra/docker/.env.prod
#   COMPOSE_FILE             default: infra/docker/compose.prod.yml

set -eu

ENV_FILE="${ENV_FILE:-infra/docker/.env.prod}"
COMPOSE_FILE="${COMPOSE_FILE:-infra/docker/compose.prod.yml}"
THRESHOLD_MS="${SLOW_QUERY_THRESHOLD_MS:-1000}"
TOP_N="${TOP_N_QUERIES:-50}"
REPORT_DIR="${REPORT_DIR:-/tmp/pmtl-slow-queries}"
timestamp="$(date +%Y%m%d-%H%M%S)"
REPORT_FILE="$REPORT_DIR/slow-queries-${timestamp}.txt"

mkdir -p "$REPORT_DIR"

echo "=== PMTL Slow Query Monitor — $(date) ==="
echo "Threshold: ${THRESHOLD_MS}ms | Top: ${TOP_N}"
echo ""

# ── Collect top slow queries ───────────────────────────────────────────────────
SLOW_QUERY_SQL="
SELECT
  round(mean_exec_time::numeric, 2) AS mean_ms,
  round(max_exec_time::numeric, 2)  AS max_ms,
  round(total_exec_time::numeric, 2) AS total_ms,
  calls,
  rows,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS pct_of_total,
  left(query, 200) AS query_preview
FROM pg_stat_statements
WHERE mean_exec_time > ${THRESHOLD_MS}
ORDER BY mean_exec_time DESC
LIMIT ${TOP_N};
"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  psql -U "${POSTGRES_USER:-pmtl}" -d "${POSTGRES_DB:-pmtl}" \
  --no-align --tuples-only -c "$SLOW_QUERY_SQL" > "$REPORT_FILE" 2>&1

SLOW_COUNT=$(wc -l < "$REPORT_FILE" | tr -d ' ')
echo "Slow queries found (>${THRESHOLD_MS}ms): $SLOW_COUNT"
echo "Report: $REPORT_FILE"
echo ""

if [ "$SLOW_COUNT" -eq 0 ]; then
  echo "✓ No slow queries above threshold."
  exit 0
fi

# ── Print report ───────────────────────────────────────────────────────────────
echo "--- Top slow queries ---"
cat "$REPORT_FILE"
echo ""

# ── Index recommendations ──────────────────────────────────────────────────────
echo "--- Index candidates (seq scans on large tables) ---"
INDEX_SQL="
SELECT
  relname AS table_name,
  seq_scan,
  idx_scan,
  round(seq_tup_read::numeric / NULLIF(seq_scan, 0), 0) AS avg_rows_per_seqscan,
  n_live_tup AS live_rows
FROM pg_stat_user_tables
WHERE seq_scan > 100
  AND idx_scan < seq_scan
  AND n_live_tup > 1000
ORDER BY seq_scan DESC
LIMIT 10;
"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  psql -U "${POSTGRES_USER:-pmtl}" -d "${POSTGRES_DB:-pmtl}" \
  -c "$INDEX_SQL" 2>&1 || true
echo ""

# ── Telegram alert ────────────────────────────────────────────────────────────
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
  MSG="🐢 *PMTL Slow Query Alert*
Date: $(date '+%Y-%m-%d %H:%M')
Slow queries (>${THRESHOLD_MS}ms): *${SLOW_COUNT}*
Server: $(hostname)
Report: \`$REPORT_FILE\`

Top 3:
\`\`\`
$(head -3 "$REPORT_FILE")
\`\`\`"

  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d "chat_id=${TELEGRAM_CHAT_ID}" \
    -d "parse_mode=Markdown" \
    --data-urlencode "text=${MSG}" > /dev/null && echo "✓ Telegram alert sent."
fi

echo "=== Done ==="
