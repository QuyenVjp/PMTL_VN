# PMTL_VN

Monorepo cho dự án web dùng Next.js 16, Payload CMS, PostgreSQL, Meilisearch, Caddy và Docker Compose.

## Mục tiêu kiến trúc

- Rõ domain, rõ trách nhiệm từng file.
- Solo developer có thể sửa nhanh, AI đọc vào hiểu ngay điểm cần thay đổi.
- Giai đoạn 1 chạy gọn với `web + cms + postgres + meilisearch + caddy`.
- Giai đoạn 2 mở rộng thêm `redis + worker + queue + monitoring + backup`.

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

## Chạy local

```bash
pnpm install
pnpm dev
```

`pnpm dev` bây giờ sẽ:

- tự tạo `infra/docker/.env.dev` từ file mẫu nếu còn thiếu
- bật `postgres + meilisearch` bằng Docker
- chạy `apps/web` và `apps/cms` local với hot reload

Nếu chỉ muốn bật hạ tầng dev:

```bash
pnpm dev:infra
```

Nếu muốn tắt hạ tầng dev:

```bash
pnpm dev:infra:down
```

Trên Windows có thể chạy nhanh bằng:

```bash
run-dev.bat
```

Hoặc chạy toàn bộ stack bằng Docker container:

```bash
docker compose -f infra/docker/compose.dev.yml up --build
```

## Scripts quan trọng

- `pnpm dev`: bật infra dev bằng Docker và chạy web + cms local.
- `pnpm dev:apps`: chỉ chạy web + cms local.
- `pnpm dev:infra`: chỉ bật postgres + meilisearch cho local dev.
- `pnpm dev:infra:down`: tắt hạ tầng dev local.
- `pnpm build`: build toàn bộ workspace.
- `pnpm lint`: lint toàn bộ workspace.
- `pnpm typecheck`: kiểm tra TypeScript toàn bộ workspace.
- `pnpm docker:dev`: chạy stack local bằng Docker Compose.
- `pnpm docker:prod`: chạy stack production compose.

## Luồng triển khai production

1. GitHub Actions build image cho `web` và `cms`.
2. Push image lên registry.
3. VPS pull image mới.
4. VPS chạy `docker compose pull && docker compose up -d`.

## Tài liệu cần đọc trước khi code

- `docs/architecture/conventions.md`
- `docs/architecture/domains.md`
- `docs/api/contracts.md`
- `docs/cms/content-model.md`

## Ghi chú về CMS runtime hiện tại

- `apps/cms` là một Next.js app riêng, host Payload 3 theo hướng Next-native.
- Admin UI được phục vụ tại `apps/cms:/admin`.
- REST API tiếp tục sống tại `apps/cms:/api/*`, nên `apps/web` không cần đổi boundary tích hợp.
- Cấu trúc collection/access/hooks/service tiếp tục giữ nguyên để business logic không dính vào bootstrap framework.
