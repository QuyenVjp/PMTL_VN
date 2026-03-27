# vps-runtime/

VPS self-host deployment canon cho PMTL_VN. Target: solo sinh viên, VPS VN hoặc Singapore, ngân sách ~100-200k VND/tháng, domain sẵn.

**Không dùng**: Render, Railway, Fly.io, AWS, GCP, Oracle Cloud.

## Files

| File | Nội dung |
|---|---|
| `VPS_DEPLOYMENT_CANON.md` | Architecture overview, provider list, bootstrap sequence, deploy workflow |
| `DOCKER_PROD_COMPOSE.md` | docker-compose.prod.yml template, multi-stage Dockerfile, deploy commands |
| `CADDY_PROD_CONFIG.md` | Caddyfile template, DNS/Cloudflare setup, SSL options |
| `MONITORING_SELF_HOST.md` | Uptime Kuma + Prometheus + Grafana + Loki + Telegram alert |
| `BACKUP_RECOVERY_VPS.md` | pg_dump cron, remote sync B2/R2, 1-click restore script |
| `SECURITY_VPS_CANON.md` | OS hardening, Docker security, OWASP checklist, rate limit |
| `COST_ZERO_VPS_GUIDE.md` | Free services map, RAM optimization, GitHub Actions CI/CD |

## Quick read order

1. `COST_ZERO_VPS_GUIDE.md` — chọn provider + free services
2. `VPS_DEPLOYMENT_CANON.md` — bootstrap VPS từ đầu
3. `DOCKER_PROD_COMPOSE.md` — cấu hình containers
4. `CADDY_PROD_CONFIG.md` — SSL + routing
5. `SECURITY_VPS_CANON.md` — hardening trước khi go live
6. `BACKUP_RECOVERY_VPS.md` — cron backup + restore drill
7. `MONITORING_SELF_HOST.md` — alert khi có vấn đề
