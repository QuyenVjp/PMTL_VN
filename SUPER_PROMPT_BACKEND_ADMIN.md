# SUPER PROMPT — PMTL_VN Backend + Admin Implementation

> Dùng prompt này để giao cho AI agent thực thi từng phase.
> Mỗi phase phải 100% hoàn thiện (API + Admin) trước khi chuyển sang phase tiếp theo.
> Web frontend (`apps/web`) **KHÔNG** nằm trong scope của prompt này.

---

## 0. CONTEXT BẮT BUỘC — ĐỌC TRƯỚC KHI LÀM BẤT KỲ THỨ GÌ

Trước khi code bất kỳ dòng nào, agent PHẢI đọc theo thứ tự:

```
1. AGENTS.md                          ← coding rules & tool routing
2. CLAUDE.md                          ← repo operating contract
3. TEAM_GUIDE.md                      ← domain ownership & terminology
4. design/01-repo-constitution/REPO_STRUCTURE.md
5. design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
6. design/02-platform-baseline/api-runtime/PLATFORM_MODULES.md
7. design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md
8. design/04-execution-overlay/api/API_ROUTE_INVENTORY.md
9. design/04-execution-overlay/api/APPS_API_IMPLEMENTATION_CANON.md
10. design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md
11. design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md
12. design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md
13. design/04-execution-overlay/api/AUDIT_POLICY.md
14. apps/api/prisma/schema.prisma     ← source of truth cho DB schema
```

Sau đó đọc design doc của domain đang làm trong `design/03-domains/<domain>/`.

---

## 1. STACK & CONVENTIONS — KHÔNG ĐƯỢC DEVIATION

### Backend (apps/api)
- **NestJS** với decorators, DI, module pattern
- **Prisma 7** — dùng `?? null` thay vì `undefined` trong `create.data` và `update.data`
- **Zod** validate mọi input (body, query, params) — không dùng class-validator
- **pino** structured logging — không dùng `console.log`
- **AppError** subclasses (`NotFoundError`, `ConflictError`, `ForbiddenError`, v.v.) từ `apps/api/src/common/errors/app-error.ts`
- **GlobalExceptionFilter** đã handle: `AppError`, `HttpException`, `ZodError`, `PrismaClientKnownRequestError`, `PrismaClientValidationError`
- Mọi import Prisma từ `../../generated/prisma/client.js` (KHÔNG phải `index.js`)
- Response shape:
  - list: `{ data: [...], meta: { pagination: { total, limit, offset, hasMore } } }`
  - detail/action: `{ data: {...} }`
  - create: `{ data: { publicId } }` với status 201
  - delete/empty: 204 no body
- Audit log bắt buộc cho mọi write path — dùng `AuditService.append()` hoặc `appendInTransaction()`
- Auth guards: `@UseGuards(AuthGuard)` + `@Roles('ADMIN')` đã có sẵn
- Public route: `@Public()` decorator

### Admin Frontend (apps/admin)
- **React + Vite + TypeScript**
- **TanStack Query v5** — dùng `queryOptions()` + `useMutation()` + `useQueryClient()`
- **TanStack Router** — `useNavigate()`, `Link` từ `@tanstack/react-router`
- **shadcn/ui** — dùng components từ `@/components/ui/*`
- **TanStack Table** — dùng `useSafeReactTable` wrapper từ `@/lib/table/use-safe-react-table`
- Pattern đúng cho workspace: `queries.ts` + `mutations.ts` + `index.tsx`
- `adminClient` từ `@/lib/api/admin-client` — tự inject auth header
- `handleApiError` từ `@/lib/handle-api-error` — dùng trong `onError`
- `toast` từ `sonner` — success/error messages
- Checkbox: dùng shadcn `<Checkbox>` KHÔNG dùng native `<input type="checkbox">`
- Image picker: dùng Popover + grid thumbnails, KHÔNG dùng `<Select>` với `<img>` trong dropdown
- Image URL: dùng `asset.url` trực tiếp (field từ API response), KHÔNG construct `/api/admin/media/.../content`
- Mọi text user-facing: tiếng Việt đầy đủ dấu
- Không đặt business logic trong page component — đặt trong `queries.ts`/`mutations.ts`

---

## 2. TRẠNG THÁI HIỆN TẠI

### Đã hoàn thiện (KHÔNG cần làm lại)
- ✅ Platform infra: auth, sessions, audit, storage, health, metrics, feature-flags, rate-limit, webhook
- ✅ Module: `identity` (login/register/profile/sessions)
- ✅ Module: `engagement` (gongke, repentance, activation logs)
- ✅ Module: `vows-merit` (vows, merit tracking)
- ✅ Module: `notification` (API scaffolded + push job)
- ✅ Admin: `dashboard`, `users`, `sessions`, `media`, `media-library`, `practice` stats, `auth`
- ✅ GlobalExceptionFilter với Prisma error handling
- ✅ Prisma schema (tất cả tables đã migrate)

### Đang scaffold (cần hoàn thiện)
- 🟡 `content` — media library done, chanting chưa full CRUD
- 🟡 `community` — scaffolded, chưa có endpoint hoàn chỉnh
- 🟡 `calendar` — scaffolded, chưa full
- 🟡 `moderation` — scaffolded, chưa full
- 🟡 `wisdom-qa` — scaffolded, chưa full
- 🟡 `contact` — scaffolded, chưa full
- 🟡 `search` — chưa implement (Meilisearch integration)

---

## 3. PHASES — THỨ TỰ THỰC THI

---

### PHASE 1 — Content: Chanting & Guides Management

**Mục tiêu**: Admin quản lý được toàn bộ nội dung pháp tu (kinh kệ, môi trường tu tập, hướng dẫn, tài liệu).

**Đọc thêm**: `design/03-domains/content/`

#### API cần implement:

```
# Chanting (Kinh kệ)
GET    /admin/content/chanting/sessions          ← list all sessions (paginated)
POST   /admin/content/chanting/sessions          ← create session
GET    /admin/content/chanting/sessions/:id      ← detail
PATCH  /admin/content/chanting/sessions/:id      ← update
DELETE /admin/content/chanting/sessions/:id      ← delete
POST   /admin/content/chanting/sessions/:id/publish
POST   /admin/content/chanting/sessions/:id/unpublish

# Environment Rules (Môi trường tu tập) — API đã scaffold, cần hoàn thiện
GET    /admin/content/chanting/environment-rules
POST   /admin/content/chanting/environment-rules
GET    /admin/content/chanting/environment-rules/:id
PATCH  /admin/content/chanting/environment-rules/:id
DELETE /admin/content/chanting/environment-rules/:id

# Guides (Hướng dẫn)
GET    /admin/content/guides
POST   /admin/content/guides
GET    /admin/content/guides/:id
PATCH  /admin/content/guides/:id
DELETE /admin/content/guides/:id
POST   /admin/content/guides/:id/publish
POST   /admin/content/guides/:id/unpublish

# Downloads (Tài liệu tải về)
GET    /admin/content/downloads
POST   /admin/content/downloads
GET    /admin/content/downloads/:id
PATCH  /admin/content/downloads/:id
DELETE /admin/content/downloads/:id
```

#### Admin features cần implement/hoàn thiện:
- `apps/admin/src/features/chant-admin/` — full CRUD cho sessions + environment rules
- `apps/admin/src/features/guides/` — full CRUD list/create/edit/delete/publish
- `apps/admin/src/features/downloads/` — full CRUD list/create/edit/delete

#### Acceptance criteria (100% complete):
- [ ] Tất cả API endpoints trả đúng response shape
- [ ] Zod validation cho mọi body/query
- [ ] Audit log cho mọi write (create/update/delete/publish)
- [ ] Admin table hiển thị list với pagination
- [ ] Admin có dialog/sheet tạo mới
- [ ] Admin có dialog sửa
- [ ] Admin có confirm delete
- [ ] Admin có publish/unpublish nếu có status
- [ ] Row actions: Edit, Delete, (Publish/Unpublish)
- [ ] Bulk actions nếu cần
- [ ] Error handling hiện toast đúng
- [ ] Typecheck pass: `pnpm --filter @pmtl/api typecheck && pnpm --filter @pmtl/admin typecheck`

---

### PHASE 2 — Community Management

**Mục tiêu**: Admin quản lý bài viết cộng đồng, guestbook entries, và tình nguyện viên.

**Đọc thêm**: `design/03-domains/community/`

#### API cần implement:

```
# Community Posts
GET    /admin/community/posts              ← list (filter by status, author, type)
GET    /admin/community/posts/:id          ← detail
PATCH  /admin/community/posts/:id          ← update (admin chỉnh sửa bài)
DELETE /admin/community/posts/:id          ← delete
POST   /admin/community/posts/:id/pin      ← pin bài
POST   /admin/community/posts/:id/unpin
POST   /admin/community/posts/:id/hide     ← admin ẩn
POST   /admin/community/posts/:id/restore

# Guestbook (Sổ lưu bút)
GET    /admin/community/guestbook          ← list entries
GET    /admin/community/guestbook/:id      ← detail
DELETE /admin/community/guestbook/:id
POST   /admin/community/guestbook/:id/approve
POST   /admin/community/guestbook/:id/reject

# Volunteers (Tình nguyện viên)
GET    /admin/community/volunteers         ← list applications
GET    /admin/community/volunteers/:id     ← detail
PATCH  /admin/community/volunteers/:id     ← update status/notes
POST   /admin/community/volunteers/:id/approve
POST   /admin/community/volunteers/:id/reject
```

#### Admin features:
- `apps/admin/src/features/community-posts/` — full table + moderation actions
- `apps/admin/src/features/guestbook/` — full table + approve/reject
- `apps/admin/src/features/volunteers/` — full table + status management

#### Acceptance criteria: (same checklist as Phase 1 + moderation actions working)

---

### PHASE 3 — Calendar Management

**Mục tiêu**: Admin quản lý lịch sự kiện pháp môn.

**Đọc thêm**: `design/03-domains/calendar/`

#### API cần implement:

```
GET    /admin/calendar/events              ← list (filter by type, date range, status)
POST   /admin/calendar/events              ← create
GET    /admin/calendar/events/:id          ← detail
PATCH  /admin/calendar/events/:id          ← update
DELETE /admin/calendar/events/:id          ← delete
POST   /admin/calendar/events/:id/publish
POST   /admin/calendar/events/:id/cancel
GET    /admin/calendar/events/:id/rsvps    ← list RSVPs
```

#### Admin features:
- `apps/admin/src/features/calendar/` — full calendar event management
  - Table view với filter theo tháng/type
  - Create/Edit dialog
  - RSVP management sheet

#### Acceptance criteria: same checklist Phase 1

---

### PHASE 4 — Wisdom Q&A Management

**Mục tiêu**: Admin quản lý hỏi đáp pháp môn, duyệt câu hỏi, viết câu trả lời.

**Đọc thêm**: `design/03-domains/wisdom-qa/`

#### API cần implement:

```
GET    /admin/wisdom-qa/questions          ← list (filter by status, category)
POST   /admin/wisdom-qa/questions          ← admin tạo câu hỏi
GET    /admin/wisdom-qa/questions/:id      ← detail + answers
PATCH  /admin/wisdom-qa/questions/:id      ← update
DELETE /admin/wisdom-qa/questions/:id
POST   /admin/wisdom-qa/questions/:id/publish
POST   /admin/wisdom-qa/questions/:id/reject

GET    /admin/wisdom-qa/questions/:id/answers
POST   /admin/wisdom-qa/questions/:id/answers   ← thêm câu trả lời
PATCH  /admin/wisdom-qa/answers/:id
DELETE /admin/wisdom-qa/answers/:id
POST   /admin/wisdom-qa/answers/:id/set-primary  ← đặt làm câu trả lời chính

GET    /admin/wisdom-qa/categories
POST   /admin/wisdom-qa/categories
PATCH  /admin/wisdom-qa/categories/:id
DELETE /admin/wisdom-qa/categories/:id
```

#### Admin features:
- `apps/admin/src/features/help-center/` — Q&A management với answer editor
- `apps/admin/src/features/guestbook/` — check overlap với community guestbook

#### Acceptance criteria: same checklist Phase 1 + answer editor working

---

### PHASE 5 — Moderation

**Mục tiêu**: Admin xử lý báo cáo vi phạm và quản lý bình luận.

**Đọc thêm**: `design/03-domains/moderation/`

#### API cần implement:

```
# Comment moderation
GET    /admin/moderation/comments          ← list (filter: pending/approved/hidden/reported)
GET    /admin/moderation/comments/:id      ← detail + context
POST   /admin/moderation/comments/:id/approve
POST   /admin/moderation/comments/:id/hide
POST   /admin/moderation/comments/:id/restore
DELETE /admin/moderation/comments/:id

# Reports (Báo cáo vi phạm)
GET    /admin/moderation/reports           ← list (filter: pending/resolved/dismissed)
GET    /admin/moderation/reports/:id       ← detail + reported content + history
POST   /admin/moderation/reports/:id/resolve
POST   /admin/moderation/reports/:id/dismiss
POST   /admin/moderation/reports/:id/escalate

# Moderation log
GET    /admin/moderation/log               ← audit trail các quyết định moderation
```

#### Admin features:
- `apps/admin/src/features/moderation-comments/` — comment moderation queue
- `apps/admin/src/features/moderation-reports/` — report review workflow

#### Acceptance criteria: same checklist Phase 1 + moderation decision logging

---

### PHASE 6 — Contact Management

**Mục tiêu**: Admin xem và xử lý form liên hệ từ người dùng.

**Đọc thêm**: `design/03-domains/contact/`

#### API cần implement:

```
GET    /admin/contact/submissions          ← list (filter: status, date)
GET    /admin/contact/submissions/:id      ← detail
PATCH  /admin/contact/submissions/:id      ← update status / add note
POST   /admin/contact/submissions/:id/mark-handled
POST   /admin/contact/submissions/:id/archive
DELETE /admin/contact/submissions/:id
```

#### Admin features:
- Tạo mới `apps/admin/src/features/contact/` — submission review table + detail sheet

#### Acceptance criteria: same checklist Phase 1

---

### PHASE 7 — Search Integration (Meilisearch)

**Mục tiêu**: Tích hợp Meilisearch để search được nội dung. Admin quản lý search index.

**Đọc trước**: `design/02-platform-baseline/optional-scale/MEILISEARCH_ARCHITECTURE.md`

#### API cần implement:

```
# Admin search management
GET    /admin/search/status                ← index stats (docs count, last sync)
POST   /admin/search/reindex               ← trigger full reindex
POST   /admin/search/reindex/:entity       ← reindex specific entity (content, community, qa)
GET    /admin/search/log                   ← recent index operations

# Public search (đã có hoặc cần implement)
GET    /search?q=&type=&limit=&offset=     ← unified search endpoint
```

#### Indexing strategy (sync các domains đã làm xong ở Phase 1-6):
- Content: chanting sessions, guides, downloads
- Community: community posts (published only)
- Wisdom QA: questions + answers (published only)

#### Admin features:
- `apps/admin/src/features/system/` (hoặc settings) — search index management panel

#### Acceptance criteria:
- [ ] Meilisearch connection configured via env
- [ ] Index schema defined cho mỗi entity
- [ ] Sync xảy ra sau mỗi publish/update
- [ ] Admin có thể trigger reindex thủ công
- [ ] Search API trả kết quả đúng
- [ ] Typecheck pass

---

### PHASE 8 — Notification Admin

**Mục tiêu**: Admin gửi push notification và xem lịch sử gửi.

**Đọc thêm**: `design/03-domains/notification/`

#### API cần implement:

```
# Push notification management
GET    /admin/notifications/jobs           ← list push jobs (paginated)
POST   /admin/notifications/jobs           ← create/schedule notification
GET    /admin/notifications/jobs/:id       ← detail + delivery stats
POST   /admin/notifications/jobs/:id/cancel
POST   /admin/notifications/jobs/:id/redrive  ← retry failed

GET    /admin/notifications/subscribers    ← list push subscribers (count/stats)
GET    /admin/notifications/stats          ← delivery rate stats
```

#### Admin features:
- `apps/admin/src/features/notifications/` — push job management + create form + stats

#### Acceptance criteria: same checklist Phase 1 + delivery stats visible

---

## 4. QUY TRÌNH LÀM MỖI PHASE

```
1. Đọc design doc domain tương ứng (design/03-domains/<domain>/)
2. Đọc Prisma schema để hiểu tables đã có
3. Đọc service/controller scaffold hiện tại trong apps/api/src/modules/<domain>/
4. Implement API:
   a. Zod schemas trong <domain>.schemas.ts
   b. Service methods trong <domain>.service.ts
   c. Controller routes trong <domain>.controller.ts
   d. Audit log cho write paths
5. Implement Admin:
   a. queries.ts — queryOptions + types
   b. mutations.ts — useMutation + toast + invalidation
   c. index.tsx — table + dialogs/sheets
6. Verify:
   pnpm --filter @pmtl/api typecheck
   pnpm --filter @pmtl/admin typecheck
7. Test thủ công các luồng chính qua UI
8. Chỉ chuyển phase khi acceptance criteria 100% pass
```

---

## 5. NON-NEGOTIABLES TUYỆT ĐỐI

| Rule | Mô tả |
|------|-------|
| **Full impl, no stub** | Không viết `// TODO implement` hay `return null` tạm |
| **Prisma `?? null`** | Optional fields trong `create.data`/`update.data` phải dùng `?? null`, không để `undefined` |
| **Prisma import** | Luôn `from "../../generated/prisma/client.js"`, KHÔNG `index.js` |
| **Zod validate all** | Mọi request body/query đều qua `zodSchema.parse()` |
| **Audit log** | `AuditService.append()` sau mỗi create/update/delete/publish/moderation action |
| **Error class** | `throw new NotFoundError()`, `throw new ConflictError()`, v.v. — không `throw new Error()` |
| **Vietnamese text** | Mọi text hiển thị user: tiếng Việt đầy đủ dấu |
| **No logic in page** | Business logic trong `queries.ts`/`mutations.ts`/service, không trong component |
| **Typecheck must pass** | Không commit nếu typecheck còn lỗi |
| **Design/ is truth** | Nếu design doc nói khác với assumption của mày, design doc thắng |

---

## 6. CẤU TRÚC FILE MẪU

### API — service method mẫu

```typescript
// apps/api/src/modules/<domain>/<domain>.service.ts
async createItem(dto: CreateItemDto, creatorId: string) {
  const existing = await this.prisma.<model>.findUnique({ where: { slug: dto.slug } });
  if (existing) throw new ConflictError("Slug đã tồn tại");

  const item = await this.prisma.<model>.create({
    data: {
      publicId:    nanoid(),
      title:       dto.title,
      slug:        dto.slug,
      description: dto.description ?? null,   // ← ?? null, KHÔNG undefined
      featured:    dto.featured    ?? false,
      createdById: creatorId,
    },
  });

  await this.auditService.append({
    actorId:    creatorId,
    action:     "content.item.create",
    targetType: "ContentItem",
    targetId:   item.id,
    meta:       { publicId: item.publicId, title: item.title },
  });

  return { data: { publicId: item.publicId } };
}
```

### Admin — queries.ts mẫu

```typescript
// apps/admin/src/features/<feature>/queries.ts
import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";

export interface ItemListItem {
  publicId: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
}

export const itemKeys = {
  all:    () => ["admin", "items"] as const,
  list:   (p?: object) => [...itemKeys.all(), "list", p] as const,
  detail: (id: string) => [...itemKeys.all(), "detail", id] as const,
};

export function itemListOptions(params?: { limit?: number; offset?: number }) {
  return queryOptions({
    queryKey: itemKeys.list(params),
    queryFn: () => adminClient.get<{ data: ItemListItem[]; meta: { pagination: { total: number } } }>(
      "/admin/<domain>/items",
      params,
    ),
    staleTime: 60_000,
  });
}
```

### Admin — mutations.ts mẫu

```typescript
// apps/admin/src/features/<feature>/mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client";
import { handleApiError } from "@/lib/handle-api-error";
import { itemKeys } from "./queries";

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateItemInput) =>
      adminClient.post<{ publicId: string }>("/admin/<domain>/items", body),
    onSuccess: () => {
      toast.success("Đã tạo thành công.");
      void qc.invalidateQueries({ queryKey: itemKeys.list() });
    },
    onError: handleApiError,
  });
}
```

---

## 7. CÁC LỖI HAY GẶP — TRÁNH NGAY

| Lỗi | Fix |
|-----|-----|
| `PrismaClientValidationError` khi create | `dto.field ?? null` trong data object |
| Import `Prisma` từ `index.js` | Đổi thành `client.js` |
| Image preview broken | Dùng `asset.url` từ response, không construct `/api/admin/media/...` |
| React freeze khi mở dialog | Thêm `enabled: open` vào `useQuery` bên trong dialog/sheet |
| Native `<input type="checkbox">` | Đổi thành shadcn `<Checkbox>` |
| Select dropdown với `<img>` bên trong | Dùng Popover + grid thumbnails thay |
| `undefined` passed to Prisma `where` | Dùng conditional check trước khi thêm vào where object |

---

*Prompt này được generate từ repo state 2026-03-30. Cập nhật khi conventions thay đổi.*
