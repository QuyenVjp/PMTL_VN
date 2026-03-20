# Kinh Bài Tập Hằng Ngày — Content Inventory

> File này là inventory canonical cho toàn bộ feature `Kinh Bài Tập Hằng Ngày`.
> Nó gom những gì tìm được từ:
>
> - PDF bước niệm cho người mới
> - bài FAQ / lưu ý
> - preset theo tình huống ngoài thực tế
>
> rồi map lại thành content model dùng được cho PMTL_VN.

---

## 1. Mapping nguồn thực tế → route inventory

| Nguồn / pattern | Route PMTL đề xuất | Priority |
|---|---|---|
| PDF “Các bước niệm kinh bài tập hằng ngày” | `/kinh-bai-tap/cac-buoc/cho-nguoi-moi` | P0 |
| Beginner hub “Dành cho người mới” | `/kinh-bai-tap/bat-dau` | P0 |
| FAQ / lưu ý khi niệm kinh bài tập | `/kinh-bai-tap/luu-y` | P0 |
| Preset cho người mới / cao tuổi / bệnh nặng | `/kinh-bai-tap/theo-tinh-huong/*` | P0 |
| PDF / sách kinh / tài liệu hỗ trợ | download panel trong hub/group pages | P1 |

---

## 2. IA đề xuất

```text
/kinh-bai-tap
├─ /bat-dau
├─ /cac-buoc
│  └─ /cho-nguoi-moi
├─ /luu-y
│  ├─ /thoi-gian-va-dia-diem
│  ├─ /cach-niem-dung
│  └─ /cau-hoi-thuong-gap
├─ /theo-tinh-huong
│  ├─ /nguoi-moi
│  ├─ /cong-viec-hoc-hanh
│  ├─ /hoa-giai-oan-ket
│  ├─ /nguoi-cao-tuoi
│  └─ /benh-nang
└─ /thuc-hanh
```

---

## 3. Nhóm 1: Bắt đầu (`/kinh-bai-tap/bat-dau`)

### Nội dung bắt buộc

- `Kinh Bài Tập là gì`
- khác gì với:
  - `Ngôi Nhà Nhỏ`
  - `Kinh Văn Tự Tu`
- bộ công khóa cơ bản cho người mới
- tài liệu cần có:
  - sách kinh
  - bản PDF hướng dẫn bước niệm

### Block types

- `hero_intro`
- `quick_summary`
- `comparison_table`
- `core_plan_matrix`
- `download_panel`
- `source_reference`

### Comparison matrix

| Surface | Bản chất | Dùng khi nào |
|---|---|---|
| Kinh Bài Tập | công khóa hằng ngày | làm đều mỗi ngày |
| Ngôi Nhà Nhỏ | trả nghiệp / siêu độ / chuyển công đức | theo từng case |
| Kinh Văn Tự Tu | tích lũy / dự phòng | dùng lúc cần |

---

## 4. Nhóm 2: Các bước (`/kinh-bai-tap/cac-buoc/cho-nguoi-moi`)

### Source-derived structure

Từ PDF và web ngoài, bộ flow cơ bản nên hiện thành stepper:

1. `Tịnh Khẩu Nghiệp Chân Ngôn`
2. chào thỉnh / cảm ân / thắp tâm hương hoặc tâm hương
3. vào phần công khóa chính
4. bài cốt lõi:
   - `Chú Đại Bi`
   - `Tâm Kinh`
   - `Lễ Phật Đại Sám Hối Văn`
5. chú nhỏ bổ sung nếu phù hợp
6. `Bổ Khuyết Chân Ngôn`
7. `Thất Phật Diệt Tội Chân Ngôn`

### Block types

- `step_sequence`
- `script_block`
- `core_plan_matrix`
- `warning_list`
- `download_panel`

### Core plan matrix

| Bài | Preset gợi ý cơ bản |
|---|---|
| `Tịnh Khẩu Nghiệp Chân Ngôn` | `7` |
| `Chú Đại Bi` | `3-7` cho người mới, `21-49+` cho case nặng |
| `Tâm Kinh` | `3-7` |
| `Lễ Phật Đại Sám Hối Văn` | `1-3`, case đặc biệt có thể hơn theo rule |
| `Bổ Khuyết Chân Ngôn` | `3` hoặc `7` |
| `Thất Phật Diệt Tội Chân Ngôn` | `3` |

---

## 5. Nhóm 3: Lưu ý (`/kinh-bai-tap/luu-y/*`)

### 5.1. Thời gian và địa điểm

Nội dung canonical nên có:

- ban ngày là tốt nhất
- cố gắng hoàn thành trước `10h tối`
- không nên niệm từ `2h sáng -> 5h sáng`
- với `Tâm Kinh`, `Vãng Sanh Chú`, `Lễ Phật Đại Sám Hối Văn`:
  - cần guardrails mạnh hơn theo tối/ngày, thời tiết, nơi chốn
- nơi ô uế, nhà vệ sinh, chỗ khí xấu thì không niệm
- gần bệnh viện, nghĩa trang, lò mổ:
  - chỉ nên niệm `Chú Đại Bi` theo rule an toàn

### 5.2. Cách niệm đúng

Nội dung canonical nên có:

- phải đọc tên kinh đầy đủ với một số bài
- không tụng quá to
- không tụng sai / sót
- có thể niệm trong ngày theo nhiều chặng
- nếu bị gián đoạn nên xử lý theo guardrail

### 5.3. Khi không hoàn thành đủ

- nên giữ đều hằng ngày
- nếu lỡ thiếu thì có cách khấn bạch và bù lại
- không nên tự tăng quá đột ngột với bài nặng

### Block types

- `time_place_rules`
- `warning_list`
- `do_dont_grid`
- `faq_block`

---

## 6. Nhóm 4: Theo tình huống (`/kinh-bai-tap/theo-tinh-huong/*`)

Đây là phần web ngoài đang có nhưng chưa được product hóa tốt.

### 6.1. Scenario presets bắt buộc

| Preset | Mô tả |
|---|---|
| `nguoi-moi` | bộ cơ bản khởi đầu |
| `cong-viec-hoc-hanh` | thêm Chuẩn Đề / focus thành tựu |
| `hoa-giai-oan-ket` | thêm Giải Kết Chú + warning về kết hợp Ngôi Nhà Nhỏ |
| `nguoi-cao-tuoi` | tăng trọng tâm bình an, tiêu tai, trường thọ |
| `benh-nang` | rule thận trọng, tăng/giảm bài theo guardrail |

### 6.2. Data shape đề xuất

Mỗi preset nên có:

- `presetKey`
- `title`
- `targetAudience`
- `goalSummary`
- `chantItems[]`
- `warningList[]`
- `whenToAvoid[]`
- `relatedGuideRefs[]`
- `needsHumanReview`

### 6.3. Guardrail quan trọng

- đây là `content presets`, không phải auto-medical advice
- wording phải giữ đúng tinh thần nguồn
- trường hợp `bệnh nặng` cần warning mạnh:
  - không để UI tạo cảm giác thay thế y khoa
  - chỉ là preset thực hành trong boundary tôn giáo của sản phẩm

---

## 7. Nhóm 5: Thực hành (`/kinh-bai-tap/thuc-hanh`)

Mục tiêu:

- chọn preset phù hợp
- sang `/tu-tap/bai-tap`
- giữ context để sheet cá nhân mở đúng plan

### UI blocks

- `scenario_selector`
- `today_checklist_preview`
- `advisory_context_card`
- CTA `Bắt đầu thực hành`

---

## 8. Downloads cần có

| Tên | Mục đích |
|---|---|
| `huong-dan-kinh-bai-tap-nguoi-moi.pdf` | bản PDF companion chuẩn |
| `sach-kinh-phat-giao-niem-tung-hop-tap.pdf` | kinh sách gốc |
| `checklist-cong-khoa-hang-ngay.pdf` | checklist in ra cho người lớn tuổi |

---

## 9. Web patterns cần học và vượt qua

### Nên học

- web Việt:
  - beginner hub
  - bài FAQ / lưu ý rất thực dụng
- web Trung:
  - one-page PDF rất trực diện
  - step list ngắn gọn

### Phải vượt

- không dừng ở PDF-only
- không bury scenario presets trong 1 bài dài
- không để `/tu-tap/bai-tap` tách rời khỏi guide

---

## 10. Version

| Version | Ngày | Ghi chú |
|---|---|---|
| `1.0` | `2026-03-20` | Tạo inventory canonical đầu tiên cho feature Kinh Bài Tập Hằng Ngày |
