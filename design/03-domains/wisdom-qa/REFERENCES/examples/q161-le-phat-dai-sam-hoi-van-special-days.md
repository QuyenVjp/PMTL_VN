# Example Source-Backed QA: `Q161` | Lễ Phật Đại Sám Hối Văn ngày đặc biệt

## Purpose

Ví dụ này chốt cách bài `Hỏi đáp` có mật độ rule cao được map vào mô hình chuẩn của PMTL:

- `10-wisdom-qa` giữ source + bản dịch + rule extraction
- `06-calendar` chỉ compose advisory card theo ngày và audience
- `07-engagement` chỉ áp rule cho self-state, không giữ canonical wording

## Source identity

- `sourceCode`: `q161`
- `sourceType`: `wenda`
- `sourceFamily`: `wenda`
- `sourceProvenance`: `community_translation`
- `sourceSiteLabel`: `Oriental Radio Singapore`
- `sourceUrl`: `https://orientalradio.com.sg/chi-qna-173/q161/`
- `reviewStatus`: `human_review_required`
- `versionNote`: `Bản Việt do cộng đồng biên dịch; cần editor review trước khi coi là translated_reviewed canon.`

## Primary topic tags

- `Lễ Phật Đại Sám Hối Văn`
- `ngày lễ lớn`
- `giới hạn số biến`
- `Ngôi Nhà Nhỏ`
- `thời gian tụng niệm`
- `điều kiện có hoặc không có bàn thờ`
- `quy tắc cho thai phụ, sản phụ, trẻ em`

## Structured content map

- `questionOriginalSummary`
  - ngày lễ lớn có thể niệm bao nhiêu biến tối đa
  - có cần kết hợp `Ngôi Nhà Nhỏ` không
  - có kiêng kỵ gì không
- `answerOriginalSummary`
  - có giới hạn theo từng loại ngày
  - có điều kiện theo hoàn cảnh gia đình và audience
  - có rule phối hợp với `Ngôi Nhà Nhỏ`
  - không được vượt tổng số biến quy định trong ngày

## Practice rule extraction (normalized)

### A. Recitation caps by day type

- `recitationCapRules[]`
  - `ruleKey`: `lphv_tet_30_m1_total`
    - `scope`: `cross_day_total`
    - `window`: `30_tet + mung_1_tet`
    - `maxCount`: `87`
    - `note`: `Tổng hai ngày không vượt 87; không phải 87 mỗi ngày.`
  - `ruleKey`: `lphv_major_holiday_standard`
    - `scope`: `single_day_total`
    - `maxCount`: `27`
    - `appliesTo`: `Tet Duong lich`, `Tet Nguyen Tieu`, một số ngày lễ lớn tương đương
  - `ruleKey`: `lphv_buddha_bodhisattva_days_standard`
    - `scope`: `single_day_total`
    - `maxCount`: `49`
    - `appliesTo`: các ngày vía Phật/Bồ Tát chuẩn
  - `ruleKey`: `lphv_dia_tang_birthday_special`
    - `scope`: `single_day_total`
    - `maxCount`: `79`
    - `appliesTo`: `30/7 âm lịch`
  - `ruleKey`: `lphv_trung_cuu_special`
    - `scope`: `single_day_total`
    - `maxCount`: `63`
    - `appliesTo`: `9/9 âm lịch`
  - `ruleKey`: `lphv_trung_nguyen_special`
    - `scope`: `single_day_total`
    - `maxCount`: `21`
    - `appliesTo`: `Rằm tháng 7`
  - `ruleKey`: `lphv_mung_1_ram_binh_thuong`
    - `scope`: `single_day_total`
    - `maxCount`: `21`
    - `appliesTo`: `Mùng 1 và Rằm bình thường`

### B. Specific-date matrix from Q161

- `specialDateCapMatrix[]`
  - `Mùng 1 tháng Giêng`: `87` (hoàn thành trong cụm `30 Tết + Mùng 1`)
  - `Mùng 8 tháng Hai`: `49`
  - `15 tháng Hai`: `49`
  - `19 tháng Hai`: `49`
  - `Mùng 8 tháng Tư`: `49`
  - `19 tháng Sáu`: `49`
  - `13 tháng Bảy`: `49`
  - `30 tháng Bảy`: `79`
  - `22 tháng Tám`: `49`
  - `19 tháng Chín`: `49`
  - `17 tháng Mười Một`: `49`
  - `Mùng 8 tháng Chạp`: `49`
  - `Rằm tháng Giêng`: `27`
  - `Mùng 5 tháng 5`: `49`
  - `Thanh Minh`: `49`
  - `Rằm tháng 7`: `21`
  - `Rằm tháng 8`: `49`
  - `Mùng 9 tháng 9`: `63`
  - `Đông Chí`: `49`

### C. Time-window rules

- `timeWindowRules[]`
  - ngày có thể `thắp đầu hương`: nếu nhà có bàn thờ Phật, có thể niệm 24 giờ
  - ngày thường (kể cả mùng 1/rằm bình thường): tránh niệm `22:00 -> 05:00`
  - trong Pháp hội:
    - khu `Quan Âm Đường` có thắp hương: có thể niệm 24 giờ
    - khu ngoài Quan Âm Đường: chỉ `05:00 -> 22:00`

### D. Audience exception rules

- `audienceRules[]`
  - `pregnant_or_postpartum`: tổng số biến mỗi ngày đặc biệt `<= 7` (đã gồm công khóa)
  - `children_under_12`: ngày đặc biệt nên trong `<= 7` (an toàn nhất)
  - `children_12_to_under_18`: dịp `30 Tết + Mùng 1` tối đa `49`
  - `age_18_plus`: dịp `30 Tết + Mùng 1` có thể theo cap `87`
  - `children_5_plus`: được phép niệm thêm theo rule phù hợp lứa tuổi

### E. Combination rules with Ngôi Nhà Nhỏ

- `combinationRules[]`
  - nếu sám hối cho một việc cụ thể trong đời này:
    - thường không dễ kích hoạt mạnh
    - có thể không bắt buộc kết hợp `Ngôi Nhà Nhỏ`
  - nếu cầu chung chung hoặc nhắm nghiệp nặng tiền kiếp:
    - dễ kích hoạt
    - nên kết hợp `Ngôi Nhà Nhỏ`
  - nguyên tắc an toàn:
    - khi niệm nhiều `Lễ Phật`, có thể đốt thêm `Ngôi Nhà Nhỏ` theo cap tương ứng ngày đó

### F. Little House burning caps on special days

- `littleHouseCapRules[]`
  - ngày vía Phật chuẩn (trừ Khánh đản Địa Tạng):
    - tự thân tổng các loại: `<= 49`, case đặc biệt `<= 69`
  - Khánh đản Địa Tạng:
    - mỗi loại (`người quá cố`, `người cần kinh của mình`) tương ứng `<= 78`
  - Trung Thu, Đoan Ngọ: tổng `<= 49`
  - Nguyên Tiêu: tổng `<= 49`, case đặc biệt `<= 69`
  - Thanh Minh, Trung Nguyên, Đông Chí:
    - mỗi loại phù hợp `<= 49`
  - Mùng 1 Tết: tổng `<= 69`
  - Trùng Cửu:
    - mỗi loại trong `<= 21`
  - các ngày có thể niệm nhiều khác:
    - mỗi loại `<= 21`

### G. Self-cultivation paper burning constraints

- `selfCultivationRules[]`
  - số bản `Kinh Văn Tự Tu Lễ Phật` mang đi hóa trong ngày không vượt tổng cap ngày đó
  - hóa đốt bắt buộc:
    - có bàn thờ Phật
    - đã dâng hương
  - không có bàn thờ Phật:
    - không được hóa bản `Kinh Văn Tự Tu Lễ Phật`

## Required projection fields for downstream modules

- `calendarProjectionFields`
  - `dayTags[]`
  - `recitationCaps[]`
  - `crossDayCapWindows[]`
  - `audienceCaps[]`
  - `timeWindows[]`
  - `householdConditions[]`
  - `littleHouseCaps[]`
- `engagementProjectionFields`
  - `hardCapValidation`
  - `warningCards`
  - `selfCultivationAvailability`

## Notes

- Đây là rule extraction mẫu để thiết kế hệ thống; không thay thế review doctrinal cuối.
- Khi ingest vào data layer thật, cần split rule thành record nhỏ để calendar/advisory compose theo `date + audience + household + ritual_mode`.
