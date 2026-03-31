# ORIENTALRADIO_BEGINNER_PRACTICE_PACK_PART2_2026-03-31

## Purpose
- Ghi nhận batch nội dung tiếp theo do owner cung cấp từ lane `For Beginners`.
- Tập trung vào 4 cụm: `Great Vows`, `Life Liberation`, `Altar Set Up`, `Buddhas/Bodhisattvas`.
- Dùng cho design mapping + moderation/safety tagging; chưa phải runtime canon.

## 1) Great Vows (normalized)

### Ý chính
- Vow được mô tả như lực ý chí liên kết với năng lượng Bồ Tát.
- Nhấn mạnh: chỉ niệm kinh thôi có thể chưa đủ trong tình huống nghiệp nặng; vow là lane tăng lực hành trì.
- Cảnh báo: phải giữ lời nguyện; không phát nguyện vượt khả năng.

### Vow items (có thể cấu trúc)
- Ăn chay mùng 1 và 15 âm lịch.
- Không ăn sinh vật sống.
- Không sát sinh.
- Làm việc thiện thường xuyên.
- In ấn/phát hành sách Phật pháp, công đức tài thí.
- Độ người theo số lượng + khung thời gian.

### Guardrail
- Tag: `belief_statement`, `self_discipline_rule`.
- Cấm product hóa kiểu “vow là bảo chứng chữa bệnh”.

## 2) Life Liberation (normalized)

### Ý chính
- Được mô tả gồm ba loại bố thí:
  - tài thí
  - pháp thí
  - vô úy thí
- Lợi ích được nêu: giảm tai nạn, kéo dài tuổi thọ, tăng hiệu lực khi kết hợp niệm kinh.

### Quy tắc thực hành
- Đối tượng ưu tiên: loài thường bị con người ăn/giết.
- Nên kết hợp trì chú trong lúc phóng sinh.
- Thời điểm:
  - quanh năm
  - ưu tiên sinh nhật, giao thừa, mùng 1/rằm, ngày vía
  - ưu tiên ban ngày, trời sáng; tránh ban đêm

### Query excerpts cần gắn nhãn
- Cardinal number 1200 cá, tier 1800 (Shuohua/Wenda excerpt).
- Case 200 rùa lớn và kéo dài tuổi thọ (Wenda excerpt).
- Các số liệu dạng này phải để `qa_reference` + `not_hard_validation`.

### Guardrail
- Tag: `ritual_guidance`, `qa_reference`, `non_medical_claim`.
- Không biến số 1200/1800 thành rule bắt buộc toàn hệ thống.

## 3) Altar Set Up (normalized)

### Ý chính
- Lập bàn thờ được mô tả là tăng hiệu lực công khóa và Little House.
- Có lane “bàn thờ đơn giản vẫn tốt hơn không có”.
- Nhà thuê vẫn có thể lập bàn thờ mức tối giản nếu điều kiện cho phép.

### Minimal altar candidate set
- Ảnh Bồ Tát chuẩn.
- 2 ly nước.
- lư hương.
- trái cây (nếu điều kiện cho phép).

### Safety / product
- Các testimonial hiệu ứng mạnh phải tag `testimonial`.
- UI copy public nên dùng wording trung tính: “khuyến khích theo điều kiện gia đình”.

## 4) Buddha & Bodhisattva profiles (normalized)

### Entities được nêu
- Shakyamuni Buddha
- Guan Yin Bodhisattva
- Nanjing Bodhisattva
- Tai Sui Bodhisattva
- Guan Di Bodhisattva
- Guan Ping Bodhisattva
- Zhou Cang Bodhisattva

### Các nhóm claim nhạy cảm
- “cứu chữa bằng chạm tay”, “hồi sinh người chết”, “phản hồi rất nhanh”, “trừng phạt tức thời”.
- Các claim này bắt buộc đi lane:
  - `research_only`
  - `doctrinal_or_testimonial`
  - `verification_required`

### Calendar-worthy sacred dates extracted
- 19/2 âm: vía Quan Âm
- 19/6 âm: ngày thành đạo Quan Âm
- 19/9 âm: ngày xuất gia Quan Âm

## 5) Suggested schema tags for future ingestion
- `sourceFamily`: `orientalradio`
- `contentFamily`: `beginner_pack`
- `evidenceType`: `instruction | qa_excerpt | testimony | doctrinal_statement`
- `riskLabel`: `low | medium | high`
- `productizationMode`: `checklist | advisory | reference_only | review_required`

## Links
- `design/05-references/external-research/ORIENTALRADIO_BEGINNER_PRACTICE_PACK_2026-03-31.md`
- `design/05-references/external-research/XLFM_FOUNDER_PROFILE_AND_RISK.md`
