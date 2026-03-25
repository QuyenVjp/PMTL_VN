# Phóng Sanh — Content Inventory

> File này là inventory canonical cho feature `Phóng Sanh`.
> Nó gom phần nghi thức, biến thể, warning, FAQ và download companion thành content model dùng được cho PMTL_VN.

---

## 1. Mapping nguồn thực tế -> route inventory

| Nguồn / pattern | Route PMTL đề xuất | Priority | Canonical doc |
|---|---|---|
| Nghi thức phóng sanh cơ bản | `/huong-dan/phong-sanh/nghi-thuc-co-ban` | P0 | `life-release-guide-nghi-thuc-co-ban.md` |
| Mẫu khấn cho bản thân | `/huong-dan/phong-sanh/cho-ban-than` | P0 | `life-release-guide-cho-ban-than.md` |
| Mẫu khấn cho người khác | `/huong-dan/phong-sanh/cho-nguoi-khac` | P0 | `life-release-guide-cho-nguoi-khac.md` |
| Lưu ý và checklist chuẩn bị | `/huong-dan/phong-sanh/luu-y-va-chuan-bi` | P0 | `life-release-guide-luu-y-va-chuan-bi.md` |
| Xử lý khi có loài vật tử vong | `/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong` | P0 | `life-release-guide-xu-ly-khi-co-loai-vat-tu-vong.md` |
| FAQ / hỏi đáp | `/huong-dan/phong-sanh/hoi-dap` | P1 | `life-release-guide-hoi-dap.md` |
| PDF / checklist in ra | download panel trong hub/detail pages | P1 | derived from canonical guides |

---

## 2. IA đề xuất

```text
/huong-dan/phong-sanh
├─ /nghi-thuc-co-ban
├─ /cho-ban-than
├─ /cho-nguoi-khac
├─ /luu-y-va-chuan-bi
├─ /xu-ly-khi-co-loai-vat-tu-vong
└─ /hoi-dap
```

---

## 3. Hub page (`/huong-dan/phong-sanh`)

### Nội dung bắt buộc

- `Phóng sanh là gì`
- khi nào nên mở guide này
- quick chooser theo nhu cầu
- lưu ý đạo đức ngắn:
  - không tiếp tay săn bắt
  - chọn nơi phù hợp
  - thao tác nhẹ nhàng
- CTA sang `/phong-sanh/ghi-lai`

### Block types

- `hero_intro`
- `quick_summary`
- `variant_selector`
- `warning_list`
- `download_panel`
- `source_reference`

---

## 4. Nghi thức cơ bản (`/huong-dan/phong-sanh/nghi-thuc-co-ban`)

### Step sequence canonical

1. Đến nơi phù hợp, tìm chỗ có thể dâng hương / cung thỉnh
2. Cảm ân và cung thỉnh
3. Khấn chính
4. Tụng:
   - `Chú Đại Bi` `1`
   - `Tâm Kinh` `1`
   - `Thất Phật Diệt Tội Chân Ngôn` `7`
5. Trước khi thả, khấn lại ngắn gọn
6. Thả xuống nước nhẹ nhàng
7. Cảm ân kết thúc

### Block types

- `step_sequence`
- `script_block`
- `chant_count_matrix`
- `warning_list`

---

## 5. Variant: Cho bản thân (`/huong-dan/phong-sanh/cho-ban-than`)

### Nội dung bắt buộc

- mẫu khấn cho chính mình
- placeholder tên đầy đủ
- placeholder số lượng hoặc tổng trọng lượng
- mục tiêu thường thấy:
  - tiêu trừ tai ương
  - tăng trưởng thọ mạng

### Ritual variant data

| Field | Value |
|---|---|
| `variantKey` | `for_self` |
| `subjectPattern` | `con` |
| `requiredPlaceholders` | `fullName`, `quantityOrWeight` |
| `companionTarget` | `/phong-sanh/ghi-lai?variant=for_self` |

---

## 6. Variant: Cho người khác (`/huong-dan/phong-sanh/cho-nguoi-khac`)

### Nội dung bắt buộc

- mẫu khấn thay người khác
- placeholder tên người được hồi hướng
- note khi có thể dùng tiền của đối phương
- guardrail tránh lẫn lộn giữa `người thực hiện` và `người được hồi hướng`

### Ritual variant data

| Field | Value |
|---|---|
| `variantKey` | `for_other_person` |
| `requiredPlaceholders` | `targetFullName`, `quantityOrWeight` |
| `warning` | phải hiển thị rõ chủ thể được hồi hướng |
| `companionTarget` | `/phong-sanh/ghi-lai?variant=for_other_person` |

---

## 7. Lưu ý và chuẩn bị (`/huong-dan/phong-sanh/luu-y-va-chuan-bi`)

### Checklist trước khi đi

- chọn nơi phù hợp
- tránh tiếp tay việc săn bắt
- chuẩn bị số lượng / đối tượng cần phóng sanh
- xác định rõ phóng sanh cho mình hay cho người khác

### Checklist trên đường đi

- có thể bắt đầu niệm `Chú Đại Bi`
- nếu dùng mẫu nguyện ngắn trên đường thì phải xưng danh rõ

### Checklist tại địa điểm

- cảm ân / cung thỉnh
- niệm đủ các biến cơ bản
- đọc đúng mẫu khấn
- thả nhẹ nhàng, giảm thiểu tổn hại

### Block types

- `required_items`
- `checklist_card`
- `warning_list`
- `do_dont_grid`

---

## 8. Xử lý khi có loài vật tử vong (`/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong`)

### Nội dung canonical

- cần tụng `Chú Vãng Sanh`
- count theo loài:

| Loài | Số biến |
|---|---|
| `tôm` | `3` |
| `cua` | `7` |
| `cá` | `7` |

### Block types

- `species_count_matrix`
- `warning_list`
- `faq_block`

### Review note

- Đây là content nhạy cảm, bắt buộc giữ `sourceReference` và `reviewNote`.

---

## 9. FAQ (`/huong-dan/phong-sanh/hoi-dap`)

### FAQ seed

- có thể bắt đầu niệm trên đường đi không
- phóng sanh thay người khác thì khấn thế nào
- nếu có loài vật chết thì phải làm gì
- có bắt buộc đọc đủ đúng số biến không
- có thể vừa xem guide vừa ghi journal không

---

## 10. Download panel

### Download entries

| File key | Purpose |
|---|---|
| `nghi-thuc-phong-sanh-pmtl.pdf` | bản PDF nghi thức chuẩn |
| `checklist-phong-sanh-printable.pdf` | checklist in ra mang theo |
| `mau-khan-phong-sanh-card.pdf` | card mẫu khấn ngắn |

---

## 11. Typed block requirements

Mọi bài `phóng sanh` nên ưu tiên các block sau:

- `step_sequence`
- `script_block`
- `ritual_variant`
- `chant_count_matrix`
- `required_items`
- `warning_list`
- `faq_block`
- `download_panel`

Không nên chỉ nhét raw rich-text.

---

## 12. Product rules

- không bury variant `cho người khác` trong một bài dài
- species-specific counts phải có matrix riêng
- journal không lưu full script; chỉ giữ refs
- warning đạo đức phải đứng sớm, không để cuối bài
- P0 guides phải có file canonical riêng; admin/editor không publish chỉ dựa vào inventory này
