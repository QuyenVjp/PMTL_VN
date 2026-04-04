# Kinh Văn Tự Tu — Daily Recitation System

> **Nguồn:** Kho tài liệu Pháp Môn Tâm Linh
> **Trạng thái:** Verified source — human review required before automating enforcement
> **Cập nhật:** 2026-04-04

---

## 1. System Overview

**Kinh văn bài tập hàng ngày (Daily Recitation)** được ví như việc ăn uống hàng ngày để nạp năng lượng hộ thân, hoặc như kiếm thu nhập để chi trả sinh hoạt phí.

### Phân biệt cốt lõi

| Loại | Mô tả | Ghi chú tách biệt |
|------|-------|-------------------|
| Kinh bài tập hàng ngày | Đọc hàng ngày để nạp công lực | **KHÔNG** tính gộp vào Tiểu Phương Tử |
| Tiểu Phương Tử | Đọc để trả nợ nghiệp | Ghi nhận riêng |

---

## 2. Database Schema — Sutra Catalog

### 2.1 Nhóm Kinh Lớn (Foundation Sutras)
Bắt buộc trong mọi thời khóa hàng ngày.

#### Chú Đại Bi (Great Compassion Mantra)
- **Tác dụng:** Tăng công lực, chữa bệnh, cầu nguyện thành tựu
- **Liều lượng:**
  - Người thường: 3–7 biến
  - Người bệnh nặng / trước phẫu thuật: 21–49 biến
- **Lời khấn chuẩn:** "Xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát bảo vệ và ban phước cho con [Tên], ban cho con sức khỏe và tăng cường công lực"
- **Quy tắc:** Luôn đọc **đầu tiên** trong ngày. Đọc được mọi thời điểm ngày/đêm.

#### Tâm Kinh (Heart Sutra)
- **Tác dụng:** Mở trí tuệ, bình ổn cảm xúc, hóa giải phiền não
- **Liều lượng:** 3–7 biến
- **Lời khấn chuẩn:** "Xin Đại Từ Đại Bi Quán Thế Âm Bồ Tát bảo vệ và ban phước cho con [Tên], ban cho con trí tuệ, sự bình tĩnh, tâm thanh tịnh và xua tan phiền não"
- **Cảnh báo ⚠️:** **Cấm đọc sau 22:00**. Cấm đọc khi trời mưa bão, sấm chớp, mây đen.

#### Lễ Phật Đại Sám Hối Văn (88 Buddhas Great Repentance)
- **Tác dụng:** Sám hối lỗi lầm quá khứ/hiện tại, tiêu trừ nghiệp chướng
- **Liều lượng:**
  - Người thường: 1–3 biến
  - Bệnh nặng: tối đa 5–7 biến (vượt quá sẽ kích hoạt nghiệp)
- **Lời khấn chuẩn:** "Xin Đại Từ Đại Bi... giúp con [Tên] sám hối và tiêu trừ nghiệp chướng (trên thân / bộ phận cơ thể), ban cho con sức khỏe và trí tuệ"
- **Cảnh báo ⚠️:** **Cấm đọc từ 22:00 đến 5:00**. Nếu đau nhức khi đọc → đốt ngay 4–7 Tiểu Phương Tử.

---

### 2.2 Nhóm Thập Tiểu Chú (Ten Short Mantras)
Thường set mặc định 21, 27, hoặc 49 biến.

| Tên | Tác dụng | Quy tắc đặc biệt |
|-----|---------|-----------------|
| Vãng Sinh Chú | Cầu vãng sinh, siêu độ côn trùng/động vật nhỏ | Cấm sau 22:00, cấm khi mưa bão |
| Giải Kết Chú | Hóa giải mâu thuẫn gia đình, đồng nghiệp | Nhập tên đối phương khi khấn |
| Tiêu Tai Cát Tường Thần Chú | Hóa giải rắc rối, kiện tụng, xui xẻo | — |
| Chuẩn Đề Thần Chú | Cầu thành công công việc, thi cử, hôn nhân | — |
| Công Đức Bảo Sơn Thần Chú | Chuyển thiện thành công đức (đọc được cho thai nhi) | — |
| Thất Phật Diệt Tội Chân Ngôn | Tiêu trừ nghiệp chướng nhỏ mới phát sinh | Dùng trong bước Bổ Khuyết |
| Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni | Kéo dài tuổi thọ | Ưu tiên profile Người cao tuổi |
| Như Ý Bảo Luân Vương Đà La Ni | Cầu thành công, nhận ánh sáng Phật | — |
| Đại Cát Tường Thiên Nữ Chú | Cầu thoát nghèo, may mắn tình cảm | — |
| Quán Âm Linh Cảm Chân Ngôn | Cầu nguyện linh ứng nhanh | Yêu cầu tâm cực tịnh |

---

## 3. User Workflow — 7 Steps

Hệ thống Web/App phải hướng dẫn người dùng theo đúng 7 bước sau mỗi ngày:

1. **Khởi động:** Niệm Tịnh Khẩu Nghiệp Chân Ngôn (7 biến)
2. **Kết nối:** Thắp hương trước Phật đài — hoặc "Thắp Tâm Hương" (quán tưởng)
3. **Thỉnh an:** Đọc 3 lần cảm tạ Quán Thế Âm Bồ Tát
4. **Tụng kinh chính:** Chú Đại Bi luôn đọc đầu tiên → các kinh sau không cần thứ tự cố định → mỗi kinh: Đọc Lời Khấn → Đọc Tên Đầy Đủ → Đọc Nội Dung
5. **Bổ khuyết:** Niệm Bổ Khuyết Chân Ngôn (3–7 biến) để bù đắp sai sót
6. **Thanh lọc:** Niệm Thất Phật Diệt Tội Chân Ngôn (3 biến)
7. **Hoàn mãn:** Cảm tạ Bồ Tát đã gia hộ

---

## 4. Business Rules (Validation Rules)

### Rule 1 — Khung giờ cấm tuyệt đối
Block từ **2:00 AM đến 5:00 AM** — không cho đánh dấu hoàn thành bất kỳ kinh nào.

### Rule 2 — Giờ & thời tiết kinh Âm
| Kinh | Điều kiện cảnh báo |
|------|--------------------|
| Tâm Kinh | Sau 22:00 hoặc mưa bão / sấm chớp |
| Vãng Sinh Chú | Sau 22:00 hoặc mưa bão |
| Lễ Phật Đại Sám Hối Văn | Sau 22:00 đến 5:00 |

### Rule 3 — Xử lý gián đoạn
- Cung cấp nút **Tạm dừng**
- Khi gián đoạn: đọc "Ông Lai Mu Suo He" 1 lần
- Khi quay lại: đọc lại 1 lần rồi niệm tiếp
- Thần chú ngắn: nhắc user niệm lại từ đầu

### Rule 4 — Giới hạn cầu nguyện
Tối đa **3 lời cầu xin** trước khi làm bài tập. Tham cầu quá nhiều sẽ mất linh nghiệm.

### Rule 5 — Âm lượng
Chỉ đọc nhẩm thành tiếng nhỏ vừa đủ nghe. Không đọc thầm (trệ máu huyết). Không đọc quá to (tổn khí).

---

## 5. Practice Presets

### Profile 1 — Người Mới Bắt Đầu (Beginners)
| Kinh | Số biến |
|------|---------|
| Chú Đại Bi | 7 |
| Tâm Kinh | 7 |
| Lễ Phật Đại Sám Hối Văn | 1–3 |
| Vãng Sinh Chú | 21 hoặc 49 |

### Profile 2 — Người Cao Tuổi (Elders)
| Kinh | Số biến |
|------|---------|
| Chú Đại Bi | 21–49 |
| Tâm Kinh | 7–21 |
| Lễ Phật Đại Sám Hối Văn | ~3 |
| Vãng Sinh Chú | 21 hoặc 49 |
| Thánh Vô Lượng Thọ | 49 |
| A Di Đà Kinh | 3–7 (người trên 60–70 tuổi cầu vãng sinh) |

### Profile 3 — Người Bệnh Nặng / Ung Thư (Severe Illness)
| Kinh | Số biến | Ghi chú |
|------|---------|---------|
| Chú Đại Bi | 21 (giai đoạn bùng phát) → 49 (khi ổn định) | Bắt buộc đọc suốt đời |
| Tâm Kinh | 49 | — |
| Lễ Phật Đại Sám Hối Văn | 3–5 | — |

> **Lưu ý hệ thống:** Profile này yêu cầu cam kết kết hợp đốt Tiểu Phương Tử liên tục (từng đợt 21 hoặc 49 tờ), Phóng sinh số lượng lớn và Phát Đại Nguyện.

### Profile 4 — Người Trầm Cảm / Tâm Thần (Mental Illness)
| Kinh | Số biến |
|------|---------|
| Chú Đại Bi | Không vượt quá 21 |
| Tâm Kinh | 21–49 |

---

## 6. Admin Module Ownership

- Kinh văn catalog (danh sách kinh, tác dụng, liều lượng, lời khấn): **Niệm Kinh module**
- Practice presets: **Niệm Kinh module**
- Business rules (time/weather enforcement): **Niệm Kinh / Chanting Environment module**
- User practice logs: **Practice Core module** (không phải tài liệu admin)
- Tiểu Phương Tử counter: **Separate** — tuyệt đối không tính gộp

## 7. References

- Chanting environment rules: `apps/api/src/modules/content/chanting/`
- Self-cultivation workspace: `apps/admin/src/features/self-cultivation/`
- Niem Kinh admin workspace: `apps/admin/src/routes/noi-dung/niem-kinh/`
