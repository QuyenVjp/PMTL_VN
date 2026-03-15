# Monitoring

Stack toi thieu hien tai:
- Prometheus
- Alertmanager
- Grafana
- blackbox-exporter
- postgres-exporter
- redis-exporter

Muc tieu:
- scrape health va exporter metrics nhe cho VPS 4GB
- GUI co san qua Grafana provisioning
- alert critical qua Telegram bot

Files:
- `prometheus.yml`: scrape jobs
- `alerts.yml`: alert rules
- `alertmanager.yml`: Telegram receiver
- `blackbox.yml`: HTTP probe module
- `grafana/`: datasource + dashboard provisioning

Runtime notes:
- Grafana, Prometheus, Alertmanager chi bind `127.0.0.1`
- Worker duoc monitor qua `cms:/api/worker/health` va `cms:/api/metrics/worker`
- Caddy khong public cac monitoring endpoints nay

