# Phóng Sanh — Lưu Ý Và Chuẩn Bị

> Canonical guide cho route `/huong-dan/phong-sanh/luu-y-va-chuan-bi`.
> File này gom checklist, guardrails, và ethical warnings để FE có thể render thành checklist-first experience.

---

## 1. Mục đích

- gom các lưu ý rải rác thành một bài checklist rõ ràng
- đặt warning đạo đức lên sớm, không bury ở cuối bài
- giúp user chuẩn bị đúng trước khi đi và giảm lỗi trong lúc thực hành

---

## 2. Checklist trước khi đi

- xác định rõ:
  - phóng sanh cho bản thân
  - hay hồi hướng cho người khác
- chuẩn bị số lượng hoặc tổng trọng lượng dự kiến
- chọn nơi phóng sanh phù hợp với loài vật
- tránh tiếp tay trực tiếp cho hành vi săn bắt, gom hàng vì nhu cầu phóng sanh
- nếu cần mẫu khấn, lưu sẵn printable card hoặc mở companion guide

---

## 3. Checklist trên đường đi

- có thể bắt đầu niệm `Chú Đại Bi`
- nếu dùng lời nguyện ngắn trên đường, phải xưng danh rõ

### Script block

`Nguyện Đại Từ Đại Bi Quán Thế Âm Bồ Tát gia hộ và ban phước cho con, <họ tên đầy đủ>, giúp con tiêu trừ tai ương, tăng trưởng thọ mạng. Con nguyện tiếp tục tinh tấn tu hành, hành thiện tích đức.`

### Variant cho người khác

`Nguyện Đại Từ Đại Bi Quán Thế Âm Bồ Tát gia hộ và ban phước cho <họ tên đầy đủ của người đó>, giúp <họ tên đầy đủ của người đó> tiêu trừ tai ương, tăng trưởng thọ mạng. Nay <họ tên đầy đủ của người đó> phóng sinh <số lượng hoặc tổng trọng lượng> các loài thủy tộc như cá, tôm…`

---

## 4. Checklist tại địa điểm

- cảm ân và cung thỉnh trước khi vào phần khấn chính
- tụng đủ các bài niệm cơ bản
- đọc đúng variant phù hợp
- thả loài vật nhẹ nhàng, giảm thiểu tổn hại
- nếu xảy ra tử vong, chuyển ngay sang guide xử lý riêng

---

## 5. Chant matrix tại địa điểm

| Bài niệm | Số biến |
|---|---:|
| `Chú Đại Bi` | `1` |
| `Tâm Kinh` | `1` |
| `Thất Phật Diệt Tội Chân Ngôn` | `7` |

### Gợi ý thêm

- theo nguồn thực hành, `Chú Đại Bi`, `Tâm Kinh`, và `Chú Vãng Sanh` có thể tụng thêm tùy điều kiện; số biến nhiều hơn được xem là tốt hơn nếu vẫn giữ đúng chất lượng

---

## 6. Warning list

- không biến nghi thức thành thao tác vội vàng để “hoàn thành cho xong”
- không làm đau hoặc ném mạnh loài vật khi thả
- không để guide chỉ là bài viết dài; các warning phải hiện trước khi user bấm `Bắt đầu nghi thức`
- nếu đang ở bối cảnh thay người khác, đừng dùng nhầm variant cho bản thân

---

## 7. UI rendering intent

### Public page

- render dạng `checklist + warning + quick links`
- có nút `Tôi đang đi phóng sanh cho bản thân`
- có nút `Tôi đang đi phóng sanh cho người khác`

### Member companion

- có chế độ `before-you-go`
- cho phép tick `đã chuẩn bị`

### Admin

- warnings và checklist phải là block riêng
- không được publish nếu bài chỉ còn rich-text dài mà thiếu checklist có cấu trúc

---

## 8. Typed blocks đề xuất

- `required_items`
- `checklist_card`
- `chant_count_matrix`
- `warning_list`
- `ritual_variant_link_grid`

---

## 9. Cross-links

- `/huong-dan/phong-sanh/nghi-thuc-co-ban`
- `/huong-dan/phong-sanh/cho-ban-than`
- `/huong-dan/phong-sanh/cho-nguoi-khac`
- `/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong`
