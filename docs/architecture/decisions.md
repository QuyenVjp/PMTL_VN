# Architectural Decisions

## ADR-001: Monorepo thay vì multi-repo

- Chọn monorepo để web, cms, shared schema và infra sống cùng một chỗ.
- Lý do: solo dev + AI cần nhìn xuyên suốt domain nhanh, tránh drift contract giữa frontend và cms.

## ADR-002: Feature-first cho web

- UI, hook, fetch wrapper và type của từng feature nằm gần nhau.
- Không gom tất cả `components/`, `hooks/`, `services/` toàn cục nếu chúng chỉ phục vụ một feature.

## ADR-003: Collection definition tách khỏi business logic trong Payload

- `index.ts`: khai báo collection.
- `fields.ts`: field definitions.
- `access.ts`: quyền truy cập.
- `hooks.ts`: lifecycle hooks.
- `service.ts`: business rules và side effects.

## ADR-004: Shared package chỉ chứa code framework-agnostic

- `packages/shared` được phép chứa schema Zod, enum, mapper, util thuần.
- Không import `next/*`, `payload/*`, React hay DB client vào package này.

## ADR-005: Production deploy bằng image build từ CI

- VPS không build source trực tiếp.
- CI build image, push registry, server chỉ pull image để giảm drift môi trường.

## ADR-006: Stage 2 mở rộng bằng worker và queue

- Redis và worker không đưa vào runtime giai đoạn 1.
- Kiến trúc hiện tại chừa sẵn `jobs/`, `worker` và env để scale sau mà không phải đập lại cấu trúc.

