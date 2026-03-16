# Monitoring

Stack toi thieu, usable that cho VPS 4GB:
- Prometheus
- Alertmanager
- Grafana
- blackbox-exporter
- postgres-exporter
- redis-exporter
- node-exporter
- Sentry Cloud cho exception va error logs

Muc tieu:
- scrape du health, traffic, 5xx, worker state, RAM, disk, CPU ma khong can Loki
- GUI co san qua Grafana provisioning
- alert critical qua Telegram bot
- public surface toi thieu: monitoring ports bind localhost only, route nhay cam bi Caddy chan

Files:
- `prometheus.yml`: scrape jobs cho Caddy, blackbox, exporters, worker metrics
- `alerts.yml`: alert rules cho host pressure, web 5xx, worker stale, postgres/redis
- `alertmanager.yml`: Telegram receiver
- `blackbox.yml`: HTTP probe module
- `grafana/`: datasource + dashboard provisioning

Runtime notes:
- Grafana, Prometheus, Alertmanager chi bind `127.0.0.1`
- Worker duoc monitor qua `cms:/api/worker/health` va `cms:/api/metrics/worker`
- Caddy metrics lay tu admin endpoint noi bo `caddy:2019/metrics`
- Caddy khong public `api/metrics/*`, `api/worker/health`, `api/internal/monitoring/*`
- Web/CMS co internal Sentry test routes duoc bao ve bang `MONITORING_TEST_SECRET`
- Dung `pnpm monitoring:test` de verify Prometheus targets, Sentry test routes, va worker-down alert pipeline

