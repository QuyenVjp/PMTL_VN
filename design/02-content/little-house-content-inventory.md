# Ngôi Nhà Nhỏ — Content Inventory

> File này là bản kiểm kê nội dung canonical cho toàn bộ feature Ngôi Nhà Nhỏ.
> Mỗi mục nội dung được map từ 13 nhóm nguồn gốc sang IA 5 nhóm mới.
>
> Đọc cùng:
> - `design/02-content/little-house-experience-architecture.md` — kiến trúc trải nghiệm
> - `design/02-content/little-house-spec.md` — spec kỹ thuật
> - `design/seo-geo/little-house-seo.md` — SEO strategy

---

## 1. Mapping 13 nhóm nguồn → 5 nhóm IA

| # | Tiêu đề gốc | Nhóm IA mới | Route | Ưu tiên |
|---|---|---|---|---|
| 1 | Ngôi Nhà Nhỏ và hiệu dụng | `/bat-dau` | `/ngoi-nha-nho/bat-dau` | P0 |
| 2 | Phật cụ cần thiết | `/bat-dau` | `/ngoi-nha-nho/bat-dau` | P0 |
| 3 | Một số lưu ý trước khi niệm | `/tri-tung` | `/ngoi-nha-nho/tri-tung/luu-y` | P0 |
| 4 | Trình tự các bước | `/tri-tung` | `/ngoi-nha-nho/tri-tung/cac-buoc` | P0 |
| 5a | Hướng dẫn chi tiết theo loại | `/tri-tung` | `/ngoi-nha-nho/tri-tung/huong-dan` | P1 |
| 5b | Hướng dẫn theo case (thực hành) | `/thuc-hanh` | `/ngoi-nha-nho/thuc-hanh` | P1 |
| 6 | Quy trình đốt | `/dot-va-hau-xu-ly` | `/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot` | P0 |
| 7 | Những điều lưu ý khi đốt | `/dot-va-hau-xu-ly` | `/ngoi-nha-nho/dot-va-hau-xu-ly/luu-y-dot` | P0 |
| 8 | Cách bảo quản | `/dot-va-hau-xu-ly` | `/ngoi-nha-nho/dot-va-hau-xu-ly/bao-quan` | P1 |
| 9 | Cách hủy bỏ khi viết sai/chấm sai | `/dot-va-hau-xu-ly` | `/ngoi-nha-nho/dot-va-hau-xu-ly/huy-bo` | P1 |
| 10 | Cách chấm chấm đỏ | `/tri-tung` | `/ngoi-nha-nho/tri-tung/cham-do` | P0 |
| 11 | Số lượng cho các trường hợp | `/tra-cuu` | `/ngoi-nha-nho/tra-cuu/so-luong` | P0 |
| 12 | Hỏi đáp | `/tra-cuu` | `/ngoi-nha-nho/tra-cuu/hoi-dap` | P0 |
| 13 | In ấn Ngôi Nhà Nhỏ | `/tra-cuu` | `/ngoi-nha-nho/tra-cuu/in-an` | P1 |

> **P0** = phải có ngay Phase A. **P1** = phase B hoặc khi nội dung ổn định.

---

## 2. Nhóm 1: Bắt đầu (`/ngoi-nha-nho/bat-dau`)

### 2.1 Nội dung cần có

**Block types bắt buộc:**

- `hero_intro`: Giới thiệu Ngôi Nhà Nhỏ là gì (1 đoạn, GEO-friendly)
- `quick_summary`: Tóm tắt nhanh 4 điểm chính
- `ritual_structure`: Bảng 4 loại (27/49/84/87 biến), mô tả ngắn mỗi loại
- `required_items`: Danh sách Phật cụ cần thiết
- `warning_list`: Các điều cần biết trước khi bắt đầu
- `faq_block`: 3-5 FAQ về khái niệm cơ bản
- `source_reference`: Nguồn gốc tài liệu

**Nội dung canonical (phải có):**

```
Ngôi Nhà Nhỏ (小房子) là tờ kinh văn trong Pháp Môn Tâm Linh dùng để trì tụng
và hỏa hóa chuyển công đức đến người nhận. Tờ kinh phải được viết tay, ghi rõ:
- Kính Tặng: tên người nhận (người bệnh, người quá cố, thai nhi, v.v.)
- Tặng: tên người tụng (người đang thực hành)
```

**Hiệu dụng của Ngôi Nhà Nhỏ:**
- Hỗ trợ người thân bệnh tật
- Siêu độ người quá cố
- Giải oan nghiệp thai nhi
- Hóa giải oán kết
- Tự tích lũy công đức

**Các loại Ngôi Nhà Nhỏ:**

| Loại | Số biến | Ghi chú |
|---|---|---|
| 27 biến | 27 | Phổ thông nhất, dùng cho hầu hết trường hợp |
| 49 biến | 49 | Cho trường hợp nặng hơn |
| 84 biến | 84 | Đặc biệt |
| 87 biến | 87 | Đặc biệt |

**Phật cụ cần thiết:**
- Ngôi Nhà Nhỏ (tờ kinh đã in đúng mẫu)
- Bút đỏ để chấm
- Bàn sạch để viết
- (Khi đốt: đĩa sứ trắng, ghế đốt mới, tâm hương, bật lửa)

### 2.2 Assets cần thiết

| Asset | Loại | Mô tả |
|---|---|---|
| `nha-nho-mat-truoc.jpg` | Ảnh | Mặt trước tờ Ngôi Nhà Nhỏ, có chú thích vùng |
| `nha-nho-mat-sau.jpg` | Ảnh | Mặt sau tờ Ngôi Nhà Nhỏ |
| `bang-so-loai.png` | Infographic | 4 loại và số biến tương ứng |
| `phat-cu-can-thiet.jpg` | Ảnh | Các dụng cụ cần thiết đặt cạnh nhau |

---

## 3. Nhóm 2: Trì tụng (`/ngoi-nha-nho/tri-tung`)

### 3.1 Sub-pages trong nhóm này

| Route | Nội dung |
|---|---|
| `/ngoi-nha-nho/tri-tung` | Landing tổng quan nhóm trì tụng |
| `/ngoi-nha-nho/tri-tung/luu-y` | Lưu ý trước khi niệm |
| `/ngoi-nha-nho/tri-tung/cac-buoc` | Trình tự các bước |
| `/ngoi-nha-nho/tri-tung/kinh-tang` | Cách điền Kính Tặng / Tặng |
| `/ngoi-nha-nho/tri-tung/cham-do` | Cách chấm đỏ |
| `/ngoi-nha-nho/tri-tung/huong-dan` | Hướng dẫn chi tiết theo từng loại |

### 3.2 Nội dung canonical — Lưu ý trước khi niệm

**Block types**: `warning_list`, `do_dont_grid`, `faq_block`

Lưu ý bắt buộc:
- Phải điền xong Kính Tặng và Tặng trước khi bắt đầu niệm
- Tâm thanh tịnh khi niệm
- Nên niệm sau khi đã làm công khóa (Chú Đại Bi)
- Không bắt đầu niệm từ 2-5 giờ sáng
- Thời gian tốt: 8h, 10h, 16h

### 3.3 Nội dung canonical — Trình tự các bước

**Block types**: `step_sequence`, `script_block`

Bước 1: Chọn loại Ngôi Nhà Nhỏ theo tình huống
Bước 2: Điền Kính Tặng (tên + họ đầy đủ người nhận)
Bước 3: Điền Tặng (tên + họ đầy đủ người tụng)
Bước 4: Đọc lời thỉnh cầu mở đầu: "Nam mô đại từ đại bi, cứu khổ cứu nạn, quảng đại linh cảm Quán Thế Âm Bồ Tát Ma Ha Tát" — 3 lần
Bước 5: Bắt đầu trì tụng các bài kinh cấu thành theo trình tự
Bước 6: Sau mỗi bài, chấm đúng ô tương ứng
Bước 7: Hoàn thành đủ số biến, tờ sẵn sàng để đốt

### 3.4 Nội dung canonical — Cách chấm đỏ

**Block types**: `step_sequence`, `image_compare`, `do_dont_grid`, `warning_list`

> `needs_review: high` — wording và hình ảnh phải đối chiếu kỹ với tài liệu gốc

**image_compare assets cần thiết:**

| Asset | Loại | Mô tả |
|---|---|---|
| `cham-do-dung.jpg` | Ảnh | Cách chấm đỏ đúng |
| `cham-do-sai-1.jpg` | Ảnh | Sai: chấm quá to |
| `cham-do-sai-2.jpg` | Ảnh | Sai: chấm sai ô |
| `cham-do-sai-3.jpg` | Ảnh | Sai: chấm chồng lên nhau |

### 3.5 Nội dung canonical — Cách điền Kính Tặng / Tặng

**Block types**: `step_sequence`, `image_compare`, `warning_list`, `faq_block`

Quy tắc điền:
- **Kính Tặng**: họ tên đầy đủ người nhận. Nếu là người bệnh còn sống: tên đầy đủ. Nếu là người quá cố: tên đầy đủ, kèm ngày sinh/mất nếu biết.
- **Tặng**: họ tên đầy đủ người tụng (người đang cầm bút viết và niệm kinh).
- Viết rõ ràng, đủ dấu, không viết tắt.
- Không được để trống nếu không phải trường hợp tích lũy cho bản thân.

**case_matrix** — trường hợp đặc biệt:

| Trường hợp | Kính Tặng | Tặng | Ghi chú |
|---|---|---|---|
| Người bệnh (còn sống) | Họ tên người bệnh | Họ tên người tụng | Có thể tự niệm cho mình |
| Người quá cố | Họ tên, ngày mất | Họ tên người tụng | — |
| Thai nhi / phá thai | Theo hướng dẫn riêng | Họ tên người mẹ | Xem hướng dẫn riêng |
| Tích lũy cho bản thân | Để trống / tên mình | Tên mình | Trường hợp đặc biệt |
| Niệm giúp người khác | Tên người được giúp | Tên người niệm | — |

---

## 4. Nhóm 3: Đốt & Hậu xử lý (`/ngoi-nha-nho/dot-va-hau-xu-ly`)

### 4.1 Sub-pages

| Route | Nội dung | Priority |
|---|---|---|
| `/ngoi-nha-nho/dot-va-hau-xu-ly` | Landing tổng quan | P0 |
| `/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot` | Quy trình 8 bước | P0 |
| `/ngoi-nha-nho/dot-va-hau-xu-ly/luu-y-dot` | Lưu ý khi đốt | P0 |
| `/ngoi-nha-nho/dot-va-hau-xu-ly/bao-quan` | Bảo quản tờ | P1 |
| `/ngoi-nha-nho/dot-va-hau-xu-ly/huy-bo` | Hủy bỏ khi sai | P1 |

### 4.2 Nội dung canonical — Quy trình đốt

**Block types**: `step_sequence`, `required_items`, `warning_list`, `image_compare`, `faq_block`, `source_reference`

**HowTo schema: 8 bước** (xem `design/seo-geo/structured-data.md` để xem schema JSON-LD đầy đủ)

**Dụng cụ cần chuẩn bị:**
- Đĩa sứ trắng không hoa văn (không dùng đĩa có hoa văn)
- Ghế đốt mới chưa dùng (không có hoa văn, không có lỗ hổng → bịt lại nếu có)
- Tâm hương
- Bật lửa hoặc diêm (không dùng đèn dầu Phật)
- Đũa hoặc kẹp gắp
- Khăn giấy sạch

**Thời gian tốt để đốt:**
- Tốt nhất: 8h sáng, 10h sáng, 16h chiều
- Chấp nhận được: 6h sáng
- Khẩn cấp: có thể đốt vào chiều tối hoặc 22h
- Tránh: ngày mưa, ban đêm (trừ khẩn cấp)

**Vị trí đốt:**
- Trên cao (trên ghế hoặc hộp) — không đặt trực tiếp dưới đất
- Không đặt trên bàn thờ Phật
- Nơi thoáng khí

**Quy tắc trong khi đốt:**
- Đốt từ góc phải phía trên
- Đốt hoàn toàn đến tro — không để sót giấy vàng
- Đốt từng tờ một
- Nếu đốt cho nhiều người khác nhau: chờ 1-2 phút giữa mỗi người
- Không niệm kinh trong khi đốt
- Không nói chuyện trong khi đốt
- Không chạm tro bằng tay không

**Xử lý tro:**
- Cho tro vào khăn giấy sạch
- Gói cẩn thận (tro còn nóng)
- Đặt vào túi ni lông mới
- Có thể bỏ chung rác sinh hoạt sạch
- Không trộn với rác bẩn

**image_compare assets:**

| Asset | Mô tả |
|---|---|
| `dia-su-trang-dung.jpg` | Đĩa sứ trắng đúng chuẩn |
| `dia-hoa-van-sai.jpg` | Sai: đĩa có hoa văn |
| `ghe-dot-moi.jpg` | Ghế đốt đúng chuẩn (mới, trơn) |
| `dot-goc-phai.jpg` | Đúng: đốt từ góc phải phía trên |
| `xu-ly-tro.jpg` | Cách gói tro đúng |

### 4.3 Nội dung canonical — Lưu ý khi đốt

**Block types**: `do_dont_grid`, `warning_list`

**Không được làm khi đốt:**
- Không niệm kinh trong lúc đốt
- Không nói chuyện
- Không để lửa tắt giữa chừng
- Không đốt nhiều tờ cùng lúc
- Không đốt chung với vàng mã thông thường
- Không để tro chạm đất bẩn

**Được phép:**
- Đọc câu thỉnh cầu ngắn nếu được hướng dẫn
- Quán tưởng người nhận

### 4.4 Nội dung canonical — Hủy bỏ khi sai

**Block types**: `warning_list`, `step_sequence`

Khi nào phải hủy:
- Viết sai Kính Tặng
- Viết sai Tặng
- Chấm sai ô (chấm nhầm, chấm chồng)
- Tờ bị ướt, bị rách nghiêm trọng

Cách hủy:
- Không vứt tờ như rác thông thường
- Thực hiện theo đúng quy trình hủy bỏ (xem tài liệu nguồn)
- `needs_review: true` — cần rà soát wording chính xác

---

## 5. Nhóm 4: Tra cứu (`/ngoi-nha-nho/tra-cuu`)

### 5.1 Sub-pages

| Route | Nội dung | Priority |
|---|---|---|
| `/ngoi-nha-nho/tra-cuu` | Landing tra cứu | P0 |
| `/ngoi-nha-nho/tra-cuu/so-luong` | Số lượng theo tình huống | P0 |
| `/ngoi-nha-nho/tra-cuu/hoi-dap` | Hỏi đáp phổ biến | P0 |
| `/ngoi-nha-nho/tra-cuu/in-an` | In ấn và tải xuống | P1 |

### 5.2 Nội dung canonical — Số lượng theo tình huống

**Block types**: `case_matrix`, `faq_block`

**Quy tắc số lượng chung:**
- Luôn dùng số lẻ: 1, 3, 5, 7, 9, ...
- Không dùng số chẵn
- Ngày thường: tối đa 7 tờ
- Ngày 1 và 15 âm lịch: tối đa 21 tờ
- Ngày lễ Phật đặc biệt: theo hướng dẫn cụ thể

**Case matrix — Số lượng theo từng tình huống:**

| Trường hợp | Số lượng đề xuất | Giới hạn | Ghi chú |
|---|---|---|---|
| Người bệnh thông thường | 7 | Tối đa ngày thường | Có thể chia làm nhiều ngày |
| Người bệnh nặng | 7-21 | Theo ngày 1/15 | Ưu tiên ngày đặc biệt |
| Người quá cố | 7 | Tối đa ngày thường | Ưu tiên ngày 1/15/lễ |
| Thai nhi / phá thai | Theo hướng dẫn riêng | — | Xem hướng dẫn riêng |
| Tích lũy cho bản thân | 1-7 | Ngày thường | Không giới hạn thời gian |
| Hóa giải oán kết | Theo hướng dẫn | — | Cần tư vấn cụ thể |

### 5.3 Nội dung canonical — Hỏi đáp

**Block types**: `faq_block` (FAQPage schema)

Danh sách FAQ ưu tiên (tối thiểu 10 câu):

1. Có thể tự niệm Ngôi Nhà Nhỏ cho bản thân không?
2. Mua tờ Ngôi Nhà Nhỏ ở đâu?
3. Niệm Ngôi Nhà Nhỏ mỗi ngày được không?
4. Có thể đốt Ngôi Nhà Nhỏ không có bàn thờ không?
5. Xử lý tro sau khi đốt như thế nào?
6. Đốt bao nhiêu tờ mỗi lần?
7. Phải niệm bao lâu mới xong một tờ?
8. Kính Tặng và Tặng có bắt buộc không?
9. Tờ viết sai có thể sửa không?
10. Ngôi Nhà Nhỏ có hiệu dụng cho người không theo Phật giáo không?

---

## 6. Nhóm 5: Thực hành (`/ngoi-nha-nho/thuc-hanh`)

Đây là cổng kết nối từ **public content** → **member tracker**.

### 6.1 Nội dung trang

**Block types**: `hero_intro`, `case_matrix` (chọn trường hợp), CTA

Luồng chính:
1. Người dùng chọn: "Trường hợp của tôi là gì?"
2. Hệ thống gợi ý loại Ngôi Nhà Nhỏ phù hợp
3. CTA: "Bắt đầu thực hành" → `/tu-tap/nha-nho` (cần đăng nhập)
4. CTA: "Đọc hướng dẫn trước" → deep-link vào guide phù hợp

### 6.2 Case selector UI

Case options hiển thị:

| Icon | Label | Xử lý |
|---|---|---|
| 🙏 | Người thân đang bệnh | → 49 biến, xem `so-luong` |
| 🕊️ | Người đã mất | → 49 biến, xem `tri-tung` |
| 👶 | Thai nhi / Phá thai | → Hướng dẫn riêng |
| ✨ | Tích lũy cho bản thân | → 27 biến |
| 🏠 | Người trong nhà cần kinh | → 27/49 biến |
| 🔗 | Hóa giải oán kết | → Hướng dẫn riêng |

---

## 7. Assets master list

### 7.1 Ảnh cần sản xuất

| Tên file | Nhóm | Loại | Ghi chú |
|---|---|---|---|
| `nha-nho-mat-truoc.jpg` | bat-dau | Ảnh giải thích | Có chú thích vùng Kính Tặng / Tặng |
| `nha-nho-mat-sau.jpg` | bat-dau | Ảnh | Mặt sau tờ kinh |
| `4-loai-nha-nho.png` | bat-dau | Infographic | 4 loại và số biến |
| `phat-cu-can-thiet.jpg` | bat-dau | Ảnh | Phật cụ cần thiết |
| `cham-do-dung.jpg` | tri-tung | Ảnh compare | Chấm đỏ đúng chuẩn |
| `cham-do-sai-*.jpg` | tri-tung | Ảnh compare | 3 dạng sai phổ biến |
| `dien-kinh-tang-dung.jpg` | tri-tung | Ảnh | Điền đúng |
| `dien-kinh-tang-sai.jpg` | tri-tung | Ảnh compare | Điền sai (để trống, viết tắt) |
| `dia-su-trang.jpg` | dot-va-hau-xu-ly | Ảnh | Đĩa sứ đúng |
| `dia-hoa-van.jpg` | dot-va-hau-xu-ly | Ảnh compare | Sai: đĩa hoa văn |
| `ghe-dot-moi.jpg` | dot-va-hau-xu-ly | Ảnh | Ghế đốt đúng |
| `dot-goc-phai.jpg` | dot-va-hau-xu-ly | Ảnh | Đốt từ góc phải |
| `xu-ly-tro.jpg` | dot-va-hau-xu-ly | Ảnh | Gói tro đúng cách |
| `flow-dot-khong-ban-tho.png` | dot-va-hau-xu-ly | Infographic | Flow đốt không bàn thờ |

### 7.2 Downloads cần có

| Tên | Loại | Mô tả |
|---|---|---|
| `huong-dan-nha-nho-v[N].pdf` | PDF | Tài liệu hướng dẫn tổng hợp, có version |
| `mau-in-nha-nho-27-bien.pdf` | PDF | Mẫu in 27 biến |
| `mau-in-nha-nho-49-bien.pdf` | PDF | Mẫu in 49 biến |
| `checklist-chuan-bi.pdf` | PDF | Checklist chuẩn bị trước khi niệm |
| `checklist-dot.pdf` | PDF | Checklist quy trình đốt |

---

## 8. Version tracking

| Version | Ngày | Thay đổi chính |
|---|---|---|
| 1.0 | 2026-03-20 | Tạo mới — inventory đầy đủ 5 nhóm |

> Khi có thay đổi quy trình nghi thức: cập nhật version, ghi chú nội dung thay đổi, cập nhật `dateModified` trên tất cả trang liên quan.
