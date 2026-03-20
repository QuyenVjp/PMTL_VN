# Engagement Module (Mô-đun Tương tác & Tu tập)

> Note for students (Ghi chú cho sinh viên):
> Engagement chỉ giữ self-owned user state (trạng thái cá nhân của người dùng), không giữ public editorial content (nội dung biên tập công khai).

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Engagement Module (Mô-đun Tương tác & Tu tập)

## Objectives (Mục tiêu)

- Store self-owned state outside content (tách dữ liệu cá nhân khỏi content)
- Manage bookmarks, reading progress, practice preferences, practice logs, practice sheets, và `Ngôi Nhà Nhỏ`
- Prevent editorial module bloat (ngăn content phình lên vì telemetry/private state)

## Module collections (Các tập dữ liệu của mô-đun)

### Scripture state (Trạng thái đọc kinh)

- `sutraBookmarks`: saved points and notes (điểm đánh dấu và ghi chú cá nhân)
- `sutraReadingProgress`: last-read position and reading telemetry (vị trí đọc gần nhất và tín hiệu tiến độ đọc)

### Practice state (Trạng thái tu tập)

- `chantPreferences`: user-specific plan settings (cấu hình kế hoạch niệm riêng của user)
- `practiceLogs`: historical practice sessions (các buổi công phu đã diễn ra)
- `practiceSheets`: daily electronic practice sheets (bảng công phu điện tử theo ngày)
- `ngoiNhaNhoSheets`: little-house progress records (bản ghi tiến độ Ngôi Nhà Nhỏ)

## Referenced supporting data (Dữ liệu hỗ trợ được tham chiếu)

- `sutras`, `sutraChapters` từ Content
- `chantItems`, `chantPlans` từ Content
- Boundary rule (quy tắc ranh giới):
  - Content owns rules/scripts (Nội dung sở hữu luật và kịch bản)
  - Engagement owns personal progress (Tương tác sở hữu tiến độ cá nhân)

## Current responsibilities (Trách nhiệm hiện tại)

### Bookmarking & progress (Đánh dấu & tiến độ)

- lưu bookmark, note, đoạn trích cá nhân
- lưu recent chapter và progress telemetry

### Practice customization (Cá nhân hóa tu tập)

- bật/tắt chant item tùy user
- đặt goal hoặc intention cá nhân cho một số plan

### Session history (Lịch sử buổi tu)

- log buổi công phu theo ngày/plan
- lưu status, start/end time, notes

### Practice sheets (Bảng công phu)

- quản lý bảng công phu điện tử hằng ngày
- hỗ trợ offline-first completion và sync lại sau
- lưu context user đang theo `daily practice preset` nào
- nối từ public guide/advisory sang sheet cá nhân mà không copy ritual truth

### Little House (Ngôi Nhà Nhỏ)

- quản lý từng house như một inventory item (đơn vị tồn kho riêng)
- theo dõi tiến độ 4 thành phần niệm bắt buộc
- theo dõi lifecycle như `completed`, `self_stored`, `offered`

## Engagement owns (Tương tác sở hữu)

- mọi data gắn với `userId` cho private progress

## Engagement does not own (Tương tác không sở hữu)

- canonical scripture text
- editorial posts
- moderation reports
- notification delivery infrastructure

## Assumptions (Giả định)

- `chantItems` và `chantPlans` là reference content
- practice-facing rules từ PDF/reference docs được chốt ở `01-content`
- canonical self-owned sheets/houses luôn nằm trong Engagement, không nằm trong Content
- `Kinh Bài Tập Hằng Ngày` public guide, preset, FAQ, time rules là content-owned; `practiceSheets` chỉ giữ self-state và context refs
