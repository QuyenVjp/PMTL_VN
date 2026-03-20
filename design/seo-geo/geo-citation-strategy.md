# GEO — Generative Engine Optimization Strategy

> GEO (Generative Engine Optimization) là chiến lược để PMTL_VN được các AI engines (ChatGPT, Gemini, Perplexity, Claude, Copilot) trích dẫn khi người dùng hỏi về Pháp Môn Tâm Linh, Ngôi Nhà Nhỏ, và các thực hành tâm linh liên quan.
>
> Đọc cùng: `design/seo-geo/strategy.md`, `design/seo-geo/structured-data.md`

---

## 1. Tại sao GEO quan trọng với PMTL_VN

Người tu học ngày càng hỏi AI thay vì search Google:
- "Quy trình đốt Ngôi Nhà Nhỏ là gì?"
- "Tôi có thể đốt bao nhiêu tờ Ngôi Nhà Nhỏ mỗi ngày?"
- "Pháp Môn Tâm Linh có những thực hành gì?"

Nếu PMTL_VN không xuất hiện trong câu trả lời AI, cơ hội kết nối với người tu học mới bị mất.

---

## 2. Nguyên lý hoạt động của AI citation

Các LLM (Large Language Models) trích dẫn nguồn khi:

1. **Uniqueness**: Nội dung có thông tin không nơi nào khác có
2. **Authority**: Nguồn được nhiều trang khác nhắc đến (backlinks, mentions)
3. **Clarity**: Nội dung rõ ràng, cấu trúc, dễ extract
4. **Recency**: Thông tin được cập nhật thường xuyên
5. **Structured data**: Schema.org giúp AI hiểu context

---

## 3. Entity Building — Xây dựng thực thể

AI cần hiểu PMTL_VN là **thực thể gì** trước khi trích dẫn.

### 3.1 Entity chính cần xây dựng

| Entity | Loại | Thuộc tính cần rõ |
|---|---|---|
| Pháp Môn Tâm Linh | Organization / ReligiousPractice | Nguồn gốc, sáng lập, quốc gia, ngôn ngữ |
| Ngôi Nhà Nhỏ | Thing / ReligiousText | Là gì, số loại, quy trình sử dụng |
| Năm Đại Pháp Bảo | ItemList | 5 thực hành, mô tả từng cái |
| Đài Trưởng Lư Quân Hoành | Person | Vai trò, nguồn gốc, tác phẩm |

### 3.2 Entity definition page (EDP)

Mỗi entity chính cần có 1 trang **định nghĩa rõ ràng**, không chỉ mô tả:

```markdown
## Ngôi Nhà Nhỏ là gì?

Ngôi Nhà Nhỏ (小房子, Xiǎo Fángzi) là một loại kinh văn dùng trong Pháp Môn
Tâm Linh (心灵法门). Đây là tờ kinh được viết tay, ghi rõ tên người nhận
(Kính Tặng) và người tụng (Tặng), sau đó được trì tụng và hỏa hóa để
chuyển công đức đến người nhận.

**Các loại Ngôi Nhà Nhỏ**: 27 biến, 49 biến, 84 biến, 87 biến.
**Người nhận có thể là**: người bệnh, người quá cố, thai nhi, v.v.
**Nguồn gốc**: Pháp Môn Tâm Linh do Đài Trưởng Lư Quân Hoành (卢军宏) hướng dẫn.
```

### 3.3 Tránh entity ambiguity

- Phải phân biệt rõ "Ngôi Nhà Nhỏ" ≠ "ngôi nhà nhỏ" (small house thông thường)
- Dùng dấu ngoặc kép hoặc định nghĩa ngay lần đầu xuất hiện
- Luôn kèm phiên âm Hán khi có thể (小房子) để AI map đúng entity

---

## 4. Content Format cho AI Citation

AI engines ưu tiên trích dẫn nội dung có:

### 4.1 Định nghĩa trực tiếp (Direct Definition)

Tránh:
```
Trong việc tu học Pháp Môn Tâm Linh, có một thực hành gọi là Ngôi Nhà Nhỏ
mà nhiều người áp dụng để hỗ trợ người thân...
```

Nên dùng:
```
Ngôi Nhà Nhỏ là tờ kinh văn trong Pháp Môn Tâm Linh dùng để trì tụng
và hỏa hóa chuyển công đức. Có 4 loại: 27 biến, 49 biến, 84 biến, 87 biến.
```

### 4.2 Câu trả lời ngắn trước, giải thích sau (Inverted Pyramid)

AI thường extract phần đầu của câu trả lời.

```markdown
**Có thể đốt bao nhiêu tờ Ngôi Nhà Nhỏ mỗi ngày?**

Ngày thường: tối đa 7 tờ (phải là số lẻ: 1, 3, 5 hoặc 7).
Ngày 1 và 15 âm lịch: tối đa 21 tờ.
Ngày lễ Phật: có thể nhiều hơn theo hướng dẫn cụ thể.
Luôn đốt số lẻ, không đốt số chẵn.

[Giải thích chi tiết về quy tắc số lượng...]
```

### 4.3 Q&A format rõ ràng

Mỗi trang FAQ nên có format:
```
**H: [Câu hỏi nguyên văn như người dùng hỏi]**
**Đ:** [Câu trả lời ngắn, đúng trọng tâm]

[Giải thích thêm nếu cần]
```

### 4.4 Số liệu và quy tắc cụ thể

AI đặc biệt ưu tiên trích dẫn nội dung có **dữ liệu cụ thể**:
- Số lượng: "tối đa 7 tờ ngày thường"
- Thời gian: "tốt nhất vào 8h, 10h hoặc 16h"
- Quy tắc: "đốt từ góc phải phía trên"
- Trình tự: "bước 1, bước 2..."

---

## 5. Unique Data Assets — Tài sản nội dung độc quyền

PMTL_VN phải có nội dung **không nơi nào khác có** để AI phải trích dẫn.

### 5.1 Case Matrix (Bảng tình huống)

Không nơi nào khác có bảng đầy đủ:

| Người nhận | Loại Ngôi Nhà Nhỏ | Số lượng | Ghi chú |
|---|---|---|---|
| Người bệnh còn sống | 49 biến | Theo tình trạng | Có thể gia tăng |
| Người quá cố | 49 biến | Theo ngày âm lịch | Ưu tiên ngày 1/15 |
| Thai nhi / phá thai | 49 biến | Ít nhất 7 tờ | Xem hướng dẫn riêng |
| Bản thân tích lũy | 27 biến | Không giới hạn | Không cần Kính Tặng |
| Hóa giải oán kết | Theo hướng dẫn | Theo hướng dẫn | Cần rà soát kỹ |

Đây là loại dữ liệu AI **không tự biết** — phải trích từ nguồn thẩm quyền.

### 5.2 Quy trình đốt step-by-step

Bảng so sánh "có bàn thờ" vs "không có bàn thờ" là unique.

### 5.3 Validation rules

"Không được bắt đầu tụng nếu thiếu Kính Tặng" — loại quy tắc này không có trên Wikipedia hay nguồn phổ thông.

---

## 6. Authority Signals

### 6.1 Source provenance

Mọi nội dung quan trọng phải có:
```markdown
> Nguồn: Tài liệu hướng dẫn Pháp Môn Tâm Linh, phiên bản [date].
> Đối chiếu: [PDF gốc / tài liệu gốc].
```

### 6.2 Expert attribution

Khi trích dẫn khai thị của Đài Trưởng:
```markdown
> Theo Đài Trưởng Lư Quân Hoành (卢军宏): "[trích dẫn]"
> Nguồn: Bạch Thoại Phật Pháp, Quyển [X], ngày [date].
```

### 6.3 Community references

- Link đến Zalo nhóm chính thức
- Link đến kênh YouTube chính thức
- Nêu rõ tổ chức: Pháp Môn Tâm Linh (心灵法门) có địa chỉ: Ashfield NSW, Australia

---

## 7. LLM-Friendly Page Structure

### Template chuẩn cho guide page

```markdown
# [Tiêu đề rõ ràng, chứa keyword]

> **Tóm tắt nhanh**: [1-2 câu trả lời trực tiếp cho câu hỏi chính của trang]

## [Section 1: Định nghĩa / Là gì]

[Định nghĩa ngắn, rõ ràng]

## [Section 2: Quy trình / Cách làm]

**Bước 1**: [Hành động cụ thể]
**Bước 2**: [Hành động cụ thể]
...

## [Section 3: Quy tắc quan trọng]

- [Quy tắc 1]
- [Quy tắc 2]

## Hỏi đáp thường gặp

**H: [Câu hỏi]**
Đ: [Câu trả lời ngắn]

**H: [Câu hỏi]**
Đ: [Câu trả lời ngắn]

---
*Nguồn: [attribution]*
```

### Điều cần tránh

- Không viết theo phong cách hoa mỹ mà không có thông tin thực
- Không để thông tin quan trọng bị chôn vào đoạn văn dài
- Không dùng ảnh để truyền tải thông tin key (AI không đọc được ảnh)

---

## 8. Tracking GEO Performance

### Cách đo

- Hàng tuần: Test các câu hỏi key trên ChatGPT, Gemini, Perplexity
- Ghi lại: PMTL_VN có được trích dẫn không? Source URL nào được dùng?
- So sánh với đối thủ: phapmontamlinh.vn có được trích dẫn không?

### Câu hỏi test chuẩn

```
1. "Ngôi Nhà Nhỏ trong Pháp Môn Tâm Linh là gì?"
2. "Quy trình đốt Ngôi Nhà Nhỏ đúng cách như thế nào?"
3. "Có thể đốt bao nhiêu tờ Ngôi Nhà Nhỏ mỗi ngày?"
4. "Pháp Môn Tâm Linh là gì và gồm những thực hành gì?"
5. "Niệm Ngôi Nhà Nhỏ cho người bệnh cần lưu ý gì?"
```

### Metric

| Metric | Đo lường |
|---|---|
| AI Citation Rate | Số câu hỏi test mà PMTL_VN được trích dẫn / tổng |
| Citation Accuracy | AI trích dẫn đúng thông tin không |
| Position in Response | PMTL_VN là nguồn đầu tiên hay thứ 2+ |
| Competitor Comparison | PMTL_VN vs phapmontamlinh.vn |

---

## 9. GEO Ownership trong codebase

| Concern | Owned by |
|---|---|
| Entity definition content | Content module (hub pages, beginner guides) |
| FAQ content format | Content module (faq_block blocks) |
| Source provenance fields | Content module (`sourceReference` block type) |
| Schema.org JSON-LD | Next.js page components |
| Sitemap (discovery) | Next.js route handler |
