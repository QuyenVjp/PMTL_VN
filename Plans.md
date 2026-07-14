# PMTL_VN — Kế hoạch sửa Admin + API sau audit

Ngày tạo: 2026-07-13

Nguồn audit: `docs/audits/ADMIN_API_COMPLIANCE_AUDIT_2026-07-13.md`

## Spec skip reason

- Path đã kiểm tra: root `spec.md` không tồn tại; `design/` đang là product/architecture SSOT của repo.
- Lý do không tạo spec mới: kế hoạch này sửa compliance và implementation drift theo contract hiện hữu, không định nghĩa product behavior mới.
- Yêu cầu: task nào phát hiện design conflict phải chốt owner doc/decision trước khi sửa code; không tự chọn một phía bằng model memory.

## Nguyên tắc thực thi cho AI tiếp theo

1. Giữ worktree hiện tại; không revert, reset hoặc gom các thay đổi không thuộc task.
2. Đọc app constitution và domain `CONTRACTS.md` trước mỗi vertical slice.
3. Trước khi sửa symbol: GitNexus query/context/impact; nếu HIGH/CRITICAL phải báo blast radius trước khi tiếp tục.
4. TDD cho mọi logic/auth/contract change: test đỏ → patch nhỏ → test xanh → refactor tối thiểu.
5. Không sửa toàn repo bằng search/replace cho response envelope hoặc public ID.
6. Mỗi task chỉ chuyển `cc:TODO` → `cc:WIP` → `cc:完了` khi DoD có bằng chứng.
7. Sau mỗi phase chạy targeted typecheck/lint/test; trước commit chạy GitNexus detect-changes và `git diff --check`.

---

## Phase 0: Khóa bằng chứng và canon [P0]

Purpose: ngăn AI sửa theo tài liệu stale hoặc làm contract drift rộng hơn.

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 0.1 | Reconcile 10 xung đột docs liệt kê trong audit; cập nhật root stale top-five list, role vocabulary, route owners, search/notification phase semantics và error DTO owner `[tdd:skip:docs-only]` | Decision note `docs/architecture/DOC_CONFLICT_RECONCILE_2026-07-13.md`; AGENTS.md top-five stale list replaced by May residual backlog | - | cc:完了 |
| 0.2 | Thêm contract test cho global success envelope và API client unwrap `[tdd:required]` | Full-chain list+detail contract tests green; list canary `{items,pagination}`; detail restored to legacy `{data:item}` until dedicated batch | 0.1 | cc:完了 |
| 0.3 | Thêm security regression harness cho member object authorization `[tdd:required]` | Có fixture hai users A/B và test A không thể read/mutate record của B với expected 404/403 | - | cc:完了 |
| 0.4 | Bổ sung Admin test baseline (Vitest/RTL/MSW hoặc harness hiện có) cho auth, error/empty và route parity `[tdd:required]` | Admin có `test` script + `vitest.config.ts` (admin-unit, jsdom) + setup; forgot-password stub, altar list-500 error state, canonical route snapshot đều green; admin lint+typecheck+test exit 0 (25 tests) | 0.1 | cc:完了 |
| 0.5 | Chốt baseline quality evidence và sửa lỗi lint unused `UploadMediaFields` `[tdd:skip:lint-only]` | API/Admin typecheck + lint + hai static contract audits đều exit 0; log command được lưu trong handoff | 0.1 | cc:完了 |

## Phase 1: Vá object-level authorization [P0]

Purpose: đóng ba IDOR member flows trước mọi refactor kiến trúc.

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 1.1 | Little House: scope detail và log-recitation theo owner; tránh trả owner email cho member `[feature:security] [tdd:required]` | User A đọc/ghi record A thành công; A đọc/ghi record B bị 404/403; admin route vẫn đúng contract | 0.3 | cc:完了 |
| 1.2 | Sacred Forms: scope `/my-applications/:publicId` bằng current user `[feature:security] [tdd:required]` | User A chỉ đọc application A; application B không lộ existence/data; admin detail không regression | 0.3 | cc:完了 |
| 1.3 | Life Liberation: scope member detail và proxy mutation theo sponsor/owner `[feature:security] [tdd:required]` | User A không đọc hoặc thêm proxy vào record B; owner flow và predatory guard tests vẫn pass | 0.3 | cc:完了 |
| 1.4 | Audit toàn bộ `/member/*/:publicId` routes bằng query/repository ownership matrix `[feature:security] [tdd:required]` | Inventory đầy đủ `me/little-house`, `me/altar`; explicit getMemberRecord/getAdminRecord; controller-level regression tests green | 1.1, 1.2, 1.3 | cc:完了 |

## Phase 2: Immutable audit và privacy [P0]

Purpose: biến audit trail thành bằng chứng append-only có thể kiểm tra, không lưu raw IP.

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 2.1 | Viết migration/rollback/backfill design cho audit schema, sequence, previous hash, row hash, correlation ID và IP hash `[needs-spike] [tdd:skip:design-only]` | Design `AUDIT_IMMUTABLE_MIGRATION_DESIGN.md` chốt concurrency, recursive canonicalization, hash_version, publicId random, TRUNCATE block, audit schema/view + REVOKE | 0.1 | cc:完了 |
| 2.2 | Tạo Prisma/SQL migration cho append-only audit storage `[feature:security] [tdd:required]` | **Proven trên clone 92-row legacy pmtl:** migration apply; raw `ip_address` dropped sau khi hash; publicId≠id; seq 1..92 liên tục; UPDATE/DELETE/TRUNCATE đều bị trigger chặn; row count không đổi sau mutation bị chặn | 2.1 | cc:完了 |
| 2.3 | Refactor `AuditService` để hash IP, ghi sequence/hash chain và hỗ trợ transaction client `[feature:security] [tdd:required]` | Recursive redaction + stable key-sort; actor publicId; unit tests green (integrity/service) | 2.2 | cc:完了 |
| 2.4 | Migrate audit readers/writers và bỏ internal-ID-as-public-ID `[tdd:required]` | Admin reader recursive redaction; resourceId honest name; callsites identity/community/calendar/events/life-liberation/sacred/altar/burn use public IDs | 2.3 | cc:完了 |
| 2.5 | Chạy audit integrity verifier và document operator runbook `[tdd:required]` | **Proven trên clone:** verifier PASSED full-chain 92 rows từ genesis; sau khi tamper row 10 → FAILED `previous_hash_mismatch`@seq11 exit 1; restore clone → PASSED lại; runbook `docs/runbooks/AUDIT_INTEGRITY.md` | 2.4 | cc:完了 |

## Phase 3: Hoàn thiện Admin password recovery [P0]

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 3.1 | Tạo feature-local forgot/reset schemas, queries/mutations và anti-enumeration UI states `[feature:security] [tdd:required]` | URL owner ADMIN/WEB; no raw token logs; dual rate-limit; atomic forgot/reset; cookie clear; unit/component tests green | 0.4 | cc:完了 |
| 3.2 | Thêm reset-token route/form và password policy/confirm validation `[feature:security] [tdd:required]` | reset-password.tsx + schemas + 7 component cases (missing/short/mismatch/submit/400/network/success) green | 3.1 | cc:完了 |
| 3.3 | Browser smoke end-to-end password recovery `[feature:security] [tdd:required]` | Forgot → email/token fixture → reset → session cũ bị revoke → cookies clear → login password mới pass; password cũ fail | 3.2 | cc:WIP |

## Phase 4: Khôi phục API layering và contract ownership [P1]

Purpose: sửa theo vertical slice, không đại tu toàn bộ NestJS trong một commit.

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 4.1 | Chốt một owner cho success envelope; migrate một canary endpoint server + api-client + Admin `[tdd:required]` | List canary `{items,pagination}`; detail legacy `{data:item}` restored; full-chain contract tests; migration doc updated | 0.2 | cc:完了 |
| 4.2 | Migrate phần còn lại khỏi manual double wrapping theo bounded batches `[tdd:required]` | **Batch 1+2+3a done (2026-07-14):** guides/downloads; community posts/guestbook; moderation reports; calendar/media/media-library/audit/volunteers/assisted-entry → `{items,pagination}`; full-chain contract tests (batch 1/2/3a); Admin readers + api-client moderation-reports + media-picker cross-consumers updated. **Remaining batch 3b+:** Shape B flat-meta (wisdom/altar/events/life-lib/dharma/little-house), Shape C page-based (daily-practice/recitation), Shape D bare array (species-summary), shared member/public service methods. | 4.1 | cc:WIP |
| 4.3 | Tách Daily Practice controller → schemas/controller/service/repository/mapper `[tdd:required]` | Controller inject Service (không Prisma); repository sở hữu Prisma; mapper ẩn cuid `id`/`scriptureImageMediaId`; 13 unit tests green (typecheck/lint 0) | 4.1 | cc:完了 |
| 4.4 | Thêm actor, audit và transaction ownership cho Daily Practice writes `[tdd:required]` | 9 write ops (guide/preset/faq × create/update/delete) + guide publish transition đều emit audit event; actor = user.publicId (không cuid); repo owns `runInTransaction`/optional `tx?` (service không inject Prisma, giữ 4.3 boundary); atomicity test chứng minh write rollback khi audit append fail; 24 unit tests green (typecheck/lint 0) | 4.3, 2.3 | cc:完了 |
| 4.5 | Tách Admin Media controller → service/repository; audit metadata update/folder mutations `[tdd:required]` | `AdminMediaService` (0 Prisma) + `MediaFoldersRepository`; controller không import Prisma, delegate 11 call; actor fix `user.publicId`+`actorType:"admin"`; đóng gap audit `media.metadata.update` (trước đây không audit); envelopes/Vietnamese/nanoid giữ nguyên; 23 service tests + typecheck/lint 0; verified independent (no Prisma trong controller/service) | 4.1, 2.3 | cc:完了 |
| 4.6 | Tách Admin Audit read controller khỏi Prisma trực tiếp `[tdd:required]` | `AdminAuditLogsService` sở hữu where-building + projection + `redactAndSort`; controller chỉ `ZodValidate`+delegate, không import Prisma; list/detail DTO + pagination + honest `resourceType`/`resourceId` + `hasIpHash` (never raw ip) contract giữ nguyên; 7 unit tests green (typecheck/lint 0) | 2.4 | cc:完了 |

## Phase 5: Public ID, config và secret hardening [P1]

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 5.1 | Inventory mọi public model/generator; chốt rule record mới `nanoid(21)` và legacy compatibility `[tdd:skip:analysis-only]` | Report `docs/architecture/PUBLIC_ID_GENERATOR_INVENTORY_2026-07-14.md`: 18 `nanoid(12)` drift sites/6 files; lookup exact-match → no backfill; non-id generators out of scope | 0.1 | cc:完了 |
| 5.2 | Sửa generator 12 ký tự ở Daily Practice, Self Cultivation và Wisdom-QA `[tdd:required]` | 18 `nanoid(12)`→`nanoid(21)` tại 6 file (daily-practice, daily-recitation, self-cultivation, life-release, little-house, wisdom-qa); RED→GREEN 17 tests (3 canon 21-char guide/preset/faq + 1 legacy 12-char resolve regression); `nanoid(12)` = 0 còn lại; API typecheck+lint exit 0; no backfill (lookup exact-match) | 5.1, 4.3 | cc:完了 |
| 5.3 | Centralize Prisma/JWT/encryption config qua validated ConfigService `[feature:security] [tdd:required]` | Module code không đọc env trực tiếp; invalid/missing secret fail boot với safe structured error | 0.5 | cc:TODO |
| 5.4 | Xóa predictable encryption fallback ngoài test fixture và có key-rotation runbook `[feature:security] [tdd:required]` | Dev/prod thiếu key đều fail closed; test fixture explicit; existing ciphertext migration/rotation được thử | 5.3 | cc:TODO |

## Phase 6: Admin reliability và scale correctness [P1]

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 6.1 | Tạo shared error/retry state và áp dụng cho management lists `[tdd:required]` | 401/403/500/network khác empty; retry hoạt động; representative workspace tests pass | 0.4 | cc:TODO |
| 6.2 | Tạo server-side pagination/query-state pattern (page/limit/sort/filter) `[tdd:required]` | Dataset >120 records hiển thị page 6; sort/filter xuyên toàn dataset; query key chứa toàn bộ state | 6.1 | cc:TODO |
| 6.3 | Migrate lists theo batches: Users/Content → Moderation/Community → System/remaining `[tdd:required]` | Không còn hard cap `limit:100` cho canonical lists; mỗi batch có API+UI tests và narrow invalidation | 6.2 | cc:TODO |
| 6.4 | Chuyển User Create và Contact Info sang Zod field-level validation `[tdd:required]` | Invalid email/URL/phone/password không submit; server field errors map đúng control; Vietnamese copy đủ dấu | 0.4 | cc:TODO |
| 6.5 | Project backend capabilities vào User Detail role actions `[feature:security] [tdd:required]` | Matrix helper `lib/roles.ts` (`assignableRolesForActor`/`canManageTargetRole`) mirror backend `changeRole` gate (chỉ SUPER_ADMIN set/đổi SUPER_ADMIN); User Detail chỉ render assignable options, khóa read-only khi target=SUPER_ADMIN & actor≠SUPER_ADMIN; 10 matrix unit tests + 3 DOM render tests; admin typecheck+lint 0, 38/38 tests | 0.4 | cc:完了 |
| 6.6 | Di chuyển auth calls và notification query về feature-local query/mutation factories `[tdd:required]` | Components không gọi adminClient/queryFn ad hoc; canonical keys/invalidation update cả header và dashboard | 3.1 | cc:TODO |
| 6.7 | Guard `resolvedAt`, chuẩn hóa role unions, xóa placeholder không dùng `[tdd:required]` | `resolvedAt!` phantom cast thay bằng `decisionAt` thật (ModerationReportDetail); canonical `UserRole` union owner tại `lib/roles.ts`, `isAdminRole` narrow `role is AdminRole`, wire auth/use-current-user/sign-in/settings/admin-user; display-label + volunteer-title + reporterSummary (owner api-client) giữ `string` có chủ đích; `statusVariant` unused removed (0 consumer); admin typecheck+lint 0, 25/25 tests | 0.5 | cc:完了 |

## Phase 7: Router decomposition [P2]

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 7.1 | Snapshot canonical paths, auth redirects và route component mapping `[tdd:required]` | Route parity test bao phủ auth, content, community, moderation, user, system và domain routes | 0.4 | cc:TODO |
| 7.2 | Tách `routes/__root.tsx` thành file-based route modules theo bounded families `[tdd:required]` | Root chỉ giữ root composition; route tree/typecheck pass; parity snapshot không đổi ngoài approved aliases | 7.1, 6.6 | cc:TODO |
| 7.3 | Browser smoke canonical route families và legacy redirects `[tdd:required]` | Mọi route owner mở đúng page; Kinh sách/Tài liệu/Kinh văn tự tu/Bạch thoại không drift | 7.2 | cc:TODO |

## Phase 8: Residual domain verification [P1]

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 8.1 | Charity: xác minh global interceptor + Community direct scan có tạo duplicate violation/alert không `[tdd:required]` | Mỗi write vi phạm sinh đúng một canonical outcome; test post/comment/guestbook pass | 1.4 | cc:TODO |
| 8.2 | Life Liberation: triển khai/verify follow-up 30 ngày và mortality escalation theo Phase 1 runtime decision `[tdd:required]` | Scheduler/job owner được chốt; due records tạo đúng notification/control-plane record; mortality threshold escalation có tests | 1.3, 0.1 | cc:TODO |
| 8.3 | Content DTO completeness cho Little House, Daily Practice, Life Release `[tdd:required]` | Route-by-route schema snapshot không thiếu typed blocks/provenance/warnings và không lộ persistence fields | 4.3 | cc:TODO |
| 8.4 | Wisdom-QA search replay/reindex với Meilisearch + SQL fallback `[tdd:required]` | Publish/update/delete/rebuild cho kết quả search nhất quán; replay idempotent; fallback hoạt động khi Meili down | 0.1, 4.2 | cc:TODO |
| 8.5 | Vows assisted-entry recovery/recompute từ audit trail `[tdd:required]` | Fixture drift được rebuild đúng owner/actor/support reason; audit recovery test pass | 2.5 | cc:TODO |

## Phase 9: Pre-launch verification [P0]

| Task | Nội dung | DoD | Depends | Status |
|---|---|---|---|---|
| 9.1 | Full targeted quality matrix: unit/integration/contract/typecheck/lint/build `[tdd:required]` | Tất cả commands trong matrix exit 0; test inventory và skipped tests có lý do cụ thể | Phase 1, Phase 2, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7, Phase 8 | cc:TODO |
| 9.2 | Browser auth/security smoke: cookie, CSRF double-submit, Origin/Referer, RBAC/IDOR `[feature:security] [tdd:required]` | Allowed origins pass; missing/mismatch tokens/origins fail; cross-user objects không lộ; evidence được lưu | 9.1 | cc:TODO |
| 9.3 | Search runtime + SQL fallback smoke và Admin core workflows `[tdd:required]` | Login, recovery, user/content/media/moderation/audit flows pass; Meili healthy và forced fallback trả đúng data | 9.1 | cc:TODO |
| 9.4 | Production backup/restore drill trên môi trường được phép `[tdd:skip:ops-drill]` | Backup restore sang isolated target, checksum/count/auth smoke pass; RPO/RTO và log evidence được ghi | 9.1 | cc:TODO |
| 9.5 | Thêm/verify `/.well-known/security.txt` và sync status docs `[tdd:skip:docs-and-static-route]` | Route trả 200 với contact/expiry canonical; `DESIGN_GAP_ANALYSIS.md`/mapping không còn claim stale | 9.2, 9.3, 9.4 | cc:TODO |

## Gate hoàn tất toàn kế hoạch

- Không còn P0/P1 finding chưa có disposition.
- Không còn member IDOR trong route inventory.
- Audit integrity verifier pass và raw IP không còn trong audit rows mới.
- API/Admin typecheck, lint, build, contract audits và targeted tests đều pass.
- Admin có test cho auth recovery, error-vs-empty, server pagination, permission projection và route parity.
- Production restore drill, CSRF/origin checks, Meili fallback và security.txt có bằng chứng.
- GitNexus detect-changes xác nhận mỗi commit chỉ ảnh hưởng expected symbols/flows.

## Cách bắt đầu cho AI khác

- Lượt đầu tiên: `$harness-work 0.3`, sau đó lần lượt 1.1, 1.2, 1.3 để đóng IDOR; task 0.1 có thể chạy song song.
- Khi các task độc lập đã rõ dependency: `$breezing all`.
- Với long-running plan: `$harness-loop all`.
