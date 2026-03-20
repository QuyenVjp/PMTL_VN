# Example advisory (thông báo hoặc gói hướng dẫn): 2026-03-19 | Mùng 1 tháng 2 âm lịch

File này là ví dụ bóc tách một thông báo thực tế thành design data.

## Day identity

- `solarDate`: `2026-03-19`
- `weekdayVi`: `Thứ Năm`
- `lunarLabel`: `Mùng 1 tháng 2 âm lịch`
- `dayTags`:
  - `mung_1`
  - `special_practice_day`

## Announcement copy

- `headlineVi`: `Hôm nay ngày 19/03/2026`
- `headlineZh`: `今天2026年3月19日`
- `introVi`: `Kính mong mọi người làm nhiều công đức, lấy hiếu làm đầu, ăn chay niệm kinh, tránh sát sinh, phóng sanh, không làm các điều ác, siêng làm các điều thiện.`
- `introZh`: `敬请大家：多做功德、以孝为先、吃素念经、戒杀放生、诸恶莫作、众善奉行。`

## Practice recommendations

- `do_good`
  - `labelVi`: `Làm nhiều công đức`
  - `actionKind`: `encourage`
- `filial_piety`
  - `labelVi`: `Lấy hiếu làm đầu`
  - `actionKind`: `encourage`
- `vegetarian`
  - `labelVi`: `Ăn chay niệm kinh`
  - `actionKind`: `encourage`
- `avoid_harming`
  - `labelVi`: `Tránh sát sinh`
  - `actionKind`: `avoid`
- `life_release`
  - `labelVi`: `Phóng sanh`
  - `actionKind`: `encourage`

## Recitation rules

- rule 1
  - `chantKey`: `le_phat_dai_sam_hoi_van`
  - `chantLabelVi`: `Kinh Lễ Phật Đại Sám Hối Văn`
  - `maxCount`: `21`
  - `scope`: `special_day_total`
  - `conditionSummaryVi`: `Dùng để sám hối cho một việc cụ thể trong đời này.`

- rule 2
  - `chantKey`: `le_phat_dai_sam_hoi_van`
  - `maxCount`: `7`
  - `scope`: `special_day_total`
  - `audience`: `pregnant_or_postpartum`
  - `conditionSummaryVi`: `Phụ nữ mang thai hoặc đang ở cữ không nên vượt quá 7 biến một ngày, gồm cả công khóa ngày đó.`

## Time window rules

- `ruleType`: `avoid_window`
- `start`: `22:00`
- `end`: `05:00`
- `conditionSummaryVi`: `Kinh Lễ Phật Đại Sám Hối Văn tốt nhất không nên tụng trong khoảng này.`

## Household conditions

- `householdType`: `no_altar`
  - `requiredActionVi`: `Phải thắp Tâm hương trước khi tụng; nếu chia nhiều lần thì trước mỗi lần đều phải thắp Tâm hương.`

- `householdType`: `has_altar_but_outside_without_official_incense`
  - `requiredActionVi`: `Nếu ra ngoài và trong ngày chưa thắp hương chính thức thì cũng phải thắp Tâm hương trước rồi mới tụng.`

## Exception rules

- `audienceType`: `pregnant`
  - `ruleSummaryVi`: `Trong ngày đặc biệt, tổng số Lễ Phật không vượt quá 7 biến.`
- `audienceType`: `postpartum`
  - `ruleSummaryVi`: `Trong thời gian ở cữ, tổng số Lễ Phật không vượt quá 7 biến.`

## Source refs

- `officialRef`
  - `sourceLabel`: `Q&A 161`
  - `sourceUrl`: `https://orientalradio.com.sg/chi-qna-173/q161/`
- `communitySupportRef`
  - `refType`: `volunteer_support`
  - `noteVi`: `Có thể gắn link phụng sự viên Việt Nam hoặc điểm hỗ trợ địa phương, nhưng không thay cho source rule chính thức.`

## UI card rút gọn gợi ý

Card 1:

- `title`: `Mùng 1 tháng 2 âm lịch`
- `body`: `Hôm nay có thể tụng Lễ Phật Đại Sám Hối Văn không quá 21 biến cho một việc cụ thể.`

Card 2:

- `title`: `Lưu ý thời gian`
- `body`: `Tốt nhất không tụng Lễ Phật từ 22:00 đến 05:00.`

Card 3:

- `title`: `Nếu không có bàn thờ Phật`
- `body`: `Phải thắp Tâm hương trước khi tụng.`

Card 4:

- `title`: `Lưu ý cho phụ nữ mang thai / ở cữ`
- `body`: `Tổng số Lễ Phật trong ngày đặc biệt không nên vượt quá 7 biến.`

