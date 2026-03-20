# Phóng Sanh — Mẫu Khấn Cho Bản Thân

> Canonical guide cho route `/huong-dan/phong-sanh/cho-ban-than`.
> File này định nghĩa variant `for_self`.

---

## 1. Mục đích

- chốt lời khấn và placeholder cho trường hợp phóng sanh hồi hướng cho chính mình
- đảm bảo FE, admin, và journal dùng cùng một variant key
- tránh lẫn lộn giữa `người thực hiện` và `người được hồi hướng`

---

## 2. Variant definition

| Field | Value |
|---|---|
| `variantKey` | `for_self` |
| `recipientMode` | `self` |
| `requiredPlaceholders` | `fullName`, `quantityOrWeight` |
| `companionTarget` | `/phong-sanh/ghi-lai?variant=for_self` |
| `guideContextRef` | `life_release_for_self_v1` |

---

## 3. Khi nào dùng

- khi người thực hiện phóng sanh và hồi hướng trực tiếp cho bản thân
- khi CTA từ hub là `Tôi đang phóng sanh cho chính mình`
- khi journal tạo entry với `ritualVariantRef=for_self`

---

## 4. Mẫu khấn chính

### Script block

`Đệ tử <họ tên đầy đủ> nay thành tâm đảnh lễ Đại Từ Đại Bi Quán Thế Âm Bồ Tát cùng chư Phật. Nay <họ tên đầy đủ> con phóng sinh <số lượng hoặc tổng trọng lượng> các loài thủy tộc như cá, tôm… Nguyện Đại Từ Đại Bi Quán Thế Âm Bồ Tát gia hộ và ban phước cho con <họ tên đầy đủ>, giúp con tiêu trừ tai ương, tăng trưởng thọ mạng. Con nguyện tiếp tục tinh tấn tu hành, hành thiện tích đức.`

---

## 5. Mẫu khấn ngắn trước khi thả

### Script block

`<họ tên đầy đủ> con đang phóng sinh <số lượng hoặc tổng trọng lượng> các loài thủy tộc như cá, tôm… Nguyện Đại Từ Đại Bi Quán Thế Âm Bồ Tát gia hộ và ban phước cho con <họ tên đầy đủ>, giúp con tiêu trừ tai ương, tăng trưởng thọ mạng.`

---

## 6. Những điểm FE phải làm rõ

- phải giải thích ngắn rằng:
  - `họ tên đầy đủ` là tên người thực hiện
  - `số lượng hoặc tổng trọng lượng` là dữ liệu thực tế phiên phóng sanh
- nếu user chưa có con số chính xác, cho phép nhập tạm theo tổng trọng lượng hoặc ước lượng có chú thích
- copy trên form không được đổi thành giọng văn đời thường làm lệch nội dung khấn

---

## 7. Hướng dẫn nhập dữ liệu cho member journal

### Trường nên capture

- `performedByFullName`
- `quantityOrWeightText`
- `speciesSummary`
- `locationLabel`
- `guideContextRef`
- `ritualVariantRef=for_self`

### Trường không nên capture

- không ép user ghi lại full script
- không lưu script raw vào journal row

---

## 8. UI rendering intent

### Public page

- hiển thị `script_block` lớn, dễ đọc
- có vùng `Điền nhanh placeholder`
- có card `Bạn đang hồi hướng cho chính mình`

### Member journal companion

- prefill variant `for_self`
- tự kéo vào helper text cho trường `mục đích / ghi chú`

---

## 9. Cross-links

- `/huong-dan/phong-sanh/nghi-thuc-co-ban`
- `/huong-dan/phong-sanh/luu-y-va-chuan-bi`
- `/phong-sanh/ghi-lai?variant=for_self`
