# Phóng Sanh — Nghi Thức Cơ Bản

> Canonical guide cho route `/huong-dan/phong-sanh/nghi-thuc-co-ban`.
> File này là truth content cho FE public, admin editorial review, printable companion, và member companion panel.

---

## 1. Mục đích

- gom đúng trình tự nghi thức phóng sanh cơ bản thành một bài có thể render theo `step_sequence`
- tách phần `nghi thức chung` khỏi các biến thể `cho bản thân` và `cho người khác`
- giữ wording đủ chuẩn để admin không phải ráp lại từ nhiều nguồn rời rạc

---

## 2. Source posture

- `primary_source_ref`: `design/02-content/practice-support-reference.md#5-nghi-thức-phóng-sinh`
- `supporting_source_ref`: `design/02-content/chant-items-catalog.md#10-mẫu-khấn-phóng-sinh`
- `review_state`: `canonicalized_from_source`
- `needs_editorial_care`: `true`

### Review note

- FE được phép chia bài thành stepper, checklist, card cầu nguyện, printable card.
- FE không được đổi nghĩa lời khấn, đổi số biến, hoặc gộp bước theo kiểu làm mất ritual order.

---

## 3. Khi nào dùng guide này

- khi người dùng cần xem toàn bộ nghi thức phóng sanh cơ bản từ lúc đến nơi đến lúc hoàn tất
- khi member mở journal nhưng chưa nhớ đủ trình tự
- khi admin cần đối chiếu xem biến thể nào kế thừa từ nghi thức gốc

---

## 4. Tóm tắt nhanh

Nghi thức cơ bản gồm 7 phần:

1. đến nơi phù hợp và chuẩn bị cung thỉnh
2. cảm ân, cung thỉnh Quán Thế Âm Bồ Tát
3. đọc lời khấn chính
4. tụng các bài niệm cơ bản
5. khấn lại trước khi thả
6. thả nhẹ nhàng, giảm tổn hại
7. cảm ân kết thúc

---

## 5. Step sequence canonical

### Bước 1. Đến nơi phóng sanh và chuẩn bị cung thỉnh

- đến nơi phóng sanh, tìm chỗ phù hợp để dâng hương hoặc cung thỉnh
- nếu có thắp hương, dùng đèn dầu hoặc cách phù hợp theo điều kiện thực tế
- hai tay chắp lại, nâng hương lên ngang giữa hai chân mày
- trong tâm thầm niệm lời nguyện cảm ân

### Script card ngắn

`<họ tên đầy đủ> con xin đảnh lễ, vấn an Đại Từ Đại Bi Quán Thế Âm Bồ Tát.`

### Bước 2. Cung thỉnh

- hướng mặt lên trời
- niệm `3` lần:

`Chí tâm cung thỉnh Đại Từ Đại Bi Quán Thế Âm Bồ Tát.`

### Bước 3. Lời khấn chính

- tiếp tục niệm:
  - `Chí tâm cung thỉnh Đại Từ Đại Bi Quán Thế Âm Bồ Tát` `3` lần
  - lạy `3` lạy
- sau đó đọc lời khấn chính

### Script block

`Đệ tử <họ tên đầy đủ> nay thành tâm đảnh lễ Đại Từ Đại Bi Quán Thế Âm Bồ Tát cùng chư Phật. Nay <họ tên đầy đủ> con phóng sinh <số lượng hoặc tổng trọng lượng> các loài thủy tộc như cá, tôm… Nguyện Đại Từ Đại Bi Quán Thế Âm Bồ Tát gia hộ và ban phước cho con <họ tên đầy đủ>, giúp con tiêu trừ tai ương, tăng trưởng thọ mạng. Con nguyện tiếp tục tinh tấn tu hành, hành thiện tích đức.`

- lạy `3` lạy

### Bước 4. Tụng các bài niệm cơ bản

Tụng theo thứ tự chuẩn:

| Bài niệm | Số biến |
|---|---:|
| `Chú Đại Bi` | `1` |
| `Tâm Kinh` | `1` |
| `Thất Phật Diệt Tội Chân Ngôn` | `7` |

### Bước 5. Khấn lại trước khi thả

- trước khi thả chúng sinh xuống nước, đọc lại lời cầu nguyện ngắn một lần nữa

### Script block

`<họ tên đầy đủ> con đang phóng sinh <số lượng hoặc tổng trọng lượng> các loài thủy tộc như cá, tôm… Nguyện Đại Từ Đại Bi Quán Thế Âm Bồ Tát gia hộ và ban phước cho con <họ tên đầy đủ>, giúp con tiêu trừ tai ương, tăng trưởng thọ mạng.`

### Bước 6. Thả chúng sinh xuống nước

- thả nhẹ nhàng, tránh làm tổn hại thêm
- quan sát thực tế địa điểm, dòng nước, và tình trạng loài vật
- không thao tác vội vàng hoặc ném mạnh

### Bước 7. Cảm ân kết thúc

- hoàn tất xong thì cảm ân Quán Thế Âm Bồ Tát
- nếu cần, FE có thể render một `closing-card` ngắn thay vì thêm một đoạn dài mới

---

## 6. Ritual guardrails

- không được biến guide này thành bài giải thích lan man; phải ưu tiên `step-by-step`
- các placeholder phải luôn hiển thị rõ ràng:
  - `<họ tên đầy đủ>`
  - `<số lượng hoặc tổng trọng lượng>`
- nếu user chưa chắc đang phóng sanh cho bản thân hay cho người khác, phải đẩy sang variant chooser
- step `xử lý loài vật tử vong` không nhét dài trong bài này; chỉ link sang guide riêng

---

## 7. UI rendering intent

### Public FE

- hero ngắn
- progress stepper `7 bước`
- card riêng cho `lời khấn chính`
- matrix riêng cho `3 bài niệm`
- sticky CTA:
  - `Chọn mẫu cho bản thân`
  - `Chọn mẫu cho người khác`
  - `Mở sổ tay phóng sanh`

### Member companion

- render dạng `companion panel`
- có nút `đánh dấu đã đọc`
- có thể truyền `guideContextRef=life_release_basic_ritual_v1`

### Admin

- block editor không cho merge `script_block` vào `warning_list`
- mọi sửa đổi số biến phải có `reviewNote`

---

## 8. Typed blocks đề xuất

- `hero_intro`
- `step_sequence`
- `script_block`
- `chant_count_matrix`
- `warning_list`
- `cross_link_panel`

---

## 9. Canonical cross-links

- `/huong-dan/phong-sanh/cho-ban-than`
- `/huong-dan/phong-sanh/cho-nguoi-khac`
- `/huong-dan/phong-sanh/luu-y-va-chuan-bi`
- `/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong`
- `/phong-sanh/ghi-lai`
