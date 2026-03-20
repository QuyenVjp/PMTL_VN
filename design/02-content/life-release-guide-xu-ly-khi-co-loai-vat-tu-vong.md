# Phóng Sanh — Xử Lý Khi Có Loài Vật Tử Vong

> Canonical guide cho route `/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong`.
> Đây là guide nhạy cảm, bắt buộc giữ `sourceReference` và `reviewNote`.

---

## 1. Mục đích

- chốt quy tắc xử lý khi trong lúc phóng sanh có loài vật tử vong
- tách riêng trường hợp này để FE có thể hiển thị khẩn cấp, rõ, ngắn
- tránh bury species-specific counts trong bài dài

---

## 2. Source posture

- `primary_source_ref`: `design/02-content/practice-support-reference.md#5-nghi-thức-phóng-sinh`
- `supporting_source_ref`: `design/02-content/life-release-content-inventory.md#8-xử-lý-khi-có-loài-vật-tử-vong`
- `needs_editorial_care`: `true`

### Review note

- bất kỳ chỉnh sửa số biến nào đều phải có review note mới
- FE phải hiển thị matrix count rõ ràng, không nhét lẫn vào paragraph

---

## 3. Canonical guidance

- nếu trong lúc phóng sanh có loài vật tử vong, cần tụng `Chú Vãng Sanh`
- số biến theo loài như sau:

| Loài | Số biến `Chú Vãng Sanh` |
|---|---:|
| `tôm` | `3` |
| `cua` | `7` |
| `cá` | `7` |

---

## 4. UI rendering intent

### Public page

- phần này nên là `emergency quick guide`
- hero phải ngắn
- matrix count phải nằm ngay trên màn hình đầu

### Member companion

- khi user chọn `có loài vật tử vong`, companion panel phải bật section này lên đầu
- có thể cho bấm nhanh từng loài để xem count

### Admin

- bắt buộc có `reviewNote`
- không được publish nếu matrix count thiếu một trong các loài canonical đã chốt

---

## 5. Warning list

- đây là flow xử lý phát sinh, không thay thế cho nghi thức cơ bản
- không xóa hoặc rút gọn species matrix thành một con số chung
- nếu sau này có thêm loài mới, phải review cùng source chứ không append tùy ý

---

## 6. Typed blocks đề xuất

- `hero_intro`
- `species_count_matrix`
- `warning_list`
- `cross_link_panel`

---

## 7. Cross-links

- `/huong-dan/phong-sanh/nghi-thuc-co-ban`
- `/huong-dan/phong-sanh/luu-y-va-chuan-bi`
- `/phong-sanh/ghi-lai`
