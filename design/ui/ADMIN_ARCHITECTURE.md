# Admin Architecture (Kiến trúc Admin — shadcn-admin pattern)

File này chốt kiến trúc `apps/admin` dựa trên [shadcn-admin](https://github.com/satnaing/shadcn-admin).
Admin là Vite + React SPA, hoàn toàn tách biệt với `apps/web` (Next.js).

> **Stack ref**: `baseline/frontend-architecture.md`
> **Component specs**: `design/ui/COMPONENT_SPECS.md`
> **Design principles**: `design/ui/DESIGN_PRINCIPLES.md`

---

## Tech stack

| Layer | Library | Version |
|---|---|---|
| Build | Vite | 6.x |
| Framework | React | 19.x |
| Router | TanStack Router | File-based, type-safe |
| Data fetching | TanStack Query v5 | Cache, mutations |
| Tables | TanStack Table | Sorting, filtering, pagination |
| Forms | React Hook Form + Zod | Shared schemas |
| UI | shadcn/ui | Latest |
| Styling | Tailwind CSS 4 | Consistent với web |
| State | Zustand | Theme, sidebar, preferences |
| Icons | Lucide React | Same as web |
| Charts | Recharts (shadcn/ui charts) | Dashboard widgets |
| Command | cmdk | ⌘K palette |
| Toast | Sonner | Notifications |

---

## Layout structure

### Shell components

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ [SidebarTrigger] [Breadcrumb]           [Search] [⌘K] [👤] │
├────────────┬────────────────────────────────────────────────┤
│ Sidebar    │ Main                                            │
│            │                                                  │
│ ┌────────┐ │ ┌── Content area ─────────────────────────────┐ │
│ │Nav     │ │ │                                              │ │
│ │items   │ │ │  Page content (tables, forms, details)       │ │
│ │        │ │ │                                              │ │
│ │        │ │ │                                              │ │
│ │        │ │ │                                              │ │
│ └────────┘ │ └──────────────────────────────────────────────┘ │
│ [Collapse] │                                                  │
└────────────┴────────────────────────────────────────────────┘
```

### Sidebar navigation

```typescript
const sidebarData = {
  navGroups: [
    {
      title: 'Tổng quan',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Nội dung',
      items: [
        { title: 'Bài viết', url: '/noi-dung/bai-viet', icon: FileText },
        { title: 'Hướng dẫn', url: '/noi-dung/huong-dan', icon: BookOpen },
        { title: 'Kinh Bài Tập', url: '/noi-dung/kinh-bai-tap', icon: NotebookPen },
        { title: 'Ngôi Nhà Nhỏ', url: '/noi-dung/ngoi-nha-nho', icon: BookMarked },
        { title: 'Phóng Sanh', url: '/noi-dung/phong-sanh', icon: Fish },
        { title: 'Thư viện pháp môn', url: '/noi-dung/thu-vien-phap-mon', icon: Clapperboard },
        { title: 'Kinh sách', url: '/noi-dung/kinh-sach', icon: Library },
        { title: 'Niệm kinh', url: '/noi-dung/niem-kinh', icon: Music },
        { title: 'Media', url: '/noi-dung/media', icon: Image },
      ],
    },
    {
      title: 'Cộng đồng',
      items: [
        { title: 'Bài đăng', url: '/cong-dong/bai-dang', icon: Users },
        { title: 'Sổ lưu niệm', url: '/cong-dong/so-luu-niem', icon: Book },
      ],
    },
    {
      title: 'Kiểm duyệt',
      items: [
        { title: 'Báo cáo', url: '/kiem-duyet/bao-cao', icon: Shield, badge: 'pending_count' },
        { title: 'Bình luận', url: '/kiem-duyet/binh-luan', icon: MessageSquare },
      ],
    },
    {
      title: 'Người dùng',
      items: [
        { title: 'Danh sách', url: '/nguoi-dung', icon: Users },
        { title: 'Phiên đăng nhập', url: '/nguoi-dung/phien', icon: Key },
      ],
    },
    {
      title: 'Hệ thống',
      items: [
        { title: 'Feature flags', url: '/he-thong/feature-flags', icon: ToggleLeft },
        { title: 'Audit logs', url: '/he-thong/audit-logs', icon: ScrollText },
        { title: 'Lịch & Sự kiện', url: '/he-thong/lich', icon: Calendar },
        { title: 'Tìm kiếm', url: '/he-thong/tim-kiem', icon: Search },
        { title: 'Thông báo', url: '/he-thong/thong-bao', icon: Bell },
        { title: 'Phụng sự viên', url: '/he-thong/phung-su-vien', icon: HandHelping },
        { title: 'Health', url: '/he-thong/health', icon: Activity },
      ],
    },
    {
      title: 'Hỗ trợ',
      items: [
        { title: 'Nhập hộ phát nguyện', url: '/ho-tro/phat-nguyen/nhap-ho', icon: HeartHandshake },
      ],
    },
  ],
};
```

### Sidebar features

- **Collapsible**: Icon-only mode trên desktop (cookie-persisted preference)
- **Mobile**: Drawer overlay, slide từ trái
- **Active indicator**: Gold accent bar bên trái item active
- **Badge**: Số báo cáo pending hiện real-time trên "Báo cáo" item
- **User menu**: Dropdown ở bottom sidebar — profile, đổi mật khẩu, đăng xuất

---

## Route structure (TanStack Router)

```
src/routes/
├── __root.tsx                    # Root layout
├── _authenticated.tsx            # Auth guard layout
├── _authenticated/
│   ├── dashboard/
│   │   └── index.tsx             # Dashboard overview
│   ├── noi-dung/
│   │   ├── bai-viet/
│   │   │   ├── index.tsx         # Post list (DataTable)
│   │   │   ├── $postId.tsx       # Post detail / edit
│   │   │   └── tao-moi.tsx       # Create post
│   │   ├── huong-dan/
│   │   ├── kinh-bai-tap/
│   │   ├── ngoi-nha-nho/
│   │   ├── phong-sanh/
│   │   ├── thu-vien-phap-mon/
│   │   ├── kinh-sach/
│   │   ├── niem-kinh/
│   │   └── media/
│   ├── cong-dong/
│   │   ├── bai-dang/
│   │   └── so-luu-niem/
│   ├── kiem-duyet/
│   │   ├── bao-cao/
│   │   │   ├── index.tsx         # Report queue (DataTable)
│   │   │   └── $reportId.tsx     # Report detail + actions
│   │   └── binh-luan/
│   ├── nguoi-dung/
│   │   ├── index.tsx             # User list
│   │   └── $userId.tsx           # User detail
│   ├── he-thong/
│   │   ├── feature-flags/
│   │   ├── audit-logs/
│   │   ├── lich/
│   │   │   ├── index.tsx         # Events list + calendar tools
│   │   │   ├── tao-moi.tsx       # Create event
│   │   │   └── $eventId.tsx      # Event workspace: info/agenda/speakers/ctas/assets
│   │   ├── tim-kiem/
│   │   ├── thong-bao/
│   │   ├── phung-su-vien/
│   │   └── health/
│   └── ho-tro/
│       └── phat-nguyen/
│           └── nhap-ho/
└── auth/
    └── dang-nhap.tsx             # Admin login
```

---

## Composable DataTable pattern

Dựa trên shadcn-admin DataTable — composable, reusable, type-safe.

```typescript
// Cấu trúc DataTable per feature
feature/
├── columns.tsx        # Column definitions (TanStack Table)
├── data-table.tsx     # DataTable wrapper (toolbar + table + pagination)
├── toolbar.tsx        # Filter toolbar (search, filter chips, view toggle)
├── row-actions.tsx    # Row action dropdown (edit, delete, etc.)
└── dialogs/           # Feature-specific modals
    ├── create.tsx
    ├── edit.tsx
    └── delete-confirm.tsx
```

### DataTable features

| Feature | Implementation |
|---|---|
| Sorting | Column header click → API sort params |
| Filtering | Toolbar filter chips → API query params |
| Search | Debounced text input → API search |
| Pagination | Server-side, 20 items default |
| Column visibility | Toggle columns, persisted in localStorage |
| Bulk select | Checkbox column, bulk actions toolbar |
| Row actions | Dropdown menu (Edit / View / Delete) |
| Loading | Skeleton rows matching column count |
| Empty | EmptyState component với action button |

---

## Key admin pages

### Dashboard

```
┌────────────────────────────────────────────────┐
│ Dashboard — Tổng quan                           │
├────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │
│ │Thành │ │Bài   │ │Báo cáo│ │Tu tập│           │
│ │viên  │ │viết  │ │pending│ │hôm nay│          │
│ │ 1,234│ │  89  │ │   5  │ │  342 │           │
│ └──────┘ └──────┘ └──────┘ └──────┘           │
│                                                 │
│ ┌─ Bài viết mới ──────┐ ┌─ Reports ─────────┐ │
│ │ Recent posts table   │ │ Pending reports   │ │
│ │ (compact 5 rows)     │ │ (compact 5 rows)  │ │
│ └──────────────────────┘ └───────────────────┘ │
│                                                 │
│ ┌─ Hoạt động gần đây ─────────────────────────┐│
│ │ Audit log stream (last 10)                    ││
│ └───────────────────────────────────────────────┘│
└────────────────────────────────────────────────┘
```

### Moderation queue

```
┌────────────────────────────────────────────────┐
│ Kiểm duyệt > Báo cáo (5 pending)              │
├────────────────────────────────────────────────┤
│ [Filter: All / Pending / Resolved / Ignored]    │
│ [Search báo cáo...]                             │
├────────────────────────────────────────────────┤
│ ☐ │ #ID  │ Content  │ Reason │ Reporter │ Date │
│ ☐ │ R-12 │ Comment  │ Spam   │ user_xx  │ 2h   │
│ ☐ │ R-11 │ Post     │ Sai    │ user_yy  │ 5h   │
│ ...                                             │
├────────────────────────────────────────────────┤
│ [Bulk: Ẩn nội dung] [Bulk: Bỏ qua]            │
└────────────────────────────────────────────────┘

Click vào row → Report detail:
┌────────────────────────────────────────────────┐
│ Báo cáo #R-12                                   │
│                                                 │
│ Nội dung bị báo cáo:                           │
│ ┌──────────────────────────────────────────┐    │
│ │ [Preview of reported content]             │    │
│ └──────────────────────────────────────────┘    │
│                                                 │
│ Người báo cáo: user_xx (member)                │
│ Lý do: Spam                                     │
│ Mô tả: "Bài viết quảng cáo..."                │
│                                                 │
│ Quyết định:                                    │
│ [Ẩn nội dung] [Bỏ qua báo cáo]               │
│                                                 │
│ Ghi chú (optional): [____________]             │
└────────────────────────────────────────────────┘
```

### Content management (ví dụ: Bài viết)

```
List view:
┌────────────────────────────────────────────────────┐
│ Nội dung > Bài viết                    [Tạo mới +] │
├────────────────────────────────────────────────────┤
│ [Search...] [Status ▼] [Category ▼] [Columns ▼]   │
├────────────────────────────────────────────────────┤
│ ☐ │ Tiêu đề        │ Status    │ Author │ Date     │
│ ☐ │ Hướng dẫn niệm │ ● Đã XB   │ admin  │ 12/03   │
│ ☐ │ Kinh nghiệm tu  │ ○ Nháp    │ admin  │ 11/03   │
│ ...                                                 │
└────────────────────────────────────────────────────┘

Edit view: Form layout
┌────────────────────────────────────────────────────┐
│ ← Bài viết > Sửa: Hướng dẫn niệm kinh            │
├────────────────────────────────────────────────────┤
│ Tiêu đề: [_________________________________]       │
│ Slug: [huong-dan-niem-kinh____________]             │
│ Category: [Dropdown]    Tags: [Multi-select]        │
│                                                     │
│ Nội dung:                                          │
│ [Rich text editor area]                             │
│                                                     │
│ Thumbnail: [Upload / Current image preview]         │
│                                                     │
│ Status: ● Nháp ○ Đã xuất bản ○ Đã ẩn              │
│                                                     │
│              [Huỷ thay đổi]  [Lưu]                 │
└────────────────────────────────────────────────────┘
```

---

## Auth flow (Admin)

```
1. Admin truy cập /dashboard → TanStack Router guard check
2. Không có session → redirect /auth/dang-nhap
3. Admin login → POST /api/auth/login (admin role required)
4. API trả access token + refresh token (HttpOnly cookies)
5. Admin SPA forward cookies mọi request → API
6. Idle timeout 30 phút → logout automatic
7. Max session 12 giờ → force re-login
```

### Admin guard

```typescript
// beforeLoad trong _authenticated route
async function adminGuard() {
  const session = await checkAdminSession();
  if (!session) throw redirect({ to: '/auth/dang-nhap' });
  if (session.role !== 'admin') throw redirect({ to: '/auth/unauthorized' });
}
```

---

## Command palette (⌘K)

```
┌──────────────────────────────────┐
│ 🔍 Tìm kiếm...                  │
├──────────────────────────────────┤
│ Điều hướng                       │
│  → Dashboard                     │
│  → Bài viết                      │
│  → Kiểm duyệt                   │
│  → Audit logs                    │
├──────────────────────────────────┤
│ Hành động                        │
│  → Tạo bài viết mới             │
│  → Xem báo cáo pending          │
│  → Tìm người dùng               │
├──────────────────────────────────┤
│ Hệ thống                        │
│  → Feature flags                 │
│  → Health check                  │
└──────────────────────────────────┘
```

---

## Preferences (persisted)

| Preference | Storage | Default |
|---|---|---|
| Sidebar collapsed | Cookie / localStorage | false |
| Table page size | localStorage | 20 |
| Theme | Cookie / localStorage | light |
| Column visibility (per table) | localStorage | all visible |

---

## Admin design tokens (khác web)

Admin dùng shadcn/ui default theme với minor customizations:

```
Background: white (#FFFFFF)
Card: #FAFAFA
Border: #E5E5E5
Primary: gold-500 (#B8860B) — consistent với web
Destructive: #DC2626
Font: Inter (sans-serif only)
```

Không dùng serif headings cho admin — professional density > contemplative mood.

---

## Admin pages inventory

| Route | Tiêu đề | Mô tả |
|---|---|---|
| `/dashboard` | Dashboard | Stats cards, recent activity, pending items |
| `/noi-dung/bai-viet` | Bài viết | DataTable CRUD |
| `/noi-dung/huong-dan` | Hướng dẫn | DataTable CRUD |
| `/noi-dung/kinh-bai-tap` | Kinh Bài Tập | Workspace quản lý steps, lưu ý, scenario presets, FAQ, downloads |
| `/noi-dung/ngoi-nha-nho` | Ngôi Nhà Nhỏ | Workspace quản lý grouped guides, case variants, FAQ, downloads, assets |
| `/noi-dung/phong-sanh` | Phóng Sanh | Workspace quản lý ritual guides, variants, FAQ, downloads, review notes |
| `/noi-dung/thu-vien-phap-mon` | Thư viện pháp môn | Workspace quản lý curated photo albums, video playlists, featured collections |
| `/noi-dung/kinh-sach` | Kinh sách | DataTable + nested volumes |
| `/noi-dung/niem-kinh` | Niệm kinh | DataTable + audio management |
| `/noi-dung/media` | Media | Gallery view + upload |
| `/cong-dong/bai-dang` | Bài đăng CĐ | DataTable + approval |
| `/cong-dong/so-luu-niem` | Sổ lưu niệm | DataTable + approve/reject |
| `/kiem-duyet/bao-cao` | Báo cáo | Moderation queue |
| `/kiem-duyet/binh-luan` | Bình luận | Comment moderation |
| `/nguoi-dung` | Người dùng | User list + detail |
| `/nguoi-dung/phien` | Phiên đăng nhập | Session management |
| `/he-thong/feature-flags` | Feature flags | Toggle list |
| `/he-thong/audit-logs` | Audit logs | Searchable log stream |
| `/he-thong/lich` | Lịch & Sự kiện | Event management |
| `/he-thong/lich/$eventId` | Chi tiết sự kiện | Event workspace với tabs agenda/speakers/ctas/assets |
| `/he-thong/tim-kiem` | Tìm kiếm | Search status, source freshness, reindex controls |
| `/he-thong/thong-bao` | Thông báo | Notification management |
| `/he-thong/phung-su-vien` | Phụng sự viên | Volunteer directory management |
| `/he-thong/health` | Health | System health dashboard |
| `/ho-tro/phat-nguyen/nhap-ho` | Nhập hộ phát nguyện | Assisted-entry workflow cho life release và vow progress |

---

## Notes for AI/codegen

- Admin SPA served by Caddy at `/admin/*` — static files, client-side routing
- Admin dùng cùng domain contracts với web nhưng có admin-only REST surface riêng dưới `/admin/*`
- Admin-only endpoints protected by role guard at API level, not frontend
- TanStack Router file-based routing — route files auto-generate route tree
- DataTable pattern is composable — mỗi feature có columns + toolbar + row-actions riêng
- shadcn/ui components dùng chung giữa admin features — không duplicate
