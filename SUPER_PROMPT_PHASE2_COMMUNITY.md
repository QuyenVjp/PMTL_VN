# SUPER PROMPT — Phase 2: Community Management
# Backend (NestJS) + Admin UI (React)

> Web frontend (`apps/web`) KHÔNG nằm trong scope.
> Mỗi section phải 100% hoàn thiện trước khi sang section tiếp theo.

---

## 0. KHỞI ĐỘNG BẮT BUỘC — CHẠY NGAY KHI BẮT ĐẦU

### Bước 1 — Đọc context repo
```
AGENTS.md
CLAUDE.md
design/03-domains/community/   ← đọc toàn bộ folder này
apps/api/prisma/schema.prisma  ← đọc phần community tables
```

### Bước 2 — Dùng MCP postgres để hiểu DB thực tế
```sql
-- Chạy qua MCP postgres-pmtl để xem tables thực tế
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('community_posts','guestbook_entries','volunteers')
ORDER BY table_name;

-- Xem columns của từng table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'community_posts' ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'guestbook_entries' ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'volunteers' ORDER BY ordinal_position;
```

### Bước 3 — Dùng MCP context7 khi cần tra docs
```
-- Khi implement Prisma query phức tạp:
mcp__context7__resolve-library-id("prisma")
mcp__context7__query-docs(libraryId, "create update transaction")

-- Khi cần TanStack Query v5 patterns:
mcp__context7__resolve-library-id("tanstack query")
mcp__context7__query-docs(libraryId, "useMutation queryOptions invalidate")

-- Khi cần NestJS decorators:
mcp__context7__resolve-library-id("nestjs")
mcp__context7__query-docs(libraryId, "guards roles decorators")
```

### Bước 4 — Đọc code hiện có trước khi viết
```
apps/api/src/modules/community/community.controller.ts  ← routes đã có
apps/api/src/modules/community/community.service.ts     ← service đã có
apps/api/src/modules/community/community.schemas.ts     ← schemas đã có
apps/admin/src/features/community-posts/               ← admin UI scaffold
apps/admin/src/features/guestbook/                     ← admin UI scaffold
apps/admin/src/features/volunteers/                    ← admin UI scaffold
```

---

## 1. TRẠNG THÁI HIỆN TẠI — ĐỌC TRƯỚC KHI CODE

### Đã có (KHÔNG làm lại):
- ✅ `GET/PATCH/DELETE /admin/community/posts` — admin list/update/delete posts
- ✅ `GET /admin/community/guestbook` + `PATCH/DELETE guestbook/:id` — guestbook CRUD
- ✅ Admin UI scaffold: `community-posts/`, `guestbook/`, `volunteers/` đều có `queries.ts` + `mutations.ts` + `index.tsx`
- ✅ `Volunteer` Prisma model: `id, publicId, displayName, role, avatarUrl, phone, zaloLink, bio, sortOrder, isActive`

### Còn thiếu (PHẢI làm):
- ❌ `POST /admin/community/posts/:id/pin` + `unpin` + `hide` + `restore`
- ❌ Volunteer API hoàn chỉnh (model có, API chưa có)
- ❌ Admin UI: kiểm tra và hoàn thiện từng feature (xem Section 3)

---

## 2. API — NHỮNG GÌ CẦN BỔ SUNG

### 2a. Community Posts — thêm action routes

File: `apps/api/src/modules/community/community.controller.ts`

```typescript
// Thêm vào AdminCommunityController (đã có ở controller)
@Post("posts/:publicId/pin")
@UseGuards(AuthGuard) @Roles("ADMIN")
pinPost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
  return this.communityService.adminPinPost(publicId, user.id);
}

@Post("posts/:publicId/unpin")
@UseGuards(AuthGuard) @Roles("ADMIN")
unpinPost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
  return this.communityService.adminUnpinPost(publicId, user.id);
}

@Post("posts/:publicId/hide")
@UseGuards(AuthGuard) @Roles("ADMIN")
hidePost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
  return this.communityService.adminHidePost(publicId, user.id);
}

@Post("posts/:publicId/restore")
@UseGuards(AuthGuard) @Roles("ADMIN")
restorePost(@Param("publicId") publicId: string, @CurrentUser() user: AuthenticatedUser) {
  return this.communityService.adminRestorePost(publicId, user.id);
}
```

Service methods tương ứng: tìm post theo publicId → update `isPinned`/`isHidden` → `audit.append()` → return `{ data: { publicId, updated: true } }`

### 2b. Volunteer API — tạo mới hoàn toàn

Thêm vào `AdminCommunityController` hoặc tạo controller mới:

```
GET    /admin/community/volunteers              list (filter: isActive, search)
POST   /admin/community/volunteers              create
GET    /admin/community/volunteers/:id          detail
PATCH  /admin/community/volunteers/:id          update
DELETE /admin/community/volunteers/:id          delete
POST   /admin/community/volunteers/:id/activate toggle isActive = true
POST   /admin/community/volunteers/:id/deactivate toggle isActive = false
```

Zod schema tối thiểu:
```typescript
export const createVolunteerSchema = z.object({
  displayName: z.string().min(1).max(100),
  role:        z.string().min(1).max(100),
  avatarUrl:   z.string().url().optional(),
  phone:       z.string().max(20).optional(),
  zaloLink:    z.string().url().optional(),
  bio:         z.string().max(500).optional(),
  sortOrder:   z.coerce.number().int().min(0).optional(),
  isActive:    z.boolean().optional(),
});
```

**Lưu ý Prisma**: `Volunteer` KHÔNG có `userId` FK → không cần auth context cho ownership check. Chỉ cần admin role.

**Audit**: dùng `content.create / content.update / content.delete` với `targetType: "volunteer"`

### 2c. Verify guestbook routes đủ

Kiểm tra xem controller đã có chưa:
- `POST /admin/community/guestbook/:id/approve` — nếu chưa có, thêm
- `POST /admin/community/guestbook/:id/reject` — nếu chưa có, thêm

Nếu đang dùng `PATCH status: "APPROVED"/"REJECTED"` thay vì dedicated routes, giữ nguyên — không refactor nếu đã hoạt động.

---

## 3. ADMIN UI — HOÀN THIỆN TỪNG FEATURE

### Quy trình verify trước khi sửa:
Với mỗi feature folder, đọc `index.tsx` và kiểm tra:
1. Table có render đúng columns không?
2. Row actions có đủ (edit, delete, status actions) không?
3. Dialog create/edit có form fields đủ không?
4. Mutations có invalidate đúng queryKey không?
5. Error handling có `onError: handleApiError` không?

### 3a. Community Posts (`apps/admin/src/features/community-posts/`)

**mutations.ts** cần có:
```typescript
useHidePost()      → POST /admin/community/posts/:id/hide
useRestorePost()   → POST /admin/community/posts/:id/restore
usePinPost()       → POST /admin/community/posts/:id/pin
useUnpinPost()     → POST /admin/community/posts/:id/unpin
useDeletePost()    → DELETE /admin/community/posts/:id
```

**index.tsx** table cần columns:
- Author (displayName)
- Content preview (truncated ~80 chars)
- Status badge (PUBLISHED/HIDDEN/REPORTED)
- isPinned indicator
- heartCount / commentCount / reportCount
- createdAt
- Row actions: Hide, Restore, Pin/Unpin, Delete

**Filter toolbar**: filter by status (ALL/HIDDEN/REPORTED)

### 3b. Guestbook (`apps/admin/src/features/guestbook/`)

**mutations.ts** cần:
```typescript
useApproveGuestbook()  → PATCH guestbook/:id { status: "APPROVED" }
useRejectGuestbook()   → PATCH guestbook/:id { status: "REJECTED" }
useDeleteGuestbook()   → DELETE guestbook/:id
```

**index.tsx** table:
- Author name + email (nếu có)
- Message preview (truncated)
- Status badge: PENDING / APPROVED / REJECTED
- createdAt
- Row actions: Approve ✓, Reject ✗, Delete

### 3c. Volunteers (`apps/admin/src/features/volunteers/`)

Đây là feature quản lý **danh sách tình nguyện viên** hiển thị công khai — KHÔNG phải đơn đăng ký.

**mutations.ts** cần:
```typescript
useCreateVolunteer()     → POST /admin/community/volunteers
useUpdateVolunteer()     → PATCH /admin/community/volunteers/:id
useDeleteVolunteer()     → DELETE /admin/community/volunteers/:id
useActivateVolunteer()   → POST /admin/community/volunteers/:id/activate
useDeactivateVolunteer() → POST /admin/community/volunteers/:id/deactivate
```

**index.tsx** table:
- Avatar (img nhỏ 32x32 nếu có avatarUrl, fallback icon)
- displayName + role
- phone / zaloLink (truncated)
- isActive badge
- sortOrder
- Row actions: Edit, Activate/Deactivate, Delete

**Create/Edit dialog** form fields: displayName*, role*, avatarUrl, phone, zaloLink, bio, sortOrder, isActive checkbox

---

## 4. CONVENTIONS BẮT BUỘC (KHÔNG ĐƯỢC BỎ QUA)

```typescript
// ✅ ĐÚNG — Prisma optional fields
await this.prisma.volunteer.create({
  data: {
    publicId:    nanoid(),
    displayName: dto.displayName,
    role:        dto.role,
    avatarUrl:   dto.avatarUrl   ?? null,   // ← ?? null
    phone:       dto.phone       ?? null,
    zaloLink:    dto.zaloLink    ?? null,
    bio:         dto.bio         ?? null,
    sortOrder:   dto.sortOrder   ?? 0,
    isActive:    dto.isActive    ?? true,
  },
});

// ✅ ĐÚNG — Audit log bắt buộc
await this.audit.append(
  { actorId: adminId, actorType: "admin" },
  "content.create",
  "volunteer",
  newVolunteer.publicId,
);

// ✅ ĐÚNG — Error class
throw new NotFoundError("Volunteer", publicId);
throw new ConflictError("Slug đã tồn tại");

// ❌ SAI — Không dùng generic Error
throw new Error("not found");
throw new NotFoundException(); // dùng AppError thay
```

---

## 5. VERIFICATION — CHẠY SAU KHI HOÀN THÀNH

```bash
# Typecheck cả hai apps
pnpm --filter @pmtl/api typecheck
pnpm --filter @pmtl/admin typecheck

# Verify DB thực tế qua MCP postgres
# Chạy query để confirm data flow đúng:
SELECT COUNT(*) FROM community_posts;
SELECT COUNT(*) FROM guestbook_entries;
SELECT COUNT(*) FROM volunteers;
```

---

## 6. ACCEPTANCE CRITERIA — PHASE 2 DONE KHI:

### API
- [ ] `POST pin/unpin/hide/restore` trên community posts hoạt động
- [ ] Volunteer CRUD đầy đủ (7 routes)
- [ ] Guestbook approve/reject hoạt động
- [ ] Mọi write path có `audit.append()`
- [ ] Mọi optional field dùng `?? null`
- [ ] `pnpm --filter @pmtl/api typecheck` PASS

### Admin UI
- [ ] Community posts table: filter status + row actions đủ (hide/restore/pin/delete)
- [ ] Guestbook table: approve/reject/delete actions hoạt động
- [ ] Volunteers table: full CRUD + activate/deactivate
- [ ] Tất cả mutations có `onError: handleApiError`
- [ ] Tất cả mutations invalidate đúng queryKey
- [ ] `pnpm --filter @pmtl/admin typecheck` PASS

### KHÔNG chuyển Phase 3 nếu còn:
- Hardcoded `userId = "temp-user-id"` hay `"placeholder"`
- `// TODO` còn sót trong code vừa viết
- TypeScript errors
- Missing audit log trên write path

---

## 7. FILE MẪU NHANH

### Admin mutations.ts pattern
```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { communityPostKeys } from "./queries.js";

export function useHidePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) =>
      adminClient.post(`/admin/community/posts/${publicId}/hide`),
    onSuccess: () => {
      toast.success("Đã ẩn bài đăng.");
      void qc.invalidateQueries({ queryKey: communityPostKeys.lists() });
    },
    onError: handleApiError,
  });
}
```

### NestJS action route pattern
```typescript
@Post(":publicId/hide")
@UseGuards(AuthGuard) @Roles("ADMIN")
async hidePost(
  @Param("publicId") publicId: string,
  @CurrentUser() user: AuthenticatedUser,
) {
  const post = await this.prisma.communityPost.findUnique({ where: { publicId } });
  if (!post) throw new NotFoundError("CommunityPost", publicId);

  await this.prisma.communityPost.update({
    where: { publicId },
    data: { isHidden: true },
  });

  await this.audit.append(
    { actorId: user.id, actorType: "admin" },
    "moderation.hide",
    "community_post",
    publicId,
  );

  return { data: { publicId, hidden: true } };
}
```

---

*Phase 2 scope: Community Posts actions + Volunteer CRUD + Guestbook approve/reject + Admin UI hoàn thiện.*
*Khi done, Phase 3: Calendar domain.*
