# PMTL_VN — Audit tuân thủ Admin và API

Ngày audit: 2026-07-13

Phạm vi: `design/`, `apps/admin`, `apps/api`, `packages/api-client`

Loại công việc: read-only source audit + quality checks; chưa sửa logic sản phẩm

## 1. Kết luận điều hành

Admin và API hiện tại **không phải scaffold rỗng**. Hai app đều typecheck/lint được, các script audit hợp đồng tĩnh đều báo không có deviation, và nhiều domain rủi ro cao đã có triển khai thật. Tuy nhiên, hệ thống **chưa nên được coi là hoàn tất hoặc production-ready chỉ dựa trên các gate này**.

Các blocker cần xử lý trước:

1. Ba member detail/mutation flow ở Little House, Sacred Forms và Life Liberation thiếu object-level ownership check, tạo lỗ hổng IDOR giữa các thành viên.
2. Audit log hiện chưa đạt chính sách bất biến: còn lưu IP thô, thiếu hash chain/sequence và không có DB-level append-only enforcement.
3. Admin có màn hình “Khôi phục mật khẩu” nhưng form không submit và không có route đặt lại mật khẩu bằng token.
4. Một số controller API lớn đang trực tiếp giữ Prisma CRUD và business flow, trái constitution “controller chỉ là transport”.
5. Success envelope đang có hai owner: global interceptor bọc response, trong khi nhiều service/controller đã tự trả `{ data, meta }`.
6. Admin che lỗi API thành trạng thái “không có dữ liệu” và nhiều bảng chỉ tải 100 bản ghi rồi phân trang ở client.

Đánh giá tổng thể:

| Trục | Điểm / 5 | Nhận định |
|---|---:|---|
| Product fit | 4 | Các workspace quản trị chính và nhiều domain guard đã tồn tại |
| Evidence strength | 5 | Đối chiếu design canon, source, static audits và targeted tests |
| Implementation completeness | 3 | Nhiều bề mặt đã có, nhưng còn stub auth, layering drift và contract drift |
| Regression safety | 2 | API có 19 test files/413 source files; Admin có 1 test file/345 source files |
| Operational readiness | 2 | Chưa có production restore proof; một số pre-launch security/runtime gate chưa được chứng minh |

## 2. Phương pháp và giới hạn

- Đã kiểm kê toàn bộ corpus `design/`: 860 files, trong đó 808 Markdown files, khoảng 6.5 MB.
- Dùng thứ tự precedence: Governance → Repo Constitution → Platform Baseline → Domain Feature Pack → Execution Overlay → References/examples.
- Đối chiếu `AGENTS.md`, constitution của `apps/admin` và `apps/api`, design owner docs, source hiện tại và test hiện có.
- GitNexus index `PMTL_VN` đang up-to-date tại commit `60a8746` (2026-07-13 17:58 local).
- Worktree đã dirty trước audit. Báo cáo này không gán ownership hoặc hoàn tác bất kỳ thay đổi đang có nào.
- Không chạy browser smoke, DB runtime inspection, Meilisearch runtime inspection hoặc production restore drill trong audit này.
- Second Brain và AgentMemory MCP không xuất hiện trong tool surface của session, nên không được dùng làm bằng chứng. Repo docs/source hiện tại được ưu tiên.

## 3. Canon đang có hiệu lực

1. `apps/api` là authority duy nhất cho business rule, auth, security, write path và orchestration; Admin chỉ là operator client.
2. API pipeline phải đi qua auth/role guards, Zod boundary, controller mỏng, service và global error filter.
3. Prisma query phải ở repository/service; multi-write và audit liên quan phải có transaction ownership rõ ràng.
4. Mọi input runtime phải được validate bằng Zod; public record dùng `publicId`, không lộ internal ID.
5. Admin phải phân biệt loading/error/empty, dùng query key có cấu trúc và server-side pagination cho tập dữ liệu tăng trưởng.
6. Content publish/unpublish/delete phải audit và search sync do backend sở hữu.
7. Admin phải giữ đúng canon: Bạch thoại Phật pháp, Hỏi đáp riêng, Kinh văn tự tu đúng owner lane, Kinh sách/Tài liệu tách route, media chọn bằng preview.

Nguồn chính:

- `design/01-repo-constitution/DECISIONS.md`
- `design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md`
- `design/02-platform-baseline/data-runtime/PRISMA_QUERY_PATTERN_RULES.md`
- `design/02-platform-baseline/admin-runtime/ADMIN_UI_CONTRACT.md`
- `design/04-execution-overlay/api/APPS_API_IMPLEMENTATION_CANON.md`
- `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`

## 4. Phát hiện ưu tiên

### P0-01 — IDOR ở member Little House

- `apps/api/src/modules/little-house/little-house.controller.ts:142-168`: member detail nhận `publicId` nhưng không truyền current user; recitation có truyền user nhưng service không dùng để authorize.
- `apps/api/src/modules/little-house/little-house.service.ts:46-49,79-85`: `getRecord()` lookup chỉ bằng `publicId`; `logRecitation()` đặt tên `_userId` và bỏ qua ownership.
- `apps/api/src/modules/little-house/little-house.repository.ts:38-49`: lookup không scope owner và còn include owner email.

Một member biết/đoán được `publicId` có thể đọc record của member khác và ghi recitation vào record đó. Đây là object-level authorization failure, không chỉ là UI permission drift.

### P0-02 — IDOR ở Sacred Forms “my application”

- `apps/api/src/modules/sacred-forms/sacred-forms.controller.ts:213-216`: route `/my-applications/:publicId` không lấy `@CurrentUser()`.
- `apps/api/src/modules/sacred-forms/sacred-forms.service.ts:97-100` và repository `:85-94`: lookup generic theo `publicId`, không scope `userId`.

Member có thể đọc application của member khác, trái self-owned contract trong `design/03-domains/sacred-forms/CONTRACTS.md`.

### P0-03 — IDOR ở Life Liberation member detail/proxy

- `apps/api/src/modules/life-liberation/life-liberation.controller.ts:86-114`: detail không truyền current user; proxy truyền sponsor ID.
- `apps/api/src/modules/life-liberation/life-liberation.service.ts:36-39,132-149`: detail lookup generic; proxy không kiểm tra `record.userId === sponsorId` trước khi tạo proxy item.
- `apps/api/src/modules/life-liberation/life-liberation.repository.ts:34-42`: lookup chỉ theo `publicId`.

Member có thể đọc record khác và thêm beneficiary/proxy data vào record không thuộc mình.

### P0-04 — Audit log chưa bất biến và đang giữ IP thô

Design yêu cầu append-only, không lưu raw IP, có sequence/hash chain, schema/quyền DB riêng và chặn update/delete (`design/04-execution-overlay/api/AUDIT_POLICY.md:14`, `:122`, `:243-278`, `:368-436`).

Hiện trạng:

- `apps/api/prisma/schema.prisma:90-101` chỉ có model `AuditLog` thông thường và field `ipAddress`.
- `apps/api/src/platform/audit/audit.service.ts:24-32` tạo row Prisma và ghi nguyên `context.ipAddress`.
- Không có `correlationId`, `sequenceNumber`, `previousHash`, `rowHash`, separate audit schema hoặc DB privilege/trigger chống update/delete.
- Test hiện tại của audit service chỉ kiểm tra helper build input, chưa chứng minh immutability hay tamper detection.

Rủi ro: audit trail có thể bị sửa/xóa bằng quyền DB thông thường; raw IP vượt quá data-minimization policy; forensic chain không kiểm chứng được.

### P0-05 — Admin password recovery là giao diện giả

- `apps/admin/src/features/auth/forgot-password.tsx:19-29` có form và nút submit nhưng không có `onSubmit`, state, mutation hay API call.
- `apps/admin/src/routes/__root.tsx:408-413` có route `/auth/quen-mat-khau`, nhưng không có reset-token route.
- Backend đã có `POST /api/auth/forgot-password` và `POST /api/auth/reset-password` tại `apps/api/src/modules/identity/identity.controller.ts:281-303`.
- `design/03-domains/identity/CONTRACTS.md:20` yêu cầu cả forgot-password và reset-password.

Rủi ro: operator bị khóa tài khoản không thể tự phục hồi dù UI nói rằng hệ thống sẽ gửi liên kết.

### P1-01 — Business/data access nằm trực tiếp trong controller API

Các bằng chứng rõ nhất:

- `apps/api/src/platform/storage/admin-media.controller.ts` dài 671 dòng, inject `PrismaService` tại `:96`, trực tiếp CRUD folder/media ở nhiều endpoint.
- `apps/api/src/modules/content/daily-practice.controller.ts` dài 428 dòng, inject `PrismaService` tại `:101`, trực tiếp CRUD guides/presets/FAQ.
- `apps/api/src/platform/audit/admin-audit-logs.controller.ts:33` inject Prisma và query trực tiếp tại `:62`, `:77`, `:104`.

Vi phạm `apps/api/AGENTS.override.md` sections 1 và 7: controller chỉ parse/validate/call service; repository/service sở hữu query và business logic.

### P1-02 — Daily Practice write paths thiếu audit ownership

`AdminDailyPracticeController` có create/update/delete cho guide, preset và FAQ (`daily-practice.controller.ts:177-392`) nhưng không inject/call `AuditService`, cũng không có transaction đảm bảo write + audit cùng thành công.

Rủi ro: thay đổi nội dung operator-facing không có audit trail và rollback atomicity.

### P1-03 — Success response bị double-wrap theo source hiện tại

- `ResponseInterceptor` luôn biến output thành `{ data: output, meta }` tại `apps/api/src/common/interceptors/response.interceptor.ts:39-47`.
- Interceptor được đăng ký toàn cục tại `apps/api/src/app.module.ts:144`.
- Nhiều service/controller đã trả `{ data }` hoặc `{ data, meta }`, ví dụ `admin-users.service.ts:64-66`, `moderation.service.ts:46-49`, `community.service.ts:226-229`, `admin-media.controller.ts:203`.
- `packages/api-client/src/core/client.ts:151-155` chỉ unwrap một lớp ngoài; Admin tiếp tục type response là `ListEnvelope<T>`.

Kết quả tĩnh có thể chứng minh: endpoint dạng trên trả `{ data: { data, meta? }, meta }`. Đây là hai contract owner cùng tồn tại. Fix phải migration-aware vì Admin hiện đang dựa vào lớp envelope bên trong.

### P1-04 — `publicId` không đồng nhất với `nanoid(21)`

Constitution yêu cầu explicit `nanoid(21)`. Các path dùng `nanoid()` mặc định vẫn có độ dài 21 và không phải lỗi. Drift xác nhận nằm ở các path explicit 12 ký tự:

- `apps/api/src/modules/content/daily-practice.controller.ts:181,287,353`
- `apps/api/src/modules/content/self-cultivation/self-cultivation.service.ts:152,232`
- `apps/api/src/modules/wisdom-qa/wisdom-qa.service.ts:141,172,245,338`

Không được đổi hàng loạt ID hiện hữu. Cần policy cho record mới, compatibility cho URL hiện hữu và collision/backfill assessment.

### P1-05 — Config/secret access lệch policy và có development fallback key

- `apps/api/src/common/prisma/prisma.service.ts:13,22,57` đọc `process.env` trực tiếp.
- `apps/api/src/common/encryption/encryption.service.ts:33-48` đọc env trực tiếp và tạo development fallback key dự đoán được khi thiếu `ENCRYPTION_MASTER_KEY`.
- `apps/api/src/common/auth/strategies/jwt.strategy.ts:25` ưu tiên `process.env.JWT_ACCESS_SECRET` trước config đã inject.

Policy yêu cầu env được validate/map tập trung và module code dùng `ConfigService`. Fallback encryption key phải fail closed ngoài test fixture rõ ràng.

### P1-06 — Admin che lỗi API thành empty state

Pattern đại diện:

- `apps/admin/src/features/users/users-table.tsx:40-41` chỉ lấy `data, isLoading`, sau đó dùng `envelope?.data ?? []`.
- `apps/admin/src/features/users/users-table.tsx:191-196` hiển thị empty message, không render error/retry state.
- Pattern tương tự có ở Wisdom, Community, Posts, Guestbook, Moderation, Sessions và các workspace khác.

Rủi ro: 401/403/500/outage bị hiểu nhầm là database rỗng; operator có thể đưa ra quyết định sai.

### P1-07 — Nhiều list chỉ tải 100 record rồi client-side pagination

Ví dụ:

- Users: `apps/admin/src/features/users/users-table.tsx:40,133-151`
- Community posts: `apps/admin/src/features/community-posts/index.tsx:153,253-268`
- Posts: `apps/admin/src/features/content/posts-table.tsx:157`
- Wisdom: `apps/admin/src/features/wisdom-baihoa/index.tsx:132`

Pattern lặp ở calendar, downloads, guides, guestbook, notifications, sessions, volunteers và moderation. Canon yêu cầu server-side pagination, 20 items mặc định (`ADMIN_ARCHITECTURE.md:212`). Record thứ 101 trở đi hiện không xuất hiện; filter/sort chỉ chạy trên tập con.

### P1-08 — Một số Admin form không có Zod/field errors

- User create dùng local `useState`, submit trực tiếp và chỉ disable sơ bộ: `apps/admin/src/features/users/user-create-dialog.tsx:25-40,92`.
- Contact Info giữ 7 field bằng `useState` và gửi thẳng email/phone/social URLs: `apps/admin/src/features/contact-info/index.tsx:19-47`.

Vi phạm root rule “all user input must be validated with Zod” và Admin field-level validation contract.

### P1-09 — UI role action chưa phản chiếu backend capability

- `apps/admin/src/features/users/user-detail-page.tsx:326` luôn hiển thị toàn bộ role options, kể cả `SUPER_ADMIN`.
- Backend chặn actor không phải super admin trong `apps/api/src/modules/identity/admin-users.service.ts:222`.

Backend vẫn là authority, nhưng Admin đang đưa ra action chắc chắn nhận 403 cho actor không đủ quyền.

### P2-01 — Router Admin là mega-file programmatic

`apps/admin/src/routes/__root.tsx` dài 1.121 dòng, chứa lazy registry, wrapper creation, route definitions và route-tree assembly. File tự mô tả “programmatic routing” tại `:2`, trái constitution file-based route và “route files chỉ import/export page”.

### P2-02 — Query/mutation còn inline ngoài feature boundary

- `apps/admin/src/features/auth/sign-in.tsx:50,74,79` gọi `adminClient` trực tiếp trong component.
- `apps/admin/src/components/layout/notification-dropdown.tsx:125-130` khai báo query key/queryFn ad hoc trong layout component.

### P2-03 — Type-safety và artifact cleanup

- `apps/admin/src/features/moderation-reports/report-detail-page.tsx:191` dùng non-null assertion trên API field `resolvedAt!`.
- `apps/admin/src/features/workspace/placeholder-page.tsx` không có import consumer được tìm thấy.
- Một số auth/current-user role shape vẫn dùng `string` thay vì canonical role union.

## 5. Những phần đã xác nhận tốt

1. Admin typecheck, lint và static contract audit đều pass.
2. API typecheck và static admin/API contract audit pass. API lint hiện fail đúng 1 lỗi unused type ở Admin Media; xem phần quality evidence.
3. Admin giữ đúng canon route/label chính: Bạch thoại, Kinh văn tự tu, Kinh sách/Tài liệu, Niệm kinh submenu.
4. Bạch thoại có source/video-first flow và YouTube preview; Hỏi đáp không bị nhập nhằng thành Bạch thoại.
5. Media picker có preview đã được dùng rộng; static audit đếm 22 `MediaPickerField`.
6. Full-page create/detail flow và shared workspace components đã được triển khai rộng:
   - 72 `WorkspaceDataTable`
   - 58 `WorkspaceRowActions`
   - 48 `WorkspaceDetailSheet`
   - 119 `AdminDetailPage`
7. Feature flags dùng list đơn giản, power action và confirm, đúng canon.
8. Charity firewall và predatory species guard đã có implementation và targeted tests pass; không được tạo lại từ đầu.
9. Vows assisted-entry đã có actor/owner audit metadata ở service/repository path; cần targeted recovery verification, không phải reimplementation.

## 6. Test và quality-gate evidence

Đã pass:

```text
pnpm --filter @pmtl/api typecheck
pnpm --filter @pmtl/admin typecheck
pnpm --filter @pmtl/admin lint
pnpm --filter @pmtl/api audit:admin-api-contract
pnpm --filter @pmtl/admin audit:admin-contract
```

Hai static contract audits đều exit 0, không có deviation.

API lint hiện fail:

```text
apps/api/src/platform/storage/admin-media.controller.ts:80:6
'UploadMediaFields' is defined but never used
1 error, 0 warnings
```

Targeted Vitest run:

```text
6 test files passed
73 tests passed
Duration: 15.92s
```

Suites gồm encryption, audit input helper, charity firewall service/interceptor, predatory species guard và species blacklist.

Coverage inventory:

| App | TS/TSX source files | Test files | Nhận định |
|---|---:|---:|---|
| API | 413 | 19 | Mỏng so với số module/write paths |
| Admin | 345 | 1 | Không đủ để bảo vệ auth, routing, error states và CRUD workflows |

Không tìm thấy targeted tests cho:

- member object authorization của Little House, Sacred Forms và Life Liberation
- `daily-practice.controller.ts`
- `admin-media.controller.ts`
- `response.interceptor.ts`
- `forgot-password.tsx`

Broad API Vitest run trước đó không cho kết quả hoàn thành đáng tin cậy; không được ghi nhận là pass hoặc fail.

## 7. Residual domain backlog đã được xác nhận lại

`DESIGN_GAP_ANALYSIS.md` tháng 5 mới hơn top-five gap list tháng 4 trong root instructions. Những feature sau **đã có implementation**, nhưng còn verification backlog:

1. Charity: kiểm tra double scanning giữa global interceptor và Community service.
2. Life Liberation: kiểm tra follow-up 30 ngày và mortality-rate escalation.
3. Content: kiểm tra DTO completeness theo route cho Little House, Daily Practice, Life Release.
4. Wisdom-QA: kiểm tra search replay/reindex thực tế với search runtime.
5. Vows & Merit: kiểm tra recovery/recompute từ audit trail khi progress drift.

## 8. Xung đột/stale docs phải xử lý trước khi giao AI sửa rộng

1. `AGENTS.md` còn top-five gap list tháng 4, mâu thuẫn `DESIGN_GAP_ANALYSIS.md` tháng 5.
2. `IMPLEMENTATION_MAPPING.md` vừa nói scaffold chỉ an toàn đến Step 7, vừa ghi nhiều platform/domain đã implemented; timestamp verify cũng cũ hơn các claim bên dưới.
3. Restore drill development được ghi implemented nhưng production restore drill vẫn pending, trong khi launch gate yêu cầu restore pass.
4. Identity role canon chỉ có `super_admin/admin/member`, nhưng route overlays dùng `editor+` và `moderator+`.
5. Admin auth guard sample chỉ nhận `admin`, có thể loại nhầm `super_admin`.
6. Content write route owner dùng `/api/admin/content/posts/*`, route inventory lại ghi `/content/posts*`.
7. Contact mapping còn route cũ `/contact/info`, `/contact/volunteers`; canon mới là `/contact-info`, `/volunteers`.
8. Search contract bắt buộc outbox, trong khi Phase 1 decision cho phép direct sync/manual reindex.
9. Notification contract vừa nói Phase 1 chỉ record jobs, vừa mặc định queue async bắt buộc.
10. Admin error DTO bắt buộc `traceId`/string field errors, nhưng canonical error owner không bắt buộc `traceId` và mô tả field errors dạng arrays.

## 9. Launch gates còn phải chứng minh

- Cookie-auth browser mutation: CSRF double-submit + Origin/Referer allowlist.
- `/.well-known/security.txt` trước public launch.
- Meilisearch + SQL fallback theo profile launch hiện hành.
- Production backup/restore drill thực tế.

Các runtime deferred (Valkey/BullMQ/outbox/worker, Web Push delivery, OTEL, dashboards) không nên bị đưa vào Phase 1 chỉ vì “enterprise”; chỉ kích hoạt khi design decision hoặc measured need yêu cầu.

## 10. Hướng sửa đề xuất

Thứ tự an toàn:

1. Viết regression tests rồi chặn ba IDOR member routes trước mọi refactor lớn.
2. Reconcile design conflicts và khóa contract tests.
3. Sửa immutable audit + password recovery.
4. Chốt một success-envelope owner và migration client/server cùng batch.
5. Tách controller → service/repository theo vertical slice, bắt đầu Daily Practice và Admin Media.
6. Chuẩn hóa public ID/config/secrets với migration/compatibility plan.
7. Sửa Admin error state, server pagination, validation và permission projection.
8. Tách router sau khi có route parity tests.
9. Chạy residual domain verification và launch gates.

Task contract chi tiết nằm ở root `Plans.md`.
