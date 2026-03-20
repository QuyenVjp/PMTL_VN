# Component Specifications (Đặc tả Component)

Danh mục các UI components cần thiết cho PMTL_VN.
Mỗi component có: mô tả, props cơ bản, states, elderly-specific rules nếu cần.

> **Tech stack**: Next.js App Router + shadcn/ui + Tailwind CSS (web), Vite + React + shadcn/ui (admin)
> **Design principles**: `design/ui/DESIGN_PRINCIPLES.md` — color system, typography, spacing, interactions
> **Admin architecture**: `design/ui/ADMIN_ARCHITECTURE.md` — shadcn-admin layout, DataTable, command palette
> **Frontend architecture**: `design/baseline/frontend-architecture.md` — library stack, proxy boundary
> **Skill ref**: `taste-skill`, `soft-skill`, `minimalist-skill`, `pmtl-creative-designer`, `pmtl-ui-behavior`, `pmtl-vercel-precision`

---

## Design baseline rules (Quy tắc base)

| Rule | Value |
|---|---|
| Min touch target | 44×44px (48px preferred cho elderly) |
| Min body font | 16px (17px+ cho elderly-heavy screens) |
| Min contrast ratio | WCAG AA (4.5:1 text, 3:1 UI components) |
| Focus ring | Visible, không dùng `outline: none` |
| Loading state | Mọi async action phải có loading indicator |
| Empty state | Mọi list/table phải có empty state design |
| Error state | Mọi form + async action phải có error state |

---

## I. Navigation Components

### `MainNav`
Top navigation bar.

**States**: default / scrolled (shadow) / mobile-open
**Props**: `user: AuthUser | null`, `currentPath: string`
**Behavior**:
- Desktop: horizontal links + avatar/login button
- Mobile: hamburger → slide drawer
- Active link: visual indicator
- Auth state: hiện avatar + dropdown khi đã login

---

### `MobileBottomNav`
Bottom tab bar, chỉ hiện trên mobile (< 768px).

**Tabs**: Trang chủ / Tu tập / Tìm kiếm / Lịch / Tôi
**States**: active tab highlighted, badge trên icon nếu có notification
**Elderly rule**: Tab labels phải hiện (không icon-only)

---

### `AdminSidebar`
Left navigation cho admin pages.

**Sections**: Dashboard / Nội dung / Cộng đồng / Kiểm duyệt / Người dùng / Hệ thống
**States**: expanded / collapsed (icon-only mode cho desktop)
**Mobile**: drawer overlay

---

### `Breadcrumb`
```
Trang chủ > Kinh sách > Kinh A Di Đà
```
**Rules**: Hiện khi depth > 1. Last item không là link. Truncate middle items nếu quá dài.

---

## II. Content Cards

### `PostCard`
Hiển thị trong list bài viết.

```
┌────────────────────────────────┐
│ [Thumbnail optional]            │
│ [Category tag]                  │
│ Tiêu đề bài viết               │
│ Tóm tắt 2 dòng...              │
│ 12/03/2026 · Tác giả · 5 phút │
└────────────────────────────────┘
```
**Props**: `post: PostSummary`, `showThumbnail?: boolean`
**States**: default / hover / loading skeleton

---

### `WisdomCard`
Hiển thị wisdom/QA entry.

```
┌────────────────────────────────┐
│ [Loại] Bạch thoại              │
│ Tiêu đề / câu hỏi             │
│ Trích đoạn bản dịch...         │
│ Nguồn: Pháp Sư Tịnh Không     │
│ [Đọc thêm] [Lưu offline]      │
└────────────────────────────────┘
```
**Props**: `entry: WisdomSummary`, `showOfflineButton?: boolean`
**Rule**: Luôn hiện source attribution. Không được hiện content không có source.

---

### `ChantItemCard`
```
┌────────────────────────────────┐
│ 🔔 Niệm Phật                   │
│ Nam Mô A Di Đà Phật            │
│ Thời lượng: ~10 phút           │
│ [Niệm kinh] [Ghi lại]         │
└────────────────────────────────┘
```

---

### `VowCard`
```
┌────────────────────────────────┐
│ Phát nguyện niệm 1000 biến     │
│ ████████░░ 800/1000 biến       │
│ Trạng thái: Đang thực hiện    │
│ [Xem chi tiết]                 │
└────────────────────────────────┘
```
**States**: active / completed / voided
**Rule**: Progress bar chỉ hiện nếu có quantified target. Non-measurable vows hiện status text.

---

### `AdvisoryCard`
Advisory ngày từ Calendar.

```
┌────────────────────────────────┐
│ 📅 Mùng 15 tháng 2 - Ngày Rằm │
│ ─────────────────────────────  │
│ Thực hành hôm nay:             │
│ • Niệm kinh buổi sáng          │
│ • Phóng sanh                   │
│ ─────────────────────────────  │
│ Bài đọc gợi ý:                 │
│ [WisdomCard compact]           │
└────────────────────────────────┘
```
**Rule**: Source references không copy toàn bộ text — chỉ excerpt + link.

---

### `EventCard`
```
┌────────────────────────────────┐
│ [Loại badge]                   │
│ Tên sự kiện                    │
│ 📅 15/04/2026 (Rằm tháng 3)    │
│ Mô tả ngắn...                  │
└────────────────────────────────┘
```

### `EventProgramTimeline`
Timeline theo khung giờ cho sự kiện tổ chức.

```
┌────────────────────────────────┐
│ 07:00 - 07:15                  │
│ Đón tiếp đại biểu              │
│ Ban Tổ chức                    │
├────────────────────────────────┤
│ 08:00 - 11:00                  │
│ Văn nghệ · chia sẻ · giao lưu │
│ Ban Tổ chức + Phật hữu         │
└────────────────────────────────┘
```

**Props**: `items: EventAgendaItem[]`
**States**: default / loading / empty
**Elderly rules**:
- thời gian nổi bật, chữ to hơn nội dung
- không nhồi quá nhiều badge nhỏ
- mobile hiển thị vertical stack, không horizontal timeline phức tạp

### `EventActionBar`
Thanh CTA cho trang chi tiết sự kiện.

**Buttons**:
- `Đăng ký`
- `Xem bản đồ`
- `Xem livestream`
- `Tải chương trình`

**Rules**:
- max 2 CTA primary cùng lúc
- các CTA còn lại là secondary/ghost
- mobile xếp dọc, full-width

### `EventSpeakerCard`

```
┌────────────────────────────────┐
│ [Avatar] Tên diễn giả          │
│ Vai trò                        │
│ Bio ngắn 2-3 dòng              │
└────────────────────────────────┘
```

**Props**: `speaker: EventSpeaker`
**States**: default / loading

### `AdminEventAgendaEditor`
Editor dạng table/list cho agenda items của admin.

**Fields**:
- start time
- end time
- title
- description
- host label
- segment type
- sort order

**Rules**:
- add/remove/reorder rows
- validate overlap
- inline error per row

### `AdminEventCtaManager`
Quản lý CTA links của sự kiện trong admin.

**Fields**:
- type
- label
- url
- sort order

**Rule**: URL validation inline, preview target domain.

---

## III. Practice UI Components (Critical - Elderly-friendly)

### `PracticeSheet`
Daily practice tracking sheet.

```
┌───────────────────────────────────────┐
│ Tu tập ngày 15/03/2026               │
│ Mùng 15 tháng 2 âm lịch            │
├───────────────────────────────────────┤
│ ☐  Nam Mô A Di Đà Phật   [____] biến │
│ ☐  Chú Đại Bi             [____] biến │
│ ☐  Kinh A Di Đà           [  1] quyển│
├───────────────────────────────────────┤
│ Ghi chú: ________________________     │
│                                        │
│         [   Lưu buổi tu   ]           │
└───────────────────────────────────────┘
```

**Elderly rules**:
- Checkbox min 44×44px
- Font min 17px
- Input số: lớn, numeric keyboard on mobile
- "Lưu" button: fixed bottom, full-width on mobile, min height 52px
- Không có animation trong quá trình điền

---

### `NgoiNhaNhoSheet`
Ngôi Nhà Nhỏ completion tracker. "Near-paper" interface.

```
┌───────────────────────────────────────┐
│ 🏠 Ngôi Nhà Nhỏ #12                  │
│                                        │
│ Kinh A Di Đà                          │
│ ████████████░░░░ 10,000 / 12,000 biến │
│                                        │
│ Hôm nay thêm: [_______] biến         │
│               [  +1  ] [  +10 ] [+100]│
│                                        │
│ [  ─  ] [  1000  ] [  +  ]           │
│                    ↑ số biến input     │
│                                        │
│ ─────────────── [  Dâng nhà  ] ───────│
│ (chỉ active khi đủ 12,000 biến)       │
└───────────────────────────────────────┘
```

**Elderly rules**:
- Tally buttons (+1, +10, +100) min 52×52px
- Progress bar với số hiển thị rõ (không chỉ %): "10,000 / 12,000"
- "Dâng nhà" button chỉ active khi đủ biến
- Confirmation modal khi "Dâng nhà" để tránh nhầm
- Font số lớn: min 24px

---

### `ChantPlayer`
Audio player cho bài niệm.

```
┌─────────────────────────────────────┐
│ Nam Mô A Di Đà Phật                 │
│ ─────────────────── ───────         │
│  ◀◀    ▶ / ❚❚    ▶▶   🔊────        │
│  [0:00 ──────────── 10:23]          │
└─────────────────────────────────────┘
```

**Elderly rules**:
- Play/Pause button: min 64×64px
- Skip buttons: min 48×48px
- Volume slider: min 200px wide
- Hiện tên bài rõ ràng phía trên controls
- Không autoplay

---

### `PracticeLogForm`
Form ghi lại 1 session tu.

**Fields**: date (auto = today), items practiced (multi-select + quantity), duration (optional), notes
**Elderly rules**: Date input có calendar picker lớn. Multi-select là checkbox list, không phải dropdown.

---

## IV. Community Components

### `CommentThread`

```
┌─────────────────────────────────────┐
│ [Avatar] Tên người dùng    2 giờ trước│
│ Nội dung comment...                  │
│ [Thích] [Trả lời] [Báo cáo]        │
│                                      │
│   ↳ [Avatar] Reply...                │
│     [Thích] [Trả lời] [Báo cáo]    │
└─────────────────────────────────────┘
```

**Rules**:
- Báo cáo button mờ, không prominently shown
- Reply nesting: chỉ 1 level (không deep nesting)
- "Đang chờ duyệt" badge nếu pending

---

### `ReportModal`
```
Báo cáo nội dung này

Lý do: [Dropdown]
  - Nội dung không phù hợp
  - Thông tin sai lệch
  - Spam
  - Khác

Mô tả thêm (optional): [Textarea]

[Huỷ]  [Gửi báo cáo]
```

---

### `GuestbookEntryCard`
```
┌────────────────────────────────┐
│ Tên ẩn danh / tên hiển thị    │
│ Nội dung sổ lưu niệm...       │
│ 12/03/2026                    │
└────────────────────────────────┘
```

---

## V. Form Components

### `AuthForm` variants

**Login form:**
- Email input (large, keyboard: email)
- Password input (với show/hide toggle)
- "Ghi nhớ đăng nhập" checkbox
- Submit button (full width mobile)
- Error: "Sai email hoặc mật khẩu" (không nêu cụ thể)

**Register form:**
- Email, password, confirm password, tên hiển thị
- Password strength indicator (nhưng không quá gamify)
- Terms acceptance checkbox

**Password input rules**: Show/hide toggle bắt buộc. Min-length hint.

---

### `ProfileForm`
Tabbed form cho settings.

**Tabs**: Thông tin cá nhân / Đổi mật khẩu / Phiên đăng nhập
**Avatar**: Upload + preview + crop

---

## VI. State Components

### `LoadingSkeleton`
Mỗi card/list component phải có skeleton variant.

```tsx
// Usage
<PostCard loading={true} />
// hoặc
<Skeleton className="h-32 w-full rounded-lg" />
```

**Rules**: Skeleton animation là pulse (opacity change), không shimmer (quá distracting cho elderly).

---

### `EmptyState`

```
┌─────────────────────────────┐
│         [Icon]              │
│   Chưa có bài viết nào      │
│  [Action button nếu có]     │
└─────────────────────────────┘
```

**Required for**: mọi list, search results, practice history, vow list, notification history.

---

### `ErrorState`

```
┌─────────────────────────────┐
│         ⚠️                   │
│   Đã xảy ra lỗi             │
│   Vui lòng thử lại          │
│   [Thử lại]  [Về trang chủ]│
└─────────────────────────────┘
```

---

### `OfflineBanner`
Fixed top banner khi offline.

```
⚠ Bạn đang offline. Một số tính năng không khả dụng.
```

---

### `Toast` notifications

| Type | Color | Icon | Use for |
|---|---|---|---|
| success | green | ✓ | Save successful, action completed |
| error | red | ✗ | Save failed, request error |
| info | blue | ℹ | Neutral information |
| warning | amber | ⚠ | Action has consequences |

**Rules**: Auto-dismiss sau 4s. Không stack > 3 toasts. Always dismissible.

---

## VII. Admin Components

### `DataTable`
Sortable, filterable table cho admin listings.

**Features**: sort by column, filter chips, search, pagination, bulk select, row actions
**Mobile**: responsive → horizontal scroll hoặc card view

---

### `ModerationActions`

```
┌───────────────────────────────────────┐
│ [Preview content đang bị báo cáo]     │
│                                        │
│ Quyết định:                           │
│ [Ẩn nội dung] [Bỏ qua báo cáo]       │
│                                        │
│ Ghi chú (optional): [____________]    │
└───────────────────────────────────────┘
```

---

### `PublishStatusBadge`

| Status | Badge |
|---|---|
| draft | Gray "Nháp" |
| published | Green "Đã xuất bản" |
| unpublished | Orange "Đã ẩn" |

---

### `AuditLogEntry`

```
[12/03/2026 14:32] admin@pmtl.vn
content.post.published
Post: "Hướng dẫn niệm kinh" (publicId: xxx)
IP: (masked)
```

---

### `FeatureFlagToggle`

```
[Feature Name]  [ON / OFF toggle]
Mô tả feature...
Enabled since: 12/03/2026
```

---

## VIII. Accessibility checklist

Mọi interactive component phải pass:

- [ ] Keyboard navigable (Tab order logic)
- [ ] Focus ring visible (không `outline: none`)
- [ ] Screen reader label (`aria-label` hoặc visible text)
- [ ] Error messages programmatically associated (`aria-describedby`)
- [ ] Loading state announced (`aria-live`)
- [ ] Image alt text
- [ ] Button has accessible name (không icon-only without aria-label)
- [ ] Color không phải indicator duy nhất (cần icon/text kèm)

---

## IX. Component priority for Phase 1

Implement theo thứ tự:

1. `MainNav` + `MobileBottomNav` (khung app)
2. `AuthForm` variants (login/register - launch blocker)
3. `PostCard` + `PostDetail` (content delivery)
4. `PracticeSheet` + `NgoiNhaNhoSheet` (core Five Treasures UX)
5. `ChantPlayer` (niệm kinh feature)
6. `AdvisoryCard` (calendar integration)
7. `SearchBar` + `SearchResult` (discovery)
8. `CommentThread` + `ReportModal` (community)
9. `VowCard` + forms (vows-merit)
10. Admin `DataTable` + `ModerationActions`
