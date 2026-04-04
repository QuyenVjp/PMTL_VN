# Kinh Văn Tự Tu — Self-Cultivation Sutras Burn Flow

> **Nguồn:** Khai thị chính thức của Đài trưởng Lư Quân Hoành
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## 1. Entity Definition

**Kinh Văn Tự Tu (Self-Cultivation Sutra Sheet / SCS):**
Tờ mẫu giấy vàng (A4 / Letter) in sẵn các vòng tròn, dùng để tích lũy trước một số lượng lớn kinh văn (VD: 1 tờ chứa 27 biến Lễ Phật Đại Sám Hối Văn).

**Mục đích:** Tích trữ năng lượng để "đốt" (sử dụng) một lần vào:
- Dịp lễ lớn (Phật đản, Vu Lan, ngày vía Bồ Tát)
- Sự cố khẩn cấp cần sám hối ngay lập tức

**Phân biệt cốt lõi:**
| Thực thể | Mục đích | Counter |
|----------|---------|---------|
| Kinh Bài Tập Hàng Ngày | Nạp năng lượng hàng ngày | Riêng biệt |
| Tiểu Phương Tử (NNN) | Trả nợ nghiệp | Riêng biệt |
| Kinh Văn Tự Tu | Tích trữ để đốt dịp lớn | Riêng biệt |

---

## 2. Business Rules — Lễ Phật Đại Sám Hối Văn (SCS)

### Rule 1 — Nguy cơ kích hoạt nghiệp chướng (High Risk)
Đốt 1 tờ tự tu Lễ Phật (VD 27 biến cùng lúc) có nguy cơ kích hoạt nghiệp chướng **mạnh hơn rất nhiều** so với niệm rải rác hàng ngày trong bài tập.

**Hệ thống phải:** Hiển thị warning severity=CRITICAL khi user thao tác burn.

### Rule 2 — Mandatory Little Houses Dependency
Logic hệ thống **KHÔNG BAO GIỜ** cho phép user "Đốt/Sử dụng" tờ tự tu Lễ Phật đơn độc.

**Điều kiện tiên quyết bắt buộc:**
- User phải có Tiểu Phương Tử (NNN) inventory > 0
- Hoặc user xác nhận checkbox đã chuẩn bị NNN

**Lý do:** Sám hối = gọi chủ nợ đến → Phải có NNN để trả nợ, nếu không sẽ gặp nguy hiểm tâm linh.

### Rule 3 — Recommendation Logic
Hệ thống **phải luôn hiển thị** dòng khuyến nghị:
> "Tự thành tâm quỳ niệm tụng Lễ Phật Đại Sám Hối Văn trực tiếp sẽ có hiệu quả sám hối tốt hơn là đốt bản tự tu."

---

## 3. Admin Flow

### Template Management
- Admin upload PDF chuẩn (A4 + Letter) để user tải về in ấn
- Admin cấu hình gói số lượng biến: 27, 49, 87 biến per tờ
- Admin quản lý phiên bản template (version tracking)

### Alert CMS
- Admin tùy chỉnh nội dung cảnh báo đỏ cho burn flow
- Quản lý message templates cho từng severity level

### Risk Monitoring
- Dashboard biểu đồ ẩn theo dõi:
  - User đánh dấu "Đã đốt SCS Lễ Phật" nhưng NNN inventory = 0
  - Admin nhận alert để kịp thời nhắc nhở đồng tu
- Aggregation: tổng SCS đã đốt/tuần, ratio SCS:NNN

---

## 4. Burn Flow — Multi-Step Safety Gate

Khi user bấm **[Đốt tờ tự tu Lễ Phật]**, hệ thống trải qua 4 bước:

### Bước 1 — Red Alert Popup
- Màn hình mờ, bảng thông báo viền đỏ
- Nội dung: "CẢNH BÁO: Đốt bản tự tu Lễ Phật Đại Sám Hối Văn rất dễ kích hoạt nghiệp chướng. Bạn có chắc chắn muốn sử dụng không?"

### Bước 2 — Lời khuyên Sư Phụ
- Hiển thị recommendation message (Rule 3)

### Bước 3 — Hard Validation Checkbox
- `[ ] Tôi đã chuẩn bị sẵn Tiểu Phương Tử (Ngôi Nhà Nhỏ) để đốt kèm theo`
- Nút [Xác nhận Đốt] disabled cho đến khi checkbox được tích

### Bước 4 — Instruction Modal (Nghi thức)
- Ngày tháng ghi trên bản tự tu = ngày đốt
- Thắp hương trước Phật đài / dâng Tâm Hương
- Đọc lời khấn cầu xin Bồ Tát chứng minh
- Luôn đốt kèm Tiểu Phương Tử

---

## 5. Data Model

### SelfCultivationSheet (new entity)

```
model SelfCultivationSheet {
  id              String   @id @default(cuid())
  publicId        String   @unique
  userId          String
  sutraType       String   // "le_phat_dai_sam_hoi_van" | "chu_dai_bi" | etc.
  templateKey     String   // "27_bien" | "49_bien" | "87_bien"
  totalSlots      Int      // 27, 49, 87
  completedSlots  Int      @default(0)
  status          String   // DRAFT | IN_PROGRESS | COMPLETED | BURNED
  burnDate        DateTime?
  burnConfirmedNnn Boolean @default(false)  // checkbox: prepared NNN
  note            String?
  createdAt       DateTime
  updatedAt       DateTime
}
```

### SelfCultivationTemplate (admin-managed)

```
model SelfCultivationTemplate {
  id           String   @id @default(cuid())
  publicId     String   @unique
  sutraType    String
  slotsCount   Int
  paperSize    String   // A4 | LETTER
  pdfMediaId   String?  // FK to MediaAsset
  status       String   // ACTIVE | ARCHIVED
  createdAt    DateTime
  updatedAt    DateTime
}
```

---

## 6. Module Ownership

| Concern | Owner |
|---------|-------|
| Template PDF management | Content / Self-Cultivation module |
| Sheet progress tracking | Engagement module |
| Burn flow validation rules | Engagement module |
| Risk monitoring dashboard | Admin module |
| NNN inventory check | Engagement / Little House service |
| Alert CMS content | Content / Admin CMS |
