# Chanting Environment Rules

> File này là source-of-truth tập trung cho các rule:
>
> - thời gian niệm kinh
> - địa điểm / môi trường
> - ăn uống / vệ sinh / thân thể
> - nơi đặc biệt và case cần cẩn trọng
> - những gì chỉ nên coi là `caution`, không được product hóa thành tool phán đoán
>
> Nó dùng cho:
>
> - `Kinh Bài Tập Hằng Ngày`
> - `Ngôi Nhà Nhỏ`
> - `Kinh Văn Tự Tu`
> - `chanting support surface /niem-kinh`
>
> Không dùng file này để giữ self-state của user.

---

## 1. Mục tiêu

Gom các rule môi trường khi niệm kinh về một chỗ duy nhất để:

- web không copy wording rải rác
- admin không phải sửa cùng một note ở nhiều nơi
- tracker có thể load đúng warning/context theo case
- AI scaffold code không tự bịa logic từ component demo

---

## 2. Owner boundary

### Content owns

- canonical wording cho rule
- phân loại rule theo nhóm
- sourceReference / versionNote cho rule nhạy cảm
- warning cards / caution notes / environment checklist copy

### Engagement does not own

- rule text chuẩn
- interpretation engine cho ánh sáng / giấc mơ / hiện tượng
- logic “đúng pháp” cuối cùng

Engagement chỉ được giữ:

- user đã đọc warning nào
- context đang thực hành loại nào
- `last_guidance_acknowledged_at`

---

## 3. Canonical buckets

Toàn bộ rule phải được gom vào 6 bucket:

1. `time_rules`
2. `place_rules`
3. `food_body_rules`
4. `posture_hygiene_rules`
5. `special_location_cautions`
6. `non_interpretive_cautions`

Không được để web chỉ render một blob FAQ dài không phân nhóm.

---

## 4. Canonical rule groups

## 4.1. Time rules

Nội dung canonical nên có:

- ban ngày là tốt nhất
- các bài nhạy cảm như `Tâm Kinh`, `Chú Vãng Sanh`, `Lễ Phật Đại Sám Hối Văn` phải có guardrail giờ giấc mạnh hơn
- cố gắng hoàn thành các bài nhạy cảm trước `10 giờ tối`
- `2 giờ sáng -> 5 giờ sáng` là vùng tránh niệm
- nếu trời mưa bão / sấm sét / thời tiết âm u quá mạnh:
  - không đẩy user vào lane các bài nhạy cảm
  - ưu tiên lane an toàn như `Chú Đại Bi` nếu source-backed
- nếu tối muộn niệm mà cảm thấy khó chịu:
  - guidance phải cho phép dừng lại

### Product rule

- không làm timer “ép” user niệm
- chỉ làm advisory / warning / suggested safe lane

## 4.2. Place rules

Nội dung canonical nên có:

- không niệm ở nhà vệ sinh, phòng tắm, nơi ô uế, nơi trường khí xấu
- nơi công cộng có thể niệm thầm nếu điều kiện phù hợp
- nếu nơi đang đi qua có khí trường xấu:
  - chỉ nên hiện lane an toàn
- phòng ngủ vợ chồng là case cần caution riêng
- nằm trên giường / ngồi trên giường là case posture-sensitive, không product hóa kiểu black-and-white nếu source chưa chốt tuyệt đối

### Product rule

- `place_rules` dùng cho:
  - guide page
  - focus mode
  - contextual warning drawer
- không dùng để tự động “phán phạm lỗi”

## 4.3. Food / body rules

Nội dung canonical nên có:

- không niệm khi đang ăn món mặn
- ăn chay thì có thể niệm
- ngũ vị tân là caution group riêng
- nếu đã ăn thứ ảnh hưởng:
  - helper text về súc miệng / bước chuẩn bị lại
- phụ nữ mang thai / trong kỳ kinh nguyệt:
  - vẫn có thể niệm, nhưng nếu mệt thì cho phép tạm dừng
- khi bế trẻ nhỏ:
  - có caution riêng, đặc biệt khi bé đang ngủ

### Product rule

- tuyệt đối không làm health/medical engine
- chỉ làm environment/body-state guidance

## 4.4. Posture / hygiene rules

Nội dung canonical nên có:

- tay không sạch, tư thế không trang nghiêm, đung đưa mạnh, vắt chân là caution
- nếu chưa đánh răng buổi sáng thì không khuyến khích niệm ra tiếng
- ăn mặc nên chỉnh tề
- có guideline về ánh sáng môi trường buổi tối

### Product rule

- đây là `quality guidance`, không phải punitive UX
- UI nên dùng checklist mềm, không dùng modal hù dọa

## 4.5. Special location cautions

Nội dung canonical nên có:

- khi lái xe
- xe bus / tàu điện / đường đi làm
- bệnh viện
- nghĩa trang
- đài tưởng niệm
- lò mổ
- nhà hàng / khách sạn
- ban công
- dưới gốc cây to
- máy bay

Mỗi location card nên có:

- `riskSummary`
- `safeLane` gợi ý
- `avoidItems[]`
- `shortReason`

### Product rule

- không cấm bằng hard block trừ khi source chốt rất rõ
- ưu tiên gợi ý “nếu niệm thì niệm gì an toàn hơn”

## 4.6. Non-interpretive cautions

Nội dung canonical nên có:

- ánh sáng vàng / xanh
- tê dại / đau đầu
- hiện tượng tro / ngọn lửa
- giấc mơ và con số

Các mục này phải được đánh dấu:

- `reference-only`
- `do-not-automate`
- `do-not-turn-into-calculator`

### Product rule

- không làm calculator giấc mơ
- không làm machine interpretation cho dấu hiệu / ánh sáng / tro lửa
- chỉ có `caution note` + CTA quay về guide nền tảng hoặc FAQ

---

## 5. Route / API model

### Public routes

- `/niem-kinh/luu-y-moi-truong-va-thoi-gian`
- các surface khác chỉ trích / deep-link / nhúng snippet từ source này

### Public API

- `GET /api/content/chanting/environment-rules`
- `GET /api/content/chanting/environment-rules/:groupKey`

`groupKey` hỗ trợ:

- `time-rules`
- `place-rules`
- `food-body-rules`
- `posture-hygiene-rules`
- `special-location-cautions`
- `non-interpretive-cautions`

### Admin

Wave đầu chưa cần workspace admin riêng.

Quản lý qua workspace `Nội dung / Niệm kinh` hoặc content editor owner phù hợp, nhưng bắt buộc:

- sourceReference
- versionNote
- groupKey
- severity
- safeLane refs

---

## 6. UI model

## 6.1. Public guide page

Trang `/niem-kinh/luu-y-moi-truong-va-thoi-gian` nên có:

- intro ngắn
- 6 section lớn theo buckets
- `Đọc nhanh`
- `Checklist môi trường`
- `Địa điểm đặc biệt`
- `Những gì không nên tự suy diễn`

## 6.2. Reusable cards

Các surface khác được phép tái dùng:

- `time warning card`
- `environment checklist`
- `special location caution`
- `safe lane suggestion`
- `reference-only caution note`

## 6.3. Tracker integration

Tracker của `Kinh Bài Tập` hoặc `Ngôi Nhà Nhỏ` chỉ nên dùng:

- environment checklist
- context warning drawer
- preflight guardrail
- ready-to-burn advisor

Không nhét full long-form article vào tracker screen.

---

## 7. Surface mapping

## 7.1. Daily practice

`Kinh Bài Tập` là consumer lớn nhất của doc này:

- `/kinh-bai-tap/luu-y/thoi-gian-va-dia-diem`
- `/kinh-bai-tap/luu-y/cach-niem-dung`
- `/kinh-bai-tap/luu-y/cau-hoi-thuong-gap`

## 7.2. Little House

Chỉ dùng subset phù hợp:

- environment checklist
- quality-focus guidance
- bệnh viện / trường khí kém
- non-interpretive caution cho tro / ngọn lửa

## 7.3. Self-cultivation

Chỉ dùng subset phù hợp:

- giờ giấc của các bài nhạy cảm
- môi trường cơ bản
- body-state / food cautions khi cần

---

## 8. Non-negotiables

- Không để rule môi trường chỉ nằm trong component demo.
- Không để AI/codegen phải nhặt rule từ FAQ rời.
- Không biến caution content thành máy phán đoán tâm linh.
- Khi rule ảnh hưởng wording nhạy cảm, phải có `sourceReference` và `versionNote`.
