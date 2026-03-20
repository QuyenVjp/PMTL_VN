# Conventions

File này chốt `repo conventions (quy ước cấu trúc repo)` cho hướng `design-first rebuild`.
Nếu docs cũ còn nhắc `apps/cms` hoặc `Payload-first`, coi đó là legacy note (ghi chú cũ), không phải baseline mới.

## 1. Top-level structure (Cấu trúc cấp cao)

- `apps/web`: public frontend, `Next.js App Router`
- `apps/api`: backend authority, `NestJS + Prisma + Zod + Pino + OpenAPI`
- `apps/admin`: custom admin frontend
- `apps/worker`: optional background runtime, chỉ bật phase 2+
- `packages/shared`: framework-agnostic code
- `packages/ui`: shared visual primitives nếu thật sự cần dùng chung
- `packages/api-client`: generated/maintained API client từ OpenAPI/contracts
- `infra`: Docker, Caddy, scripts, backup, deploy
- `docs`: implementation docs
- `design`: target architecture + core rules + launch gates

## 2. Web conventions

Preferred shape (cấu trúc ưu tiên):

- `src/app`: route, layout, metadata, page composition
- `src/features/<domain>`: domain UI, hook, local mapper, API adapter
- `src/components/ui`: primitive UI
- `src/components/common`: reusable component qua nhiều feature
- `src/lib`: env, logger, fetch wrapper, API client bootstrap
- `src/proxy.ts`: request boundary file cho `Next.js 16`

Rules:

- Server Components by default.
- Không nhét business rule chuẩn gốc vào page file.
- Không để web gọi thẳng DB, storage, search engine.
- Auth UI sống ở `src/features/auth/*`.

## 3. API conventions

Preferred shape:

```txt
apps/api/src/
  common/
  platform/
  modules/
```

### `common/`

Chứa technical baseline (nền tảng kỹ thuật):

- `config`
- `logging`
- `errors`
- `validation`
- `guards`
- `decorators`
- `auth`
- `http`

### `platform/`

Chứa control-plane/runtime modules (mô-đun điều phối và vận hành):

- `sessions`
- `audit`
- `feature-flags`
- `rate-limit`
- `storage`
- `health`
- `metrics`

### `modules/`

Chứa domain modules:

- `identity`
- `content`
- `community`
- `engagement`
- `moderation`
- `search`
- `calendar`
- `notification`
- `vows-merit`
- `wisdom-qa`

Per module, prefer:

- `<domain>.module.ts`
- `<domain>.controller.ts`
- `<domain>.service.ts`
- `<domain>.schemas.ts`
- `<domain>.mapper.ts`
- `<domain>.repository.ts`
- `<domain>.policy.ts`

Rules:

- controller mỏng
- service giữ business logic
- repository chỉ giữ data access
- schema là runtime source of truth cho boundary
- mapper tách persistence shape khỏi API contract

## 4. Admin conventions

Preferred shape:

- `src/app`
- `src/features/<domain>`
- `src/components/ui`
- `src/components/common`
- `src/lib`

Rules:

- `apps/admin` là management UI only.
- Không giữ business authority ở admin.
- Dashboard, editorial action, moderation queue, audit views đều phải gọi `apps/api`.

## 5. Shared package conventions

### `packages/shared`

Allowed:

- `contracts`
- `schemas`
- `types`
- `enums`
- `constants`
- `mappers`
- `validators`
- pure `utils`

Not allowed:

- NestJS imports
- Next.js imports
- Prisma client trực tiếp
- browser runtime glue

### `packages/api-client`

- Ưu tiên sinh từ OpenAPI
- Dùng cho web/admin
- Không chứa business policy

## 6. Naming conventions

- Folder domain dùng `kebab-case`: `vows-merit`, `wisdom-qa`
- Type đặt rõ nghĩa: `AuthSessionView`, `PostSummaryItem`, `ModerationDecisionInput`
- Tránh tên mơ hồ như `helpers.ts`, `common.ts`, `data.ts` nếu file chỉ làm 1 việc cụ thể

## 7. Placement rules (Code nên sống ở đâu)

- Sửa public UI -> `apps/web/src/features/*`
- Sửa admin UI -> `apps/admin/src/features/*`
- Sửa auth/session business rule -> `apps/api/src/modules/identity/*` + `apps/api/src/platform/sessions/*`
- Sửa upload/storage -> `apps/api/src/platform/storage/*`
- Sửa audit -> `apps/api/src/platform/audit/*`
- Sửa feature flag -> `apps/api/src/platform/feature-flags/*`
- Sửa limiter -> `apps/api/src/platform/rate-limit/*`
- Sửa health/metrics -> `apps/api/src/platform/health/*`, `apps/api/src/platform/metrics/*`
- Sửa shared contract -> `packages/shared/src/*`
- Sửa infra/deploy -> `infra/*`

## 8. Contract rules

- Boundary validation dùng `Zod`.
- API contract public/admin nên đi qua OpenAPI hoặc shared schemas, không tạo source of truth thứ hai.
- Web/admin không dựa vào raw persistence model nếu chưa map.
- `publicId` là public identity ưu tiên; `slug` phục vụ SEO/readability.

## 9. Environment rules

- Env public cho web phải prefix `NEXT_PUBLIC_`.
- Không đọc `process.env` trực tiếp trong component.
- `apps/api` phải validate env ngay khi boot.
- Auth/security env phải map về policy đã chốt trong `design/SECURITY_BASELINE.md`.

## 10. AI synchronization rule

Khi đổi:

- kiến trúc
- cấu trúc thư mục
- security baseline
- runtime contracts

phải cập nhật cùng task:

- `AGENTS.md`
- `.agents/skills/pmtl-vn-architecture/references/repo-conventions.md`
- `docs/architecture/*`
- `docs/api/contracts.md`
- `design/*` owner docs nếu rule gốc sống ở đó
