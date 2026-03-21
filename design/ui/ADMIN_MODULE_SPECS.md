# ADMIN_MODULE_SPECS — Per-Module Admin Workspace Specifications

File này chốt đặc tả chi tiết cho mỗi admin workspace/module.
Bổ sung cho `ADMIN_ARCHITECTURE.md` (shell/layout) và `PAGE_INVENTORY.md` (route list).
Mọi workspace phải có đủ spec trước khi code admin feature tương ứng.

> **Shell architecture**: `design/ui/ADMIN_ARCHITECTURE.md`
> **Page routes**: `design/ui/PAGE_INVENTORY.md`
> **API routes**: `tracking/api-route-inventory.md`
> **Component specs**: `design/ui/COMPONENT_SPECS.md`

---

## Spec template (áp dụng cho mọi workspace)

Mỗi workspace phải có:
- Route + page title
- Table/list view spec (columns, default sort, filter chips)
- Detail/edit view spec
- Create flow (nếu có)
- Bulk actions
- Role requirements
- Audit events triggered
- Empty / Loading / Error / Success states
- Query invalidation rules
- API dependency
- Feature flag dependency (nếu có)
- Operational notes

---

## 1. Dashboard (`/dashboard`)

**Role**: `admin+`
**API deps**: `/api/admin/system/dashboard-stats`, `/api/content/posts?limit=5`, `/api/moderation/reports?status=pending&limit=5`, `/api/he-thong/audit-logs?limit=10`

### Stat cards (row 1)
| Card | Metric | Query |
|---|---|---|
| Thành viên | Total users | `SELECT COUNT(*) FROM users WHERE role != 'banned'` |
| Bài viết | Published posts | `SELECT COUNT(*) FROM posts WHERE status = 'published'` |
| Báo cáo pending | Open reports | `SELECT COUNT(*) FROM moderation_reports WHERE status = 'pending'` |
| Tu tập hôm nay | Practice logs today | `SELECT COUNT(*) FROM practice_logs WHERE DATE(created_at) = CURRENT_DATE` |

### Recent posts table (5 rows compact)
Columns: Tiêu đề, Status chip, Author, Date
Click row → navigate to `/noi-dung/bai-viet/$postId`

### Pending reports table (5 rows compact)
Columns: #ID, Content type, Reason, Reporter, Time ago
Click row → navigate to `/kiem-duyet/bao-cao/$reportId`

### Audit log stream (last 10)
Columns: Action, Actor, Target, Timestamp
Auto-refresh every 60s

**Empty state**: "Chưa có dữ liệu" with setup checklist
**Loading**: Skeleton cards + skeleton rows
**Error**: "Không tải được dữ liệu. Thử lại." with retry button

---

## 2. Bài viết (`/noi-dung/bai-viet`)

**Role**: `editor+`
**API deps**: `GET /api/content/posts`, `POST /api/content/posts`, `PATCH /api/content/posts/:id`, `POST /api/content/posts/:id/publish`
**Feature flag**: none

### List view
| Column | Sortable | Default |
|---|---|---|
| Tiêu đề | Yes | — |
| Status | No | — |
| Tác giả | No | — |
| Danh mục | No | — |
| Ngày tạo | Yes | Desc |
| Ngày xuất bản | Yes | — |

**Filter chips**: Status (All / Nháp / Đã XB / Đã ẩn), Category, Tag, Date range
**Search**: Debounced title search (300ms)
**Pagination**: 20/page, server-side
**Bulk actions**: Publish selected, Unpublish selected, Delete (soft)
**Row actions**: Edit, View on site, Publish/Unpublish toggle, Delete

### Create flow (`/noi-dung/bai-viet/tao-moi`)
Fields: Tiêu đề*, Slug (auto-generated, editable), Category*, Tags (multi), Nội dung (rich text), Thumbnail (upload), SEO title, SEO description, Status (Draft default)
Save → PATCH to draft, Publish → POST to publish endpoint
Audit: `post.create`, `post.publish`

### Edit view (`/noi-dung/bai-viet/$postId`)
Same fields as create. Shows: Last modified by, Published at.
"Xem trên trang" link → opens `/bai-viet/[slug]` in new tab
On publish: triggers Next.js revalidation via webhook

**Empty state**: "Chưa có bài viết nào. [Tạo bài viết đầu tiên]"
**Loading**: Skeleton table rows
**Success**: Toast "Đã lưu" / "Đã xuất bản"
**Error**: Toast with error code + retry

**Query invalidation**: After publish/unpublish → invalidate `['posts']`, `['post', id]`

---

## 3. Hướng dẫn (`/noi-dung/huong-dan`)

**Role**: `editor+`
**API deps**: Same pattern as Bài viết but `/api/content/guides`

Same DataTable pattern as Bài viết.
Additional column: Guide type (Beginner / Advanced / Topic)
Additional filter: Guide type
No bulk publish (guides published individually with review)

---

## 4. Kinh Bài Tập (`/noi-dung/kinh-bai-tap`)

**Role**: `editor+`
**API deps**: `/api/admin/content/daily-practice/*`
**Feature flag**: none

### Workspace layout (Tab-based, not DataTable)

```
Tabs: [Tổng quan] [Nhóm & Bước] [Scenario Presets] [FAQ] [Tải xuống]
```

**Tab 1 — Tổng quan**:
- Publish status card (published/draft)
- Last updated by/at
- "Xem trên trang" link
- [Publish] / [Unpublish] button with confirm dialog

**Tab 2 — Nhóm & Bước**:
- List of guide groups with drag-to-reorder
- Each group: expand to show steps
- Add group button
- Edit group: modal with name, description, icon
- Add step to group: modal with step fields
- Edit/Delete step: inline actions

**Tab 3 — Scenario Presets**:
- List of practice scenarios (morning/evening/etc.)
- Each: name, description, included steps
- Add/Edit/Delete presets

**Tab 4 — FAQ**:
- List of Q&A pairs with drag-to-reorder
- Add/Edit/Delete FAQ items

**Tab 5 — Tải xuống**:
- List of downloadable resources
- Upload new → link to media library
- Set display order

**Audit**: `daily-practice.publish`, `daily-practice.guide.update`
**Empty state per tab**: "Chưa có nội dung. [Thêm mới]"

---

## 5. Ngôi Nhà Nhỏ (`/noi-dung/ngoi-nha-nho`)

**Role**: `editor+`
**API deps**: `/api/admin/content/little-house/*`

Same Tab-based workspace as Kinh Bài Tập.

Tabs: [Tổng quan] [Hướng dẫn chính] [Case Variants] [FAQ] [Tải xuống]

**Tab 2 — Hướng dẫn chính**:
- List of guide sections with ordering
- Each section: title, content (rich text), images

**Tab 3 — Case Variants**:
- Specific case guides (hồi hướng cho bản thân, cho người khác, v.v.)
- Each variant: name, description, steps, warnings

Special field: **Review notes** (internal editorial notes, not published)

---

## 6. Phóng Sanh (`/noi-dung/phong-sanh`)

**Role**: `editor+`
**API deps**: `/api/admin/content/life-release/*`

Tabs: [Tổng quan] [Nghi thức] [Variants] [Lưu ý & Chuẩn bị] [FAQ] [Tải xuống]

**Tab 2 — Nghi thức**:
- Primary ritual steps with ordering
- Rich text per step
- Optional: audio companion link

**Tab 3 — Variants**:
- Life release variants (cho bản thân, cho người khác, v.v.)
- Each: variant name, steps override, guidance text

**Tab 4 — Lưu ý & Chuẩn bị**:
- Warning items (checklist editor)
- Preparation checklist
- Ethical guidelines (rich text)
- Special: sensitive content flag + review note

---

## 7. Thư viện pháp môn (`/noi-dung/thu-vien-phap-mon`)

**Role**: `editor+`
**API deps**: `/api/admin/content/media-library/*`

Tabs: [Collections] [Featured] [Tags]

**Tab 1 — Collections**:
DataTable: Name, Type (photo/video), Item count, Status, Date
Create: modal with name, description, type, featured toggle
Detail (`$collectionId`): Grid of media items, add/remove/reorder, publish

**Tab 2 — Featured**:
Up to 6 featured collection slots (drag-to-reorder)
Each slot: select from published collections

**Tab 3 — Tags**:
Tag management: add/rename/merge/delete tags

---

## 8. Kinh sách (`/noi-dung/kinh-sach`)

**Role**: `editor+`
**API deps**: `/api/content/sutras`, `/api/admin/wisdom/baihua/*`

Tabs: [Danh sách kinh] [Bạch thoại audiobook]

**Tab 1 — Danh sách kinh (Sutras)**:
DataTable: Title, Volumes, Status, Date
Row expand → show volumes list
Row expand further → chapters per volume

**Tab 2 — Bạch thoại audiobook**:
DataTable: Book title, Chapter count, Translation status, Last updated
Filter: Translation status (Untranslated / In progress / Reviewed / Published)
Row actions: View chapters, Import source, Edit translation

Chapter detail page:
- Source text (Chinese, read-only)
- Translation field (Vietnamese, editable)
- Audio companion link
- Review status selector
- [Publish chapter] button

---

## 9. Niệm kinh (`/noi-dung/niem-kinh`)

**Role**: `editor+`
**API deps**: `/api/content/chant-items`, `/api/content/chant-plans`

Tabs: [Bản kinh] [Chant Plans]

**Tab 1 — Bản kinh (Chant items)**:
DataTable: Tên kinh, Type (chant/sutra), Duration, Audio file, Status
Upload audio: drag-and-drop with MIME validation (mp3, m4a only)
Edit: title, description, lyrics (rich text), audio file, category

**Tab 2 — Chant Plans**:
List of practice plans (morning chant, evening chant, etc.)
Each plan: name, ordered list of chant items
Drag-to-reorder items within plan

---

## 10. Media (`/noi-dung/media`)

**Role**: `editor+`
**API deps**: `POST /api/content/media/upload`, `DELETE /api/content/media/:id`, `GET /api/content/media`

### Gallery view (default)
Grid of thumbnails (4 cols desktop, 2 cols mobile)
Filter: Type (image/audio/video/document), Status, Date range, Uploader
Search: filename
Bulk select: select multiple → Bulk delete (with confirm)

### Upload panel (slide-in drawer)
Drag-and-drop zone
Shows: MIME type detected, size, upload progress
Validates: MIME allowlist, max size per type
On success: file appears in gallery

### Asset detail (click thumbnail → modal)
Shows: filename, MIME, size, checksum, uploaded by, status, linked entities
Actions: Copy URL, Download, Delete (with confirm + audit)
If linked: shows what content uses this file

**Pagination**: Infinite scroll (load more) or pagination toggle
**Empty state**: "Chưa có file nào. [Tải lên]"

---

## 11. Bài đăng CĐ (`/cong-dong/bai-dang`)

**Role**: `moderator+`
**API deps**: `GET /api/community/posts`, `PATCH /api/community/posts/:id`
**Feature flag**: `community.post.enabled`

DataTable columns: Author, Title/excerpt, Status, Report count, Date
Filter: Status (All / Pending / Approved / Hidden), Has reports (Yes/No)
Sort: Date desc (default), Report count desc
Bulk: Approve, Hide
Row actions: View, Approve, Hide, View reports

**Detail page**: Post preview + moderation history + action panel
Action panel: [Approve] [Hide with reason] [Delete]

---

## 12. Sổ lưu niệm (`/cong-dong/so-luu-niem`)

**Role**: `moderator+`
**API deps**: `GET /api/guestbook`, `PATCH /api/guestbook/:id/approve`, `DELETE /api/guestbook/:id`
**Feature flag**: `community.guestbook.enabled`

DataTable columns: Name, Message (truncated), Status, IP (hashed), Date
Filter: Status (All / Pending / Approved / Rejected)
Default sort: Date desc
Bulk: Approve, Reject
Row actions: Approve, Reject, View full, Delete

**Approval flow**: Single click Approve → status changes to approved → entry shows on public page
**No edit allowed**: Moderator can only approve/reject/delete, not edit content

---

## 13. Báo cáo (`/kiem-duyet/bao-cao`)

**Role**: `moderator+`
**API deps**: `GET /api/moderation/reports`, `POST /api/moderation/reports/:id/decision`

DataTable columns: #ID, Content type chip, Reason, Reporter, Created, Status
Filter: Status (All / Pending / Resolved / Ignored), Content type
Default sort: Created desc, Status=pending first
**Badge**: Pending count in sidebar (real-time via polling every 30s)
Bulk: Mark as ignored (for spam reports)

### Report detail (`/kiem-duyet/bao-cao/$reportId`)

Layout: Split view
Left: Content preview (rendered, not raw HTML) + reporter info + reason + description
Right: Decision panel

Decision panel:
```
Quyết định:
  [Ẩn nội dung]    [Bỏ qua báo cáo]

Ghi chú (optional):
[_________________________]

[Xác nhận]
```

Post-decision: toast "Đã xử lý báo cáo", navigate back to list, pending count decrements

**Audit**: `moderation.report.resolve` with decision, note, target entity
**Empty state**: "Không có báo cáo nào pending. 🎉"

---

## 14. Bình luận (`/kiem-duyet/binh-luan`)

**Role**: `moderator+`
**API deps**: `GET /api/community/posts/:id/comments`, moderation decision endpoints

DataTable columns: Author, Comment (truncated), Post, Has reports, Status, Date
Filter: Has reports (Yes/No), Status (Active / Hidden)
Row actions: Hide, Restore, View post

---

## 15. Người dùng (`/nguoi-dung`)

**Role**: `admin+`
**API deps**: `GET /api/admin/users`, `PATCH /api/admin/users/:id/role`, `POST /api/admin/users/:id/block`

DataTable columns: Avatar, Display name, Email (partial), Role chip, Status, Join date, Last active
Filter: Role (All / Member / Editor / Moderator / Admin), Status (Active / Blocked)
Search: Email or display name
Sort: Join date desc (default)
**No bulk actions** (role/status changes are individual, high-impact)
Row actions: View profile, Change role, Block/Unblock, View sessions

### User detail (`/nguoi-dung/$userId`)

Tabs: [Profile] [Sessions] [Audit history] [Practice stats]

**Tab 1 — Profile**: Read-only fields + [Change role] button + [Block/Unblock] button
**Tab 2 — Sessions**: List of active sessions with device/IP info, [Revoke] per session, [Revoke all]
**Tab 3 — Audit history**: Audit logs filtered to this user
**Tab 4 — Practice stats**: Practice log count, streaks (read-only)

**Audit**: `user.role.change`, `user.block`, `user.unblock`

---

## 16. Phiên đăng nhập (`/nguoi-dung/phien`)

**Role**: `super-admin`
**API deps**: `GET /api/admin/sessions`, `DELETE /api/admin/sessions/:id`

DataTable columns: User, Device (truncated UA), IP (hashed), Created, Last active, Expires
Filter: Active (Yes/No), Date range
Sort: Last active desc
Bulk: Revoke selected
Row actions: Revoke

**Use case**: Force logout when credential compromise suspected

---

## 17. Feature flags (`/he-thong/feature-flags`)

**Role**: `super-admin`
**API deps**: `GET /api/feature-flags`, `PATCH /api/feature-flags/:key`

List view (not DataTable — simple toggle list):
```
[●] community.post.enabled          "Cho phép member tạo community post"    [Toggle]
[○] search.meilisearch.enabled      "Dùng Meilisearch thay SQL"             [Toggle]
[○] notification.push.enabled       "Cho phép push notifications"           [Toggle]
...
```

Toggle action: requires confirm dialog "Bạn có chắc muốn thay đổi flag này không?"
**Audit**: `feature-flag.toggle` with key, from_value, to_value
**No create/delete in UI** — flags seeded via migration, not dynamically created

---

## 18. Audit logs (`/he-thong/audit-logs`)

**Role**: `admin+`
**API deps**: `GET /api/admin/audit-logs`

DataTable columns: Timestamp, Actor, Action (chip), Entity type, Entity ID (truncated), Correlation ID
Filter: Action type, Actor (search by username), Entity type, Date range
Search: Correlation ID (exact match for request-level lookup)
Sort: Timestamp desc
Pagination: 50/page (audit logs can be high volume)
**No bulk actions** — read-only
Row expand → full metadata JSON viewer

---

## 19. Lịch & Sự kiện (`/he-thong/lich`)

**Role**: `admin+`
**API deps**: `GET /api/calendar/events`, `POST /api/admin/calendar/events`

DataTable columns: Tên sự kiện, Type, Status chip, Date, Location
Filter: Status (All / Draft / Published / Cancelled), Type, Month
Sort: Date asc (upcoming first)
Row actions: Edit, View agenda, Publish/Cancel

### Event workspace (`/he-thong/lich/$eventId`)

Tabs: [Thông tin] [Agenda] [Speakers] [CTAs] [Gallery/Files]

**Tab 1 — Thông tin**:
Fields: Tên*, Date/Time*, Location*, Description (rich text), Type, Cover image, Status
Actions: [Lưu] [Xuất bản] [Reschedule] [Cancel]
Cancel: requires confirm dialog + reason input
Reschedule: requires new date + reason

**Tab 2 — Agenda**:
Ordered list of agenda items (drag-to-reorder)
Each item: time, title, description, speaker (optional FK)
Add/Edit/Delete items
Save order: `POST /admin/calendar/events/:id/agenda-items/reorder`

**Tab 3 — Speakers**:
List of speakers with photo, name, title, bio
Add/Edit/Remove speakers

**Tab 4 — CTAs**:
Up to 5 call-to-action buttons
Each: label, URL, type (register/download/watch), display order

**Tab 5 — Gallery/Files**:
Upload event photos + documents
Link to media library items

**Audit**: `calendar.event.publish`, `calendar.event.reschedule`, `calendar.event.cancel`

---

## 20. Tìm kiếm (`/he-thong/tim-kiem`)

**Role**: `admin+`
**API deps**: `GET /api/admin/search/status`, `POST /api/admin/search/reindex`, `POST /api/admin/search/reindex/:source`
**Feature flag**: `search.meilisearch.enabled` (shows different UI per flag state)

### When flag = false (SQL mode)
```
Trạng thái: SQL search (Postgres tsvector)
Mode: Phase 1 — không cần reindex thủ công

[Kiểm tra SQL search] → runs test query, shows result count
```

### When flag = true (Meilisearch mode)
```
Trạng thái Meilisearch:  ● Hoạt động
Index: pmtl_content
Documents: 1,245
Last sync: 5 phút trước
Queue depth: 0

Sources:
  posts       ● Fresh (last: 2h ago)
  wisdom      ● Fresh (last: 2h ago)
  guides      ⚠ Stale (last: 25h ago)

[Reindex tất cả]  [Reindex posts]  [Reindex wisdom]  [Reindex guides]
```

Reindex action: shows progress spinner, then completion toast
If Meilisearch down: shows error state with fallback indicator

---

## 21. Thông báo (`/he-thong/thong-bao`)

**Role**: `admin+`
**API deps**: Push notification architecture routes
**Feature flag**: `notification.push.enabled`

When flag = false:
```
Push notifications chưa được kích hoạt.
Feature flag: notification.push.enabled = false
```

When flag = true: Full push job management (see `08-notification/push-notification-architecture.md`)

Tabs: [Push jobs] [Subscriptions] [Tạo thông báo]

**Tab 1 — Push jobs**: DataTable of jobs with status chips, delivery stats
**Tab 2 — Subscriptions**: Active subscription count + chart + browser breakdown
**Tab 3 — Tạo thông báo**: Create push job form

---

## 22. Phụng sự viên (`/he-thong/phung-su-vien`)

**Role**: `admin+`
**API deps**: `/api/admin/volunteers/*`

DataTable columns: Avatar, Tên, Vai trò, Display order, Active status
Filter: Active (Yes/No)
Sort: Display order asc (default)
Bulk: no bulk
Row actions: Edit, Move up/down (reorder), Deactivate/Activate, Delete

### Create/Edit (modal)
Fields: Tên*, Avatar (upload), Vai trò*, Mô tả (short), Active toggle, Display order

Sort: `PATCH /admin/volunteers/sort` with ordered publicId array

---

## 23. Health (`/he-thong/health`)

**Role**: `admin+`
**API deps**: `GET /api/admin/system/health-extended`
**Polling**: Every 30s

See `ops/health-contract.md` for full spec.

Displays: Live/Ready/Startup status chips + uptime + memory + disk + DB connections + feature flag count + queue depths (when BullMQ active)

---

## 24. Nhập hộ phát nguyện (`/ho-tro/phat-nguyen/nhap-ho`)

**Role**: `admin+`
**API deps**: `POST /api/admin/vows/assisted-entry/life-release`, `POST /api/admin/vows/assisted-entry/progress`, `GET /api/admin/vows/assisted-entry/history`
**Feature flag**: `vow.assisted_entry.enabled`

Tabs: [Nhập journal phóng sanh] [Nhập tiến độ phát nguyện] [Lịch sử nhập hộ]

**Tab 1 — Nhập journal phóng sanh**:
Form: Tên member (search), Ngày, Loài vật, Số lượng, Địa điểm, Ghi chú
Must confirm: "Xác nhận nhập hộ cho [tên member]"
On submit: Creates record with `isAssistedEntry=true`, audit required
Success: Toast + record appears in history tab

**Tab 2 — Nhập tiến độ phát nguyện**:
Form: Tên member (search), Chọn phát nguyện, Milestone, Ngày hoàn thành, Ghi chú
Same confirm + audit pattern

**Tab 3 — Lịch sử nhập hộ**:
DataTable: Actor (admin), Member, Type (life-release/vow), Date, Audit trail link
Filter: Type, Date range, Admin actor

See `09-vows-merit/assisted-entry-workflow.md` for full workflow details.

---

## Common patterns across all workspaces

### Empty states
Every list/table must have an empty state with:
- Descriptive message in Vietnamese (e.g., "Chưa có bài viết nào")
- Action button if user can create (e.g., "[Tạo bài viết đầu tiên]")
- No generic "No data found" in English

### Loading states
- DataTable: skeleton rows matching column count (5 rows)
- Form: disabled inputs with skeleton overlays
- Stats cards: number skeleton pulses

### Error states
- Network error: "Không thể kết nối. [Thử lại]" with retry button
- Auth error (401): redirect to login
- Permission error (403): "Bạn không có quyền thực hiện thao tác này."
- Server error (500): "Lỗi hệ thống. Vui lòng thử lại sau." + error code

### Success states
- Create: Toast "Đã tạo thành công" + navigate to detail
- Update: Toast "Đã lưu" (no navigation)
- Delete: Toast "Đã xóa" + remove from list
- Publish: Toast "Đã xuất bản" + status chip update

### Confirm dialogs (required for destructive actions)
```
Title: "Xác nhận [hành động]"
Body: "Bạn có chắc muốn [mô tả hành động]? [Hậu quả nếu có]"
Buttons: [Hủy] [Xác nhận] (destructive = red)
```

### Query invalidation pattern
All TanStack Query mutations must call `queryClient.invalidateQueries` after success:
- Create: invalidate list query
- Update: invalidate list query + specific item query
- Delete: invalidate list query, remove specific item from cache
- Publish/status change: invalidate list + item + related dashboard stats
