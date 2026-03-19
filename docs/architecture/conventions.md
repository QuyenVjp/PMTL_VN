# Conventions

## 1. Quy tắc folder

### Web

- `src/app`: route, layout, metadata; cache policy uu tien dat o data layer qua Cache Components.
- `src/features/<feature>`: code đặc thù domain, gồm `api`, `components`, `hooks`, `utils`, `types.ts`.
- `src/components/ui`: primitive UI tái sử dụng.
- `src/components/common`: component dùng nhiều feature nhưng không phải primitive.
- `src/lib`: integration layer như CMS client, search client, env, logger.
- Với auth: `src/features/auth/*` chứa auth API wrapper, form, hook session, auth error parsing.
- Guard route ưu tiên dùng server-side session check hoặc `src/proxy.ts` mỏng theo file convention của Next.js 16, không dồn business rule vào page file.

### CMS

- `src/app/(payload)`: lớp host Next-native cho Payload admin UI, REST API, GraphQL và route compatibility.
- `src/app/(site)`: route public tối thiểu của app CMS, không chứa business logic domain.
- `src/admin/components`: branding, intro, helper UI cho admin panel.
- `src/admin/widgets`: dashboard widget cho admin panel.
- `src/payload.config.ts`: trung tâm cấu hình Payload cho admin, API, collection và globals.
- `src/collections/<CollectionName>/index.ts`: cấu hình collection.
- `src/collections/<CollectionName>/fields.ts`: field definitions.
- `src/collections/<CollectionName>/access.ts`: access rules.
- `src/collections/<CollectionName>/hooks.ts`: hook binding.
- `src/collections/<CollectionName>/service.ts`: business logic cho collection đó.
- `src/services`: service dùng chung nhiều collection.
- `src/integrations`: code ra ngoài hệ thống như Meilisearch, webhook.
- `src/workers`: processor và bootstrap cho worker chay Payload Jobs cua CMS.
- `src/routes`: helper cho route compatibility hoặc public adapter mỏng, gồm `public.ts`, `session.ts`, `request-metadata.ts`; không chứa business logic domain.
- Với auth user collection: `index.ts` mô tả auth config, `access.ts` chỉ giữ RBAC/document access, `hooks.ts` chỉ orchestration nhẹ, `service.ts` giữ register/login/profile/reset-password flow.

### Shared

- `constants`: constant dùng nhiều nơi.
- `enums`: enum domain.
- `schemas`: Zod schema dùng chung.
- `types`: type domain thuần.
- `validators`: helper validate thuần.
- `mappers`: chuyển đổi shape giữa domain layers.
- `utils`: util thuần không phụ thuộc framework.

## 2. Naming conventions

- Folder feature dùng `kebab-case` hoặc `PascalCase` theo chuẩn framework hiện tại:
  - Web feature: `posts`, `search`, `events`.
  - Payload collection: `Posts`, `PostComments`, `Users`.
- Type/interface domain đặt tên rõ nghĩa như `PostSummary`, `SearchResultItem`, `CommentCreateInput`.
- Không dùng tên mơ hồ như `data`, `helper`, `common` nếu file chỉ làm một việc cụ thể.

## 3. File nào chứa gì

- Sửa UI của feature `posts` -> `apps/web/src/features/posts/components/*`
- Sửa UI/auth flow -> `apps/web/src/features/auth/*`
- Sửa request từ web sang CMS -> `apps/web/src/features/posts/api/*` hoặc `apps/web/src/lib/cms/*`
- Sửa request auth/session giữa web và CMS -> `apps/web/src/features/auth/api/*`
- Sửa schema/content model của Payload -> `apps/cms/src/collections/*/fields.ts`
- Sửa quyền -> `apps/cms/src/collections/*/access.ts`
- Sửa auth/profile rule ở CMS -> `apps/cms/src/collections/Users/service.ts`
- Sửa business rule -> `apps/cms/src/collections/*/service.ts` hoặc `apps/cms/src/services/*`
- Sửa admin/API bootstrap của CMS -> `apps/cms/src/app/(payload)/*`
- Sửa branding, dashboard widget, admin helper UI -> `apps/cms/src/admin/*`
- Sửa route compatibility / adapter mỏng cho FE cũ -> `apps/cms/src/routes/*` và `apps/cms/src/app/(payload)/api/*`
- Sửa queue producer / notification producer -> `apps/cms/src/services/queue.service.ts`, `apps/cms/src/services/notification.service.ts`
- Sửa Payload task runner / background job -> `apps/cms/src/workers/*`, `apps/cms/src/jobs/*`
- Sửa shape dùng chung -> `packages/shared/src/schemas/*`, `packages/shared/src/types/*`

## 4. Cách thêm feature mới

### Web

1. Tạo `apps/web/src/features/<feature>`.
2. Thêm `types.ts`, `api`, `components`, `utils`.
3. Chỉ đưa code sang `src/components/common` nếu ít nhất 2 feature cùng dùng.

### CMS

1. Tạo `apps/cms/src/collections/<FeatureName>`.
2. Tách `index.ts`, `fields.ts`, `access.ts`, `hooks.ts`, `service.ts`.
3. Nếu cần side effect ngoài hệ thống, gọi qua `src/integrations/*` thay vì gọi thẳng trong hook.

## 5. Rules env

- Env public cho web phải prefix `NEXT_PUBLIC_`.
- Không đọc `process.env` trực tiếp trong component. Luôn đi qua `lib/env`.
- Compose env file ở `infra/docker`.
- Auth env nền tảng hiện tại gồm `AUTH_RESET_PASSWORD_URL` và `PAYLOAD_AUTH_DISABLE_EMAIL`.
- Queue/notification env runtime hiện có `VAPID_*`, `SMTP_*`, `WORKER_JOBS_INTERVAL_MS`, `WORKER_MAINTENANCE_INTERVAL_MS`; `REDIS_URL` chỉ cần khi feature khác dùng Redis cho rate-limit hoặc coordination.
- `PAYLOAD_CONFIG_PATH` được dùng bởi script CLI của `apps/cms`, không phải env contract giữa services.

## 6. API contracts

- Web không dựa vào raw Payload document nếu chưa map.
- Mọi dữ liệu từ CMS đi qua mapper trước khi vào UI layer.
- Contract chính được ghi ở `docs/api/contracts.md`.

## 7. Access control

- Access rule nằm ở `access.ts`.
- Hook không tự ý chặn quyền nếu logic đó là authorization.
- Service có thể validate business rule sau khi access đã pass.
- Quy ước role hiện tại: `super-admin`, `admin`, `member`.
- `admin` là giá trị kỹ thuật; trong ngôn ngữ nghiệp vụ/UI có thể gọi là `Phụng sự viên`.
- Guest chỉ xem public content; member dùng user feature; admin và super-admin xử lý editorial, moderation, vận hành theo policy.

## 8. Error handling

- Integration layer throw error typed hoặc error có message rõ nghĩa.
- UI layer không parse lỗi mơ hồ từ hệ thống thấp hơn.
- Logger chỉ log ở boundary như route handler, service, worker.

## 9. AI synchronization rule

- Khi thay đổi quy tắc kiến trúc, security baseline, runtime contract, hoặc convention codegen cho AI, phải cập nhật trong cùng task:
  - `AGENTS.md`
  - skill liên quan trong `.agents/skills/*/SKILL.md`
  - docs tương ứng trong `docs/architecture/*`, `docs/security.md`, `docs/api/contracts.md`
- Không tạo rule mới trong code mà bỏ quên docs/skill; repo này ưu tiên "code + rule + docs" đồng bộ.
- Với Next.js 16, request boundary runtime của web nằm ở `apps/web/src/proxy.ts`, không tự động đổi về `middleware.ts` nếu không có lý do version-specific rõ ràng.
- Skill nội bộ phải theo taxonomy ở `docs/architecture/skills-taxonomy.md`: `governance`, `knowledge`, `review`, `verification`, `automation`, `scaffolding`, `runbook`.
- Verification skill phải ưu tiên script/checks lặp lại được thay vì chỉ lặp lại prose checklist.
- Canonical skill nên có đủ 5 lớp tối thiểu theo vận hành: intent, knowledge, execution, verification, evolution; nếu chưa đủ thì phải ghi rõ là compatibility hoặc partial skill.
- Nếu hai skill nội bộ bắt đầu chồng vai rõ rệt, gộp chúng hoặc tách vai cho rõ thay vì để routing mơ hồ.
