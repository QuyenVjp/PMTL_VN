# Đơn Từ Tâm Linh — Spiritual Applications System

> **Nguồn:** Khai thị chính thức Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required
> **Cập nhật:** 2026-04-04

---

## 1. Overview

Pháp môn có các mẫu đơn đặc biệt (giấy vàng A4) được "gửi lên Bồ Tát". Hệ thống Web cung cấp file PDF chuẩn để đồng tu tải về in ra, kèm hướng dẫn nghi thức sử dụng.

**Đây là Content-owned**: PDF templates + ritual instructions, không phải user state tracking.

---

## 2. Catalog Đơn Từ

### Đơn Thăng Văn Đổi Tên (Application for Change of Name)
- **Đối tượng:** Người muốn dùng tên mới (đã dùng trên 1 năm) để niệm kinh và ghi lên Tiểu Phương Tử
- **Nghi thức:**
  1. Điền thông tin: tên cũ, tên mới, ngày tháng năm sinh
  2. Quỳ trước bàn thờ, thắp hương
  3. Đọc nội dung đơn 1 lần trước Bồ Tát
  4. **ĐỐT** đơn sau khi đọc xong
- **Hiệu lực:** Sau khi đốt, dùng tên mới cho tất cả hoạt động niệm kinh
- **Burn rule:** `MUST_BURN` — đơn này bắt buộc phải đốt

### Đơn Khuyến Đạo Người Nhà (Application for Convincing Family)
- **Đối tượng:** Đồng tu muốn xin Bồ Tát khai mở trí tuệ cho người nhà chưa tin Phật pháp
- **Nghi thức:**
  1. Điền thông tin: tên người cầu, tên người nhà, quan hệ
  2. Quỳ trước bàn thờ, thắp hương
  3. Đọc nội dung đơn 1 lần trước Bồ Tát
  4. **TUYỆT ĐỐI KHÔNG ĐỐT** — cất giữ cẩn thận
- **Cảnh báo CRITICAL:** Đốt đơn này có thể ảnh hưởng đến hồn phách người nhà
- **Burn rule:** `NEVER_BURN` — hệ thống phải block và cảnh báo đỏ

---

## 3. Business Rules

### Rule 1 — Burn Policy per Application Type
| Loại đơn | Burn Rule | `burnable` flag | Severity |
|---------|-----------|-----------------|----------|
| Đổi Tên | `MUST_BURN` | `true` | Bắt buộc đốt sau khi đọc |
| Khuyến Đạo | `NEVER_BURN` | `false` | **CRITICAL** — cấm đốt tuyệt đối |

**`burnable = false` enforcement:**
- API field `burnable: false` được lưu trong `Download.metadata`.
- Nếu frontend gửi request đánh dấu "đã đốt" cho đơn có `burnable = false` → backend reject **HTTP 422** với:
  ```json
  { "error": "burn_forbidden", "message": "Đơn này tuyệt đối không được đốt. Đốt sẽ gây hại hồn phách người nhà." }
  ```
- FE: nút "Hướng dẫn Đốt" bị **khóa hoàn toàn** (disabled + hidden) cho đơn `NEVER_BURN`.
- FE: hiển thị **watermark đỏ** cố định trên toàn bộ trang đơn: `"CẢNH BÁO: ĐỌC XONG PHẢI CẤT ĐI — TUYỆT ĐỐI KHÔNG ĐƯỢC ĐỐT"`.

### Rule 2 — 100-Day Name Activation Countdown (Đơn Đổi Tên)
Sau khi user xác nhận **"Đã đốt đơn Đổi Tên"**, hệ thống phải:

1. Set `completedAt = now()` trên `SpiritualApplicationRecord`.
2. Trigger `calendar` module tạo một **countdown event** 100 ngày:
   ```
   CalendarEvent {
     type:        "SPIRITUAL_NAME_ACTIVATION"
     startDate:   completedAt
     endDate:     completedAt + 100 days
     title:       "Kích hoạt năng lượng tên mới — [Tên mới]"
     ownerId:     userId
   }
   ```
3. Enqueue **recurring push notification** mỗi 7 ngày trong 100 ngày:
   - Message: `"Hãy nhắc người thân gọi bạn bằng tên [Tên mới] thật nhiều để kích hoạt năng lượng. Còn [X] ngày."`
4. Notification ngày 100: `"Đã đủ 100 ngày! Tên [Tên mới] đã được kích hoạt năng lượng đầy đủ."`

**Schema field cần bổ sung:**
```prisma
model SpiritualApplicationRecord {
  id              String   @id @default(cuid())
  userId          String
  applicationType String   // "NAME_CHANGE" | "FAMILY_PERSUASION"
  newName         String?  // bắt buộc khi applicationType = NAME_CHANGE
  burnable        Boolean
  completedAt     DateTime?
  activationEndsAt DateTime? // completedAt + 100 days
  createdAt       DateTime @default(now())
}
```

### Rule 3 — Download Tracking
- Track số lần tải để hiểu nhu cầu cộng đồng
- Không track ai tải — anonymous aggregate only

### Rule 4 — Instruction Mandatory
- PDF download PHẢI đi kèm instruction page
- User không thể tải PDF mà bỏ qua hướng dẫn
- Hướng dẫn hiển thị dạng modal/accordion trước nút Download

---

## 4. Data Model

Không cần model mới — sử dụng **Download** model hiện có:

```
Download (existing) {
  category: "SPIRITUAL_APPLICATION"  // new enum value
  metadata: {
    applicationType: "NAME_CHANGE" | "FAMILY_PERSUASION" | ...
    burnRule: "MUST_BURN" | "NEVER_BURN" | "OPTIONAL"
    paperSize: "A4" | "LETTER"
    instructionContentId: string  // FK to instruction guide
  }
}
```

### New Enum Value Needed
Add to `DownloadCategory`:
- `SPIRITUAL_APPLICATION`

---

## 5. Admin Features

### Template Management
- Upload PDF templates cho từng loại đơn
- Quản lý metadata: burnRule, paperSize, applicationType
- Version tracking (nếu mẫu đơn được cập nhật)

### Instruction CMS
- Tạo/sửa nội dung hướng dẫn nghi thức cho từng loại đơn
- Hướng dẫn phải bao gồm:
  - Điều kiện sử dụng
  - Các bước thực hiện (numbered steps)
  - Cảnh báo (warnings with severity)
  - Ảnh minh họa (optional MediaAsset refs)

### Download Analytics (Anonymous)
- Tổng lượt tải theo loại đơn / tuần / tháng
- Không lưu thông tin cá nhân người tải

---

## 6. UX Flow (Web — future reference)

1. User vào "Kho Pháp Bảo" → Tab "Đơn từ tâm linh"
2. Chọn loại đơn cần tải
3. Hệ thống hiển thị hướng dẫn nghi thức (MANDATORY read)
4. User xác nhận đã đọc hướng dẫn
5. Hiển thị nút Download PDF (A4 + Letter options)
6. Nếu burnRule = "NEVER_BURN": hiển thị banner cảnh báo đỏ cố định

---

## 7. Module Ownership

| Concern | Owner |
|---------|-------|
| PDF templates | Content / Downloads |
| Ritual instructions | Content / BeginnerGuide |
| Download analytics | Content (aggregate only) |
| Burn rule enforcement | Frontend validation + Backend check |
