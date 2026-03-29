# Kinh Văn Tự Tu — Content Inventory

> File này là canon inventory cho lane `Kinh Văn Tự Tu`.
> Nó gom dữ liệu từ bộ ảnh hướng dẫn thực hành được cung cấp ngày `2026-03-29` để chuẩn hóa wording, flow, và asset requirements.
>
> Đọc cùng:
> - `design/03-domains/content/REFERENCES/DAILY-PRACTICE-CONTENT-INVENTORY.MD`
> - `design/03-domains/content/REFERENCES/DAILY-PRACTICE-EXPERIENCE-ARCHITECTURE.MD`
> - `design/04-execution-overlay/web/PAGE_INVENTORY.md`

---

## 1. Route canon

```text
/kinh-van-tu-tu
├─ /bat-dau
├─ /cach-dung
├─ /bao-quan
├─ /truong-hop-su-dung
└─ /tai-xuong
```

---

## 2. Canon nội dung ưu tiên theo ảnh dữ liệu

### 2.1 Tam Đại Pháp Bảo (khối định hướng)

**Mục tiêu block**: giúp user hiểu mối liên hệ giữa `Niệm Kinh`, `Phát Nguyện`, `Phóng Sanh`.

**Block types**:
- `hero_intro`
- `quick_summary`
- `three-pillar-grid`
- `evidence_quote_list`

**Ba trụ cột bắt buộc hiển thị:**
- `Niệm Kinh`
- `Phát Nguyện`
- `Phóng Sanh`

**Nhóm lý do “Vì sao phải niệm kinh” cần có 3 card:**
- `Không tốn của quý vị một xu`
- `Gia hộ chúng ta`
- `Xa lìa phiền não`

**Social proof block (testimony excerpts):**
- lưu như `evidence_quote_list`, giữ ngày/tháng/năm và attribution rút gọn
- không sửa nghĩa, không cường điệu thêm ngoài nội dung nguồn

### 2.2 Cách dùng `Kinh Văn Tự Tu` khi có bàn thờ

**Block types**:
- `required_items`
- `step_sequence`
- `script_block`
- `do_dont_grid`
- `warning_list`

**Flow chuẩn (4 bước):**
1. Thắp hương, đảnh lễ, cảm tạ `Nam mô Đại Từ Đại Bi Cứu Khổ Cứu Nạn Quảng Đại Linh Cảm Quán Thế Âm Bồ Tát (Ma Ha Tát)` (`3` lần).
2. Cầu nguyện trước khi đốt: giơ cao tờ `Kinh Văn Tự Tu` qua đỉnh đầu để đảnh lễ, đặt lên bàn Phật, chắp tay quỳ và đọc lời thỉnh cầu theo mẫu.
3. Đốt tờ kinh từ trên xuống dưới (ưu tiên châm từ chỗ `Kính Tặng`), đốt cháy hoàn toàn, không để sót mảnh giấy.
4. Cảm tạ sau khi đốt và xử lý tro bằng khăn giấy sạch hoặc phong bì trước khi bỏ.

**Rule theo loại tờ cần hiển thị trong `case_matrix`:**

| Loại | Mục đích cầu chính |
|---|---|
| `Đại Bi Chú` | Cầu thân thể khỏe mạnh |
| `Tâm Kinh` | Cầu khai trí tuệ |
| `Lễ Phật Đại Sám Hối Văn` | Cầu tiêu trừ nghiệp chướng |

**Do/Don't bắt buộc:**
- Được dùng bật lửa hoặc diêm để châm.
- Không dùng đèn Phật để châm lửa.
- Không nói chuyện, không niệm kinh trong lúc đang đốt.

### 2.3 Hủy `Ngôi Nhà Nhỏ` điền sai hoặc bị làm bẩn

> Mặc dù là lane `Ngôi Nhà Nhỏ`, bộ ảnh này là nguồn quy trình chuẩn để link chéo từ `Kinh Văn Tự Tu` và tránh user xử lý sai.

**Block types**:
- `step_sequence`
- `image_compare`
- `warning_list`

**Flow chuẩn (3 bước):**
1. Chấm lại phần đã niệm sang tờ mới còn trống trước khi hủy tờ cũ.
2. Thưa với Bồ Tát, sau đó bôi xóa tên ở phần xưng danh và phần ký tên trên tờ cũ.
3. Gấp tờ cũ nhiều lần thành miếng nhỏ, bọc giấy/phong bì rồi bỏ.

**Guardrails:**
- Không vứt thẳng tờ cũ vào rác bẩn.
- Có thể xử lý cùng giấy phế liệu sạch.

---

## 3. Content model gợi ý cho CMS

### 3.1 Required blocks theo group

| Group | Required blocks |
|---|---|
| `/bat-dau` | `hero_intro`, `three-pillar-grid`, `quick_summary`, `source_reference` |
| `/cach-dung` | `step_sequence`, `script_block`, `case_matrix`, `do_dont_grid` |
| `/bao-quan` | `warning_list`, `step_sequence`, `faq_block` |
| `/truong-hop-su-dung` | `case_matrix`, `warning_list`, `faq_block` |
| `/tai-xuong` | `download_panel`, `source_reference`, `version_note` |

### 3.2 Metadata bắt buộc cho nội dung nhạy cảm

- `source_ref`
- `version_note`
- `last_human_review_at`
- `reviewer`

---

## 4. Asset inventory từ bộ ảnh

| Asset đề xuất | Nhóm | Mô tả |
|---|---|---|
| `tam-dai-phap-bao-overview.png` | `/bat-dau` | Infographic 3 pháp bảo |
| `vi-sao-phai-niem-kinh.png` | `/bat-dau` | Infographic 3 lý do niệm kinh + testimony |
| `kinh-van-tu-tu-dot-co-ban-tho-full.png` | `/cach-dung` | Full poster quy trình đốt có bàn thờ |
| `kinh-van-tu-tu-dot-co-ban-tho-b1-b2.png` | `/cach-dung` | Crop bước 1-2 |
| `kinh-van-tu-tu-dot-co-ban-tho-b3-b4.png` | `/cach-dung` | Crop bước 3-4 |
| `huy-ngoi-nha-nho-full.png` | `/truong-hop-su-dung` | Full poster quy trình hủy |
| `huy-ngoi-nha-nho-b1-b2.png` | `/truong-hop-su-dung` | Crop bước 1-2 |
| `huy-ngoi-nha-nho-b3.png` | `/truong-hop-su-dung` | Crop bước 3 |

---

## 5. Boundary và non-negotiables

- Không trộn wording `Kinh Văn Tự Tu` với wording `Ngôi Nhà Nhỏ` nếu không có `boundary_note`.
- Quy trình đốt/hủy là `step_sequence` có thứ tự; không rút gọn thành 1 paragraph.
- Mọi copy nhạy cảm đều phải có `source_reference` và `version_note`.
- UI mobile phải đọc được từng bước không cần phóng to ảnh.

---

## 6. Version

| Version | Ngày | Ghi chú |
|---|---|---|
| `1.0` | `2026-03-29` | Khởi tạo từ image data pack do user cung cấp; chốt flow đốt có bàn thờ + hủy tờ sai/bẩn + block Tam Đại Pháp Bảo |

