# PMTL_VN

Monorepo cho dự án web dùng Next.js 16, Payload CMS, PostgreSQL, Meilisearch, Caddy và Docker Compose.

## Mục tiêu kiến trúc

- Rõ domain, rõ trách nhiệm từng file.
- Solo developer có thể sửa nhanh, AI đọc vào hiểu ngay điểm cần thay đổi.
- Giai đoạn 1 chạy gọn với `web + cms + postgres + meilisearch + caddy`.
- Giai đoạn 2 hiện đã bật `redis + worker + BullMQ` cho search sync, moderation notification, push dispatch và email notification.

## Cấu trúc chính

```text
apps/
  web/        # Next.js 16 App Router
  cms/        # Next.js app host Payload admin UI + REST API
packages/
  shared/     # schema, type, enum, mapper, utils thuần
  ui/         # UI chia sẻ nếu cần
  config/     # eslint / tsconfig / prettier dùng chung
infra/
  docker/     # compose dev/prod + env mẫu
  caddy/      # reverse proxy + SSL
  scripts/    # deploy / backup / healthcheck
docs/
  architecture/
  cms/
  api/
```

## Chạy dev chuẩn

```bash
pnpm install
run-dev.bat
```

`run-dev.bat` se hoi che do chay:

- `1. Core`: `web + cms + postgres + meilisearch + redis` de code FE/BE va test chuc nang chinh.
- `2. Full`: `core + worker + caddy` de test toan bo flow worker, proxy va cac tinh nang phu tro.

Luồng dev chuẩn là Docker. `run-dev.bat` va `pnpm dev*` deu chi la wrapper cho `docker compose`, khong chay `web/cms/worker` tren host Windows nua.

- tu tao `infra/docker/.env.dev` tu file mau neu con thieu
- chay preset `core` hoac `full` trong Docker Compose
- bind mount source code de giu hot reload trong container
- tu dong `db:sync` cho CMS container luc boot de tranh lech schema dev

Theo doi log:

```bash
logs-dev.bat
```

Dung stack:

```bash
stop-dev.bat
```

Build lai image va recreate container:

```bash
rebuild-dev.bat
```

Neu muon chay bang pnpm thay vi `.bat`:

```bash
pnpm dev
pnpm dev:core
pnpm dev:full
pnpm dev:logs
pnpm dev:logs:core
pnpm dev:logs:full
pnpm dev:stop
pnpm dev:rebuild
pnpm dev:rebuild:core
pnpm dev:rebuild:full
```

Hoac foreground:

```bash
pnpm docker:dev
```

## Scripts quan trọng

- `run-dev.bat`: entrypoint chinh tren Windows, cho phep chon `core` hoac `full`.
- `logs-dev.bat`: xem log toan bo stack hoac log theo service.
- `stop-dev.bat`: dung va don compose dev stack.
- `rebuild-dev.bat`: build lai image dev va recreate container.
- `pnpm dev`: wrapper cross-platform cho `docker compose up -d`.
- `pnpm dev:core`: boot preset nhe `web + cms + postgres + meilisearch + redis`.
- `pnpm dev:full`: boot preset day du `core + worker + caddy`.
- `pnpm dev:logs`: wrapper cross-platform cho `docker compose logs -f`.
- `pnpm dev:stop`: wrapper cross-platform cho `docker compose down`.
- `pnpm dev:rebuild`: wrapper cross-platform cho `docker compose build --no-cache` + `up -d --force-recreate`.
- `pnpm dev:host:*`: script local cu, chi giu lai de debug dac biet, khong phai luong dev chuan.
- `pnpm build`: build toàn bộ workspace.
- `pnpm lint`: lint toàn bộ workspace.
- `pnpm typecheck`: kiểm tra TypeScript toàn bộ workspace.
- `pnpm seed:demo`: nạp dữ liệu mẫu production-like vào CMS.
- `pnpm reindex:posts`: enqueue batch reindex cho toàn bộ posts.
- `pnpm smoke:test`: bắn smoke test vào CMS/web theo env hiện tại.
- `pnpm docker:dev`: chạy stack dev foreground bằng Docker Compose.
- `pnpm docker:prod`: chạy stack production compose.

## Luồng triển khai production

1. GitHub Actions build image cho `web` và `cms`.
2. Push image lên registry.
3. VPS cap nhat `infra/docker/.env.prod` hoac secret source de tro `WEB_IMAGE` va `CMS_IMAGE` den release tag can deploy.
4. VPS pull image moi qua `docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml pull web cms worker caddy postgres pgbouncer meilisearch redis`.
5. VPS chay `docker compose --env-file infra/docker/.env.prod -f infra/docker/compose.prod.yml up -d web cms worker caddy postgres pgbouncer meilisearch redis`.
6. Monitoring production la profile tuy chon; tren VPS 4GB, khong nen boot Grafana/Prometheus/Alertmanager/exporters trong deploy mac dinh.

Boundary dev/prod:

- Dev: `infra/docker/compose.dev.yml` dung bind mount source code, named volume cho `node_modules`, `.next`, `.turbo`, pnpm store, media uploads va data services.
- Prod VPS: `infra/docker/compose.prod.yml` dung image build san, khong mount source code, chi giu persistent volumes cho Postgres, Redis, Meilisearch, Caddy data/config, worker heartbeat va CMS uploads/media.
- Monitoring production duoc tach thanh profile `monitoring` de tranh lam VPS 4GB nghop RAM khi deploy stack chinh.
- Caddy la public entrypoint duy nhat o production; `web` va `cms` noi bo sau Docker network.
- `worker` chay cung stack compose production va dung chung image CMS, nhung command rieng.

## Tài liệu cần đọc trước khi code

- `AUDIT_VERIFIED_2026.md`
- `docs/architecture/conventions.md`
- `docs/architecture/domains.md`
- `docs/api/contracts.md`
- `docs/cms/content-model.md`

`AUDIT_VERIFIED_2026.md` là baseline đã được đối chiếu lại với code hiện tại. Nếu còn audit cũ trong git history hoặc ghi chú cá nhân, chỉ dùng chúng như giả thuyết cần kiểm lại.

## Verification trong Docker dev

Khi stack dev đang chạy bằng Docker, ưu tiên chạy verify từ bên trong container để dùng đúng Node/Pnpm của repo:

```bash
docker compose -f infra/docker/compose.dev.yml exec -T cms sh -lc "cd /app/apps/cms && pnpm test"
docker compose -f infra/docker/compose.dev.yml exec -T web sh -lc "CMS_PUBLIC_URL=http://cms:3001 NEXT_PUBLIC_SITE_URL=http://web:3000 pnpm smoke:test"
```

Lý do: host shell cũ hơn baseline `Node >= 20.18`, nên `pnpm`, ESLint và một số script verify có thể fail do môi trường thay vì fail do mã nguồn.

## Ghi chú về CMS runtime hiện tại

- `apps/cms` là một Next.js app riêng, host Payload 3 theo hướng Next-native.
- Admin UI được phục vụ tại `apps/cms:/admin`.
- REST API tiếp tục sống tại `apps/cms:/api/*`, nên `apps/web` không cần đổi boundary tích hợp.
- Cấu trúc collection/access/hooks/service tiếp tục giữ nguyên để business logic không dính vào bootstrap framework.
- `apps/cms` đồng thời có worker command riêng cho BullMQ: search sync, push dispatch, email notification và maintenance cleanup.
