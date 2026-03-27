# VPS Deployment Canon

File này chốt deployment model cho PMTL_VN trên **VPS self-host** (không dùng Render, Railway, Fly.io, AWS, GCP, Oracle Cloud).
Target: solo sinh viên, VPS VN hoặc gần VN, ngân sách thấp, domain sẵn.

> **Backup/restore chi tiết**: `./BACKUP_RECOVERY_VPS.md`
> **Docker Compose template**: `./DOCKER_PROD_COMPOSE.md`
> **Caddy config**: `./CADDY_PROD_CONFIG.md`
> **Monitoring**: `./MONITORING_SELF_HOST.md`
> **Chi phí**: `./COST_ZERO_VPS_GUIDE.md`
> **Security**: `./SECURITY_VPS_CANON.md`

---

## VPS architecture overview

```mermaid
graph TB
  subgraph Internet
    User["User / Browser"]
    CF["Cloudflare Free\n(WAF + CDN + Free SSL)"]
  end

  subgraph VPS["VPS (Ubuntu 22.04 LTS)"]
    subgraph Docker["Docker Compose Network"]
      Caddy["Caddy\n:80/:443\n(Auto SSL via CF or Let's Encrypt)"]
      Web["apps/web\n(Next.js :3000)"]
      Admin["apps/admin\n(Vite :3001)"]
      API["apps/api\n(NestJS :3002)"]
      PG[("Postgres 16\n:5432")]
      Meili["Meilisearch\n:7700"]
      UK["Uptime Kuma\n:3003"]
    end
    Cron["cron: pg_dump\n(daily backup)"]
    Backup["/backups/\n(local + remote sync)"]
  end

  User --> CF
  CF -->|"proxy"| Caddy
  Caddy -->|"/ → :3000"| Web
  Caddy -->|"/api → :3002"| API
  Caddy -->|"/admin → :3001"| Admin
  API --> PG
  API --> Meili
  Cron --> PG
  Cron --> Backup
```

---

## VPS provider recommendations (VN-friendly, thấp giá)

| Provider | Giá tham khảo | Vị trí | Ghi chú |
|---|---|---|---|
| **BizFly Cloud** (VCCorp) | ~80-150k VND/tháng | Hà Nội / HCM | Thanh toán VND, hỗ trợ tiếng Việt |
| **ViettelCloud** | ~100-200k VND/tháng | Hà Nội / HCM | Viettel backbone, ổn định |
| **VNPT Cloud** | ~80-150k VND/tháng | Hà Nội / HCM | VNPT datacenter |
| **Vultr Singapore** | ~$6 USD/tháng (~155k VND) | Singapore | Latency thấp từ VN, SSD NVMe |
| **DigitalOcean Singapore** | ~$6 USD/tháng | Singapore | Docs tốt, beginner-friendly |
| **Hetzner Helsinki** | ~€4/tháng (~108k VND) | Finland | Rẻ nhất, latency cao hơn chút |

**Khuyến nghị cho sinh viên VN**: BizFly Cloud hoặc Vultr Singapore.

---

## Minimum VPS specs cho Phase 1

| Spec | Minimum | Recommended |
|---|---|---|
| vCPU | 1 core | 2 cores |
| RAM | 1 GB | 2 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| Bandwidth | 1 TB/tháng | 2 TB/tháng |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

RAM 1 GB có thể chạy được nếu tắt Prometheus/Grafana và chỉ dùng Uptime Kuma.
RAM 2 GB là comfortable: Postgres + NestJS + Next.js + Meilisearch + Caddy.

---

## Bootstrap VPS từ đầu (thứ tự bắt buộc)

```bash
# 1. SSH vào VPS mới
ssh root@your-vps-ip

# 2. Tạo non-root user
adduser pmtl
usermod -aG sudo pmtl
su - pmtl

# 3. Cài Docker + Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker pmtl
# logout và login lại để group có hiệu lực

# 4. Clone repo
git clone https://github.com/your-org/pmtl_vn.git /opt/pmtl
cd /opt/pmtl

# 5. Copy env
cp infra/docker/.env.production.example infra/docker/.env.production
# Edit .env.production với secrets thật

# 6. Chạy production
docker compose -f infra/docker/docker-compose.prod.yml up -d

# 7. Verify
docker compose ps
curl http://localhost:3002/health/live
```

---

## Deploy workflow sau khi đã có VPS

```mermaid
sequenceDiagram
  participant Dev as Dev (local)
  participant GH as GitHub
  participant VPS as VPS

  Dev->>GH: git push main
  GH->>GH: CI: lint → typecheck → test → docker build
  GH->>GH: Push image to GitHub Container Registry (free)
  Dev->>VPS: ssh pmtl@vps (hoặc GitHub Actions)
  VPS->>VPS: docker compose pull
  VPS->>VPS: docker compose up -d --no-deps api web admin
  VPS->>VPS: docker compose exec api pnpm prisma migrate deploy
  VPS-->>Dev: health check pass → done
```

---

## Production checklist trước khi go live

- [ ] `.env.production` đã fill đủ tất cả secrets (không dùng defaults)
- [ ] `DIRECT_DATABASE_URL` và `DATABASE_URL` riêng biệt trong `.env.production`
- [ ] Caddy chạy và có SSL certificate (kiểm tra https://pmtl.vn)
- [ ] `/health/live`, `/health/ready`, `/health/startup` return 200
- [ ] `/metrics` endpoint hoạt động
- [ ] `pg_dump` cron đã chạy ít nhất 1 lần và dump file tồn tại
- [ ] Uptime Kuma đang monitor và Telegram alert hoạt động
- [ ] Restore drill đã pass (xem `RESTORE_DRILL_LOG.md`)
- [ ] `audit_logs` table đã có ít nhất 1 row sau test login
- [ ] Rate limit guard hoạt động (test curl auth endpoint nhiều lần)

---

## Environment variables bắt buộc cho VPS

Xem đầy đủ tại `design/04-execution-overlay/repo/ENV_INVENTORY.md`.
Các biến KHÔNG được để default trên production:

```
DATABASE_URL=postgresql://user:STRONG_PASS@postgres:5432/pmtl_prod
DIRECT_DATABASE_URL=postgresql://user:STRONG_PASS@postgres:5432/pmtl_prod
JWT_SECRET=<min 64 chars random>
JWT_REFRESH_SECRET=<min 64 chars random>
SESSION_SECRET=<min 64 chars random>
MEILISEARCH_API_KEY=<strong random key>
STORAGE_PATH=/data/media
NODE_ENV=production
```

---

## Không được dùng trên VPS này

- `pgvector` — explicit exclusion, xem `PGVECTOR_DECISION.md`
- Public upload không có MIME sniffing — xem `SECURITY_VPS_CANON.md`
- Queue/worker trước khi có idempotency policy
- Bất kỳ managed cloud service nào (Render, Railway, AWS, GCP…)
