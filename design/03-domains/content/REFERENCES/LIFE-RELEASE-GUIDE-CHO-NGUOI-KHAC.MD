# Phóng Sanh — Mẫu Khấn Cho Người Khác

> Canonical guide cho route `/huong-dan/phong-sanh/cho-nguoi-khac`.
> File này định nghĩa variant `for_other_person`.

---

## 1. Mục đích

- chốt variant dành cho trường hợp phóng sanh hồi hướng cho người khác
- bảo vệ một ranh giới dễ sai nhất: ai là người thực hiện, ai là người được hồi hướng
- cho FE và admin một script chuẩn để không phải suy diễn

---

## 2. Variant definition

| Field | Value |
|---|---|
| `variantKey` | `for_other_person` |
| `recipientMode` | `other_person` |
| `requiredPlaceholders` | `targetFullName`, `quantityOrWeight` |
| `optionalPlaceholders` | `performedByFullName` |
| `companionTarget` | `/phong-sanh/ghi-lai?variant=for_other_person` |
| `guideContextRef` | `life_release_for_other_v1` |

---

## 3. Khi nào dùng

- khi phóng sanh để hồi hướng cho một người khác cụ thể
- khi nghi thức cần nêu rõ tên người nhận hồi hướng
- khi journal tạo entry với `ritualVariantRef=for_other_person`

---

## 4. Mẫu khấn đề xuất

### Script block

`Nguyện Đại Từ Đại Bi Quán Thế Âm Bồ Tát gia hộ và ban phước cho <họ tên đầy đủ của người đó>, giúp <họ tên đầy đủ của người đó> tiêu trừ tai ương, tăng trưởng thọ mạng. Nay <họ tên đầy đủ của người đó> phóng sinh <số lượng hoặc tổng trọng lượng> các loài thủy tộc như cá, tôm…`

---

## 5. Guardrails bắt buộc

- UI phải hiển thị rõ:
  - `người được hồi hướng`
  - `người đang thao tác / ghi nhật ký`
- nếu app cho nhập thêm người thực hiện, phải label tách biệt
- không dùng copy mơ hồ kiểu `tên của bạn` trong variant này
- nếu có note về tài chính hay tiền mua loài vật, để ở `warning_list`, không nhét vào script

---

## 6. Warning card

- trường hợp này dễ nhầm chủ thể nhất
- câu khấn hiển thị trên FE nên có preview thay placeholder sau khi người dùng nhập tên
- admin không được publish variant này nếu thiếu `warning` về chủ thể hồi hướng

---

## 7. Hướng dẫn nhập dữ liệu cho member journal

### Trường nên capture

- `targetFullName`
- `quantityOrWeightText`
- `speciesSummary`
- `performedByFullName` nếu cần
- `guideContextRef`
- `ritualVariantRef=for_other_person`

### Trường không nên capture

- không lưu full script raw
- không biến journal thành trang hướng dẫn dài

---

## 8. UI rendering intent

### Public page

- hiển thị `warning banner` ở trên `script_block`
- có `preview script` sau khi user nhập tên người được hồi hướng
- có link quay lại `nghi thức cơ bản`

### Member journal companion

- prefill variant `for_other_person`
- hiện field `người được hồi hướng` trước field `ghi chú`

---

## 9. Cross-links

- `/huong-dan/phong-sanh/nghi-thuc-co-ban`
- `/huong-dan/phong-sanh/luu-y-va-chuan-bi`
- `/phong-sanh/ghi-lai?variant=for_other_person`
