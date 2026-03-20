# User Flows (Luồng người dùng)

File này định nghĩa 7 journey chính của PMTL_VN.
Mỗi journey có: actor, trigger, steps, screens involved, success state, failure states.

> **Ref**: `ui/PAGE_INVENTORY.md` cho routes, `01-identity` → `10-wisdom-qa` cho backend contracts.

---

## Flow 1: New Member Onboarding (Thành viên mới)

**Actor**: Người mới chưa có tài khoản
**Trigger**: Nghe giới thiệu, tự tìm, hoặc referral
**Goal**: Đăng ký → hiểu app → thực hiện buổi tu đầu tiên

```
[Landing page /]
  ↓ Click "Bắt đầu tu học"
[/dang-ky]
  ↓ Nhập email + password + tên
[Email verification screen]
  ↓ Kiểm tra email, click link xác nhận
[/xac-nhan-email] → Redirect sang /dashboard
[/dashboard] — Lần đầu: hiện onboarding banner
  ↓ Click "Khám phá hướng dẫn cho người mới"
[/huong-dan] → Chọn bài đầu tiên
[/huong-dan/[slug]]
  ↓ Đọc xong → Click "Bắt đầu niệm kinh"
[/niem-kinh/[slug]] → Niệm xong
  ↓ Click "Ghi lại buổi niệm"
[/tu-tap/bai-tap] — Form ghi buổi tu đầu
  ↓ Submit
[/dashboard] — Hiện "Chúc mừng buổi tu đầu tiên! 🙏"
```

**Failure states:**
- Email đã tồn tại → 409 → hiện "Email này đã đăng ký, thử đăng nhập"
- Email verification timeout → hiện "Resend" button (60s cooldown)
- Email verification token expired → hiện "Gửi lại email xác nhận"

**Key UX rules:**
- Không redirect về homepage sau verify — phải vào /dashboard
- Dashboard lần đầu PHẢI có onboarding tour nhẹ (không intrusive)
- "Buổi tu đầu tiên" flow là 3 bước max từ dashboard

---

## Flow 2: Daily Practice (Tu tập hàng ngày)

**Actor**: Thành viên đã có tài khoản, dùng app mỗi ngày
**Trigger**: Mở app sáng / tối
**Goal**: Check advisory → thực hành → ghi lại → cập nhật Ngôi Nhà Nhỏ

```
[/dang-nhap] hoặc đã có session
  ↓
[/dashboard]
  - Thấy advisory hôm nay (từ Calendar)
  - Lunar date display
  - Quick actions
  ↓ Click "Xem lịch tu hôm nay"
[/lich-ca-nhan]
  - Advisory card đầy đủ
  - Chuỗi thực hành được gợi ý
  ↓ Click "Bắt đầu buổi tu"
[/tu-tap/bai-tap]
  - Danh sách bài niệm hôm nay
  - Check từng mục, nhập số biến
  ↓ Click "Lưu buổi tu"
  [Success toast: "Đã ghi lại ✓"]
  ↓ Nếu ngày đặc biệt (mùng 1, 15...):
[/tu-tap/nha-nho]
  - Cập nhật Ngôi Nhà Nhỏ
  ↓ Click "Dâng nhà" nếu đủ số biến
  [Confirmation modal: "Xác nhận dâng nhà?"]
  ↓ Confirm
  [Success: animation nhẹ + message]
```

**Mobile-first note:**
- Toàn bộ flow phải hoàn thành được với 1 tay, không cần scroll nhiều
- Practice sheet nên fit 1 màn hình không cần scroll (max 5-6 items hiện)
- "Lưu" button phải fixed bottom (không phải cuối form)

**Advisory card structure:**
```
┌─────────────────────────────┐
│ 📅 Mùng 15 tháng 2 âm lịch │
│ Ngày Rằm - Tu tập chính     │
│─────────────────────────────│
│ Chuỗi thực hành:            │
│ 1. Niệm kinh buổi sáng      │
│ 2. Phóng sanh               │
│ 3. Tụng Kinh Di Đà 1 biến   │
│─────────────────────────────│
│ Bài đọc gợi ý →             │
│ [Wisdom entry card]         │
└─────────────────────────────┘
```

---

## Flow 3: Wisdom Search (Tìm kiếm Bạch thoại)

**Actor**: Thành viên hoặc khách
**Trigger**: Muốn tìm giải thích về một vấn đề Phật pháp
**Goal**: Tìm → đọc → (tùy chọn) download offline

```
[Bất kỳ trang nào] → Search icon / /tim-kiem
[/tim-kiem]
  ↓ Nhập từ khóa ("phóng sanh bao nhiêu biến")
  [Results với tab filter: Bạch thoại / Q&A / Bài viết]
  ↓ Chọn kết quả Bạch thoại phù hợp
[/bai-hoa/[slug]]
  - Original text (nếu có)
  - Bản dịch tiếng Việt
  - Source attribution rõ ràng
  - Audio play button (nếu có)
  ↓ (member+) Click "Lưu đọc offline"
[Download confirmation] → Bundle download
[/ngoai-tuyen] — Xem trạng thái download
```

**No results state:**
- Gợi ý: "Thử tìm với từ khóa khác" + suggested tags
- Không hiện "No results found" trống rỗng

**Source attribution requirements (quan trọng):**
```
┌─────────────────────────────────┐
│ Nguồn: Pháp Sư Tịnh Không      │
│ Từ: lujunhong2or.com            │
│ [Xem nguồn gốc] [Screenshot]   │
└─────────────────────────────────┘
```

---

## Flow 4: Vow Lifecycle (Phát nguyện)

**Actor**: Thành viên đã đăng nhập
**Trigger**: Muốn tạo nguyện mới hoặc theo dõi nguyện đang có
**Goal**: Tạo nguyện → ghi tiến độ → hoàn nguyện

```
[/dashboard] → Click "Phát nguyện"
[/phat-nguyen] — Danh sách nguyện hiện tại
  ↓ Click "Tạo nguyện mới"
[/phat-nguyen/tao-moi]
  - Chọn loại nguyện
  - Nhập nội dung nguyện
  - Thiết lập target (optional)
  ↓ Submit → Confirmation screen: "Nguyện của bạn đã được ghi lại 🙏"
  ↓ Hàng ngày:
[/phat-nguyen/[id]] — Xem chi tiết + ghi tiến độ
  ↓ Click "Ghi tiến độ"
  [Modal: nhập milestone, ghi chú]
  ↓ Khi đạt target:
  [Notification: "Nguyện của bạn đã sắp viên mãn!"]
  ↓ Click "Viên mãn nguyện"
  [Confirmation modal]
  ↓ Confirm → Success state
[/phat-nguyen] — Nguyện chuyển sang "Đã viên mãn"
```

**Rules:**
- Nguyện không phải todo list — không có deadline progress bar kiểu Jira
- Completed vows được tôn trọng: không xóa khỏi danh sách, collapsed nhưng accessible
- "Void" nguyện phải có confirmation 2 bước

---

## Flow 5: Community Interaction (Tương tác cộng đồng)

**Actor**: Thành viên
**Trigger**: Muốn chia sẻ hoặc đọc kinh nghiệm tu học
**Goal**: Đọc bài → bình luận → (tùy chọn) report vi phạm

```
[/cong-dong] hoặc từ homepage
  ↓ Chọn bài đăng
[/bai-viet/[slug]] hoặc community post
  - Article body
  - Comment section (scroll xuống)
  ↓ (member+) Nhập bình luận
  [Comment form: textarea + Submit]
  ↓ Submit → Comment xuất hiện với "Đang chờ duyệt" label
  ↓ Sau khi approved: hiện normally
  ---
  ↓ (nếu thấy vi phạm) Click "Báo cáo" trên comment
  [Report modal: dropdown reason + note]
  ↓ Submit → Toast: "Báo cáo đã được ghi nhận. Cảm ơn bạn."
```

**Admin flow (report side):**
```
[Admin nhận notification / vào /admin/kiem-duyet]
  → Xem report + target content
  → Action: Hide / Resolve / Ignore
  → Audit log ghi lại
  → Reporter + author nhận notification
```

---

## Flow 6: Admin Moderation (Kiểm duyệt)

**Actor**: Admin (Phụng sự viên)
**Trigger**: Có báo cáo mới / cần duyệt guestbook
**Goal**: Review → ra quyết định → đồng bộ trạng thái

```
[/admin] → Thấy badge "X báo cáo chưa xử lý"
  ↓
[/admin/kiem-duyet] — Report queue
  - Pending reports sorted by date
  ↓ Click vào report
  [Report detail view]
  - Target content preview
  - Reporter info (ẩn tên, hiện role)
  - Reason + description
  ↓ Action buttons:
    [Ẩn nội dung] → Confirm modal → Apply → Audit log
    [Bỏ qua] → Mark resolved (no action) → Audit log
    [Thêm ghi chú] → Add resolution note
  ↓ Done → Report đổi status → Summary sync về target entity
  → Notification gửi author + reporter (async)
```

**Guestbook approval flow:**
```
[/admin/cong-dong] → Tab "Sổ lưu niệm"
  → List pending entries
  → Preview content
  → [Duyệt] / [Từ chối]
  → Approved entries xuất hiện trên /so-luu-niem
```

---

## Flow 7: Offline Download (Tải xuống ngoại tuyến)

**Actor**: Thành viên muốn dùng app không có mạng
**Trigger**: Đi xa, sóng yếu, muốn đọc trong chùa
**Goal**: Download bundle Bạch thoại → đọc offline

```
[/bai-hoa] hoặc /ngoai-tuyen
  ↓ Click "Tải về đọc offline"
[/ngoai-tuyen]
  - List available bundles
  - Bundle size + entry count
  ↓ Click "Tải xuống" trên bundle muốn
  [Download progress indicator]
  ↓ Complete → Toast: "Đã tải xong. Bạn có thể đọc khi không có mạng."
  ---
  Offline:
  [/bai-hoa] — Hiện offline indicator
  - Browse downloaded entries normally
  - Entries không download: "Cần kết nối mạng"
  ---
  Khi có mạng lại:
  [/ngoai-tuyen] → "Có bản cập nhật mới" badge
  ↓ Click "Cập nhật" → Delta sync (chỉ tải phần mới)
```

---

## Flow State: Error Recovery

**Scenarios quan trọng:**

| Scenario | UX behavior |
|---|---|
| Session expired mid-flow | Redirect `/dang-nhap?return=/path` → sau login quay lại path cũ |
| Upload fail | Toast error + retry button, không mất form data |
| Network offline | Offline banner top of page, disable write actions, keep reads |
| Search engine down | Hiện SQL fallback results, không hiện error tới user |
| Practice save fail | Toast error + "Thử lại" + keep form filled |
| Audit fail on write | Return 500, không im lặng, hiện "Đã xảy ra lỗi hệ thống" |

---

## Navigation structure (Cấu trúc điều hướng)

### Mobile bottom nav (5 tabs)
```
[ Trang chủ ] [ Tu tập ] [ Tìm kiếm ] [ Lịch ] [ Tôi ]
     /              /tu-tap          /tim-kiem    /lich     /tai-khoan
```

### Desktop top nav
```
Logo | Bài viết | Kinh sách | Bạch thoại | Lịch | Tìm kiếm | [Đăng nhập / Avatar]
```

### Admin sidebar
```
Dashboard | Nội dung ▼ | Cộng đồng | Kiểm duyệt | Người dùng | Hệ thống
```

### Breadcrumbs (trang có depth > 1)
```
Trang chủ > Kinh sách > Kinh A Di Đà
```
