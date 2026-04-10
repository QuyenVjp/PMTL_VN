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

## 6. Phenomena During Recitation (Hiện Tượng Khi Tụng Kinh)

### Positive Signs (Dấu Hiệu Tốt Lành)

| Hiện tượng | Ý nghĩa | Hành động |
|-----------|---------|----------|
| 🥱 Ngáp | Có Bồ Tát đến gia hộ hoặc sự hiện diện linh thiêng | Tiếp tục niệm, không dừng |
| 😢 Chảy nước mắt | Lòng từ bi thức tỉnh, kết nối với Bồ Tát | Dấu hiệu tốt lành |
| 🔥 Ngứa da đầu | Kinh mạch đang mở | Bình thường, tiếp tục |
| 🌡️ Nóng cả người | Năng lượng lưu thông | Bình thường, tiếp tục |
| 🦶 Ngứa lòng bàn chân | Kích hoạt kinh mạch tích cực | Dấu hiệu tu hành có hiệu |

### Sleepiness (Buồn Ngủ)

| Trường hợp | Ý nghĩa | Hành động |
|-----------|---------|----------|
| Buồn vì mệt thân | Cơ thể thiếu năng lượng | Nên nghỉ ngơi đủ, tu vào lúc khác |
| Buồn khi tụng một kinh cụ thể | Kinh đó nuôi dưỡng hiệu quả tốt | Bình thường, là dấu hiệu tốt |
| Buồn khi tụng Tâm Kinh / Lục Tự Đại Minh | Nên tụng Tâm Kinh vào ban ngày | Đổi lịch tụng, không lo |
| Buồn dai dẳng + sốt / đau đầu | Có linh thể hoặc nhân vật phải trả nợ | Cần đốt Tiểu Phương Tử hỗ trợ |
| Buồn dần tăng lên mà sức khỏe bình thường | Quỷ "ngủ" đang cản trở — phải vượt qua | Kiên định, tiếp tục, không từ bỏ |

### Khác (Normal Responses)

- Ợ, hắt xắc, ngứa, đại tiện → Bình thường, là năng lượng Khí lưu thông
- Không cần lo lắng, tiếp tục niệm

---

## 7. Scripture Storage & Handling (Bảo Quản Kinh Văn)

### Proper Storage (Cách Bảo Quản Đúng)

| Điều kiện | Quy tắc |
|----------|--------|
| Vị trí | ✅ Để trên bàn thờ hoặc tủ sạch sẽ; ❌ KHÔNG bàn phòng vệ sinh, nơi bẩn |
| Tay cầm | ✅ Rửa tay sạch trước khi cầm kinh; ❌ KHÔNG cầm khi tay bẩn/mồ hôi |
| Hướng để | ❌ KHÔNG để úp mặt kinh xuống ("八" hình dáng); ✅ Để ngang hoặc đứng (thế này hình ảnh Bồ Tát sáng tỏ) |
| Vị trí trên người | ❌ KHÔNG để dưới hông; ✅ Để ở tầm ngực trở lên |

### Damaged Scripture Protocol (Kinh Văn Bị Hư Hỏng)

| Tình huống | Hành động |
|-----------|----------|
| Kinh bị ướt / damp | Sấy khô nếu có thể; nếu không → bước tiếp theo |
| Dẻo, ripped, illegible | Cuốn bằng vải đỏ, để 6-12 tháng, tụng 7 lần Sám Hối Văn, giao cho chùa |
| Kinh bị cháy / vô tình hư | Tụng 21 lần Sám Hối Văn, bao bằng vải đỏ, xử lý tôn trọng |
| Sau 1 năm bảo quản | Tụng 7 lần Sám Hối Văn, giao chùa hoặc hóa |

**Cảnh báo:** Nếu sau đó còn cảm thấy tội lỗi / áy náy → tụng thêm 21 lần Sám Hối Văn để xóa ấn ứng nghiệp

---

## 8. Copying & Burning Scriptures (Chép Và Đốt Kinh)

### Copying (Chép Kinh)

| Điều kiện | Kết quả |
|----------|--------|
| Chép đúng cách (tâm tịnh, tâm niệm) | ✅ An toàn, thậm chí có công đức |
| Chép sai lẻ hoặc tâm ác | ❌ Nguy hiểm, kích hoạt nghiệp |
| Chép xong được gì? | Công đức chép = công đức tụng |

**Quy tắc:** Tuyệt đối KHÔNG đốt kinh đã chép. Nếu dùng xong → bao bằng vải đỏ, bảo quản hoặc giao chùa.

### Burning (Đốt Kinh)

| Tình huống | Quy tắc |
|-----------|--------|
| Đốt kinh in sẵn | ❌ **TUYỆT ĐỐI CẤIM** — là vô lễ với Bồ Tát |
| Kinh đã đốt rồi | Tội lỗi rất nặng: tụng 21 lần Sám Hối Văn; bao vải đỏ, để 6-12 tháng, giao chùa |
| Sau đốt còn cảm thấy tội | Tụng 21 lần Sám Hối Văn để xóa ấn ứng |
| Không cảm thấy tội | Chấp nhận lỗi, không lặp lại, không cần lo |

---

## 9. Vow Modifications (Thay Đổi Nguyện Tụng)

### Scenario: Switching from Mantra Practice to Little House (Chuyển từ Tụng Chú Sang Tiểu Phương Tử)

**Tình huống:** Người tu trước đó đã nguyện tụng một chú nhất định (ví dụ: 21 biến Chú Tiêu Tai hàng ngày), nhưng giờ muốn chuyển sang ưu tiên tu tập Tiểu Phương Tử.

### Cách Tiếp Cận (Approach)

**KHÔNG cần:** Thông báo rõ ràng từng chi tiết (giống như không phải quay lại thành phố cũ để nói "tôi sắp đến thành phố mới").

**Bồ Tát hiểu tự động:** Quán Thế Âm (đặc biệt) hiểu mọi pháp môn, mọi dự định. Trời đất đều biết.

### Safe Framing (Lời Khấn An Toàn)

Niệm lên Bồ Tát như sau:

> "Con kính bái Quán Thế Âm Bồ Tát, xin Bồ Tát thương xót và gia hộ con.
> Con bắt đầu tu tập Tiểu Phương Tử để trả nợ nghiệp.
> Con tạm dừng tụng Chú Tiêu Tai [tên chú cũ].
> Khi duyên lành tới, con sẽ tiếp tục tu hành chư pháp."

### NOT Considered a Vow Retreat (KHÔNG Tính Là Thoái Tâm)

| Điều | Ý nghĩa |
|-----|--------|
| Tạm dừng tụng để tu pháp khác | ✅ Là sự thích ứng hợp lý với duyên (không phải thoái tâm) |
| Chỉ thoái tâm nếu: Bỏ bớt vì lười hoặc bỏ hoàn toàn | ❌ Lúc đó mới là thoái tâm |
| Đổi lịch trình tu hành | ✅ Bồ Tát hiểu mục đích chân thành |

---

## 6. Admin Module Ownership

- Kinh văn catalog (danh sách kinh, tác dụng, liều lượng, lời khấn): **Niệm Kinh module**
- Practice presets: **Niệm Kinh module**
- Business rules (time/weather enforcement): **Niệm Kinh / Chanting Environment module**
- User practice logs: **Practice Core module** (không phải tài liệu admin)
- Tiểu Phương Tử counter: **Separate** — tuyệt đối không tính gộp
- Phenomena tracking (optional): **Practice Analytics module** (insight into user progress)
- Scripture storage best practices: **Practitioner Guide module**

---

## 7. Detailed Recitation Guidelines & Mantra Reference

### Essential Principles for Recitation Practice

#### 1. Daily Practice vs. Little House (Công Khóa vs. Ngôi Nhà Nhỏ)

Công khóa là những kinh văn **bắt buộc mỗi ngày** — như việc mỗi ngày cần ăn cơm, chi tiêu sinh hoạt:
- 3 biến **Chú Đại Bi**
- 3 biến **Tâm Kinh**
- 1 biến **Lễ Phật Đại Sám Hối Văn**
- 21 biến **Vãng Sanh Chú**

Ngôi Nhà Nhỏ là để **trả nợ** — trả nợ ân nhân, trả nợ nghiệp chướng (như hoàn trả món nợ nhà).

**Critical:** Số biến kinh văn của công khóa **KHÔNG** tính chung vào kinh văn của Ngôi Nhà Nhỏ. Phải cầu riêng, tính số biến riêng.

#### 2. Recitation Protocol

**Đầu tiên:** Luôn niệm **tên đầy đủ** của mỗi bài kinh văn.
- **Chú Đại Bi:** Phải niệm đầy đủ **Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni**
- **Tâm Kinh:** Phải niệm đầy đủ **Bát Nhã Ba La Mật Đa Tâm Kinh**

**Trước khi niệm:** Có thể nói lời cầu nguyện tương ứng (không quá 3 nguyện vọng — quá 3 là tham tâm).

**Thời gian:** Các kinh văn công khóa có quy tắc thời gian riêng (xem chi tiết dưới).

#### 3. Timing Restrictions by Practice

| Kinh văn | Quy tắc thời gian |
|---------|------------------|
| **Chú Đại Bi** | Ban ngày + buổi tối: được phép mọi lúc |
| **Tâm Kinh** | ❌ Cấm sau 22:00; ❌ Cấm khi sấm chớp, mưa giông, trời âm u nặng |
| **Lễ Phật Đại Sám Hối Văn** | Ban ngày + buổi tối: được phép; ⚠️ Nếu cảm thấy đau nhức → đốt ngay 4–7 Ngôi Nhà Nhỏ |
| **Vãng Sanh Chú** | ❌ Cấm sau 22:00; ❌ Cấm khi sấm chớp, mưa giông |
| **Chuẩn Đề Thần Chú** (Prosperity) | Ban ngày + buổi tối: được phép |
| **Giải Kết Chú** (Untangling) | Ban ngày + buổi tối: được phép |
| **Chú Tiêu Tai Cát Tường** (Auspiciousness) | Ban ngày + buổi tối: được phép |

**Note:** Từ 2 giờ sáng đến 5 giờ sáng là khoảng thời gian **tốt nhất không nên niệm** bất kỳ kinh văn nào.

#### 4. Reciting for Others

Khi niệm kinh văn **cho người thân, bạn bè, hoặc đồng tu**, nhất định phải **nêu rõ tên người ấy** thì mới có hiệu quả.

---

### The 13 Mantras — Detailed Guidance

Dưới đây là các pháp môn và cách sử dụng để tham khảo. **Lưu ý quan trọng:** Kinh văn trong Ngôi Nhà Nhỏ không thích hợp áp dụng theo các phương pháp riêng biệt để lại làm bất cứ sự cầu nguyện riêng nào.

#### 1) Thiên Thủ Thiên Nhãn Vô Ngại Đại Bi Tâm Đà La Ni (Great Compassion Mantra)

**Công dụng:** Viên mãn mọi nguyện vọng; chữa các loại bệnh tật; Long Thiên thiện thần hộ trì. Tụng nhiều biến → lúc lâm chung có thể tùy ý vãng sinh đến bất kỳ cõi Phật nào.

**Công khóa hàng ngày:** 3–7 biến, nên niệm cho đến trọn đời.

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Trường hợp đặc biệt:** Gặp cửa ải lớn, trước/sau phẫu thuật → mỗi ngày chuyên cần niệm 21, 49, hoặc càng nhiều càng tốt.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX (tên) thân thể khỏe mạnh, tăng cường công lực."

Nếu bệnh cụ thể: "Xin Quán Thế Âm Bồ Tát đại từ đại bi chữa trị bệnh ở [bộ phận]... của con XXX, để sớm khôi phục khỏe mạnh."

---

#### 2) Bát Nhã Ba La Mật Đa Tâm Kinh (Heart Sutra)

**Công dụng:** Khai mở trí tuệ bằng tâm từ bi của Bồ Tát.
- **Ở cõi trời:** là năng lượng
- **Ở địa phủ:** là tiền tài
- **Ở nhân gian:** là trí tuệ

Thích hợp cho: Trẻ nhỏ không nghe lời, người lớn không tin Phật, người già cố chấp, tâm tình bất ổn, trí tuệ chưa khai mở, trầm uất; siêu độ quỷ thần ở địa phủ.

**Công khóa hàng ngày:** 3–7 biến, nên niệm cho đến trọn đời.

**Thời gian:** ⚠️ Không niệm sau 22:00; không niệm khi trời mưa bão, sấm chớp, âm u nặng. **Cần tập trung tinh thần khi niệm.**

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX khai mở trí tuệ, đầu óc tỉnh táo, bình tĩnh, đoạn trừ phiền não."

---

#### 3) Lễ Phật Đại Sám Hối Văn (88 Buddhas Great Repentance)

**Công dụng:** Sám hối các nghiệp chướng đã tạo (từ đời quá khứ và đời này): làm tổn thương người khác trong tình cảm, oan trái lâu năm, bất kính Bồ Tát, hư hại tượng Bồ Tát, v.v...

**Công khóa hàng ngày:** 1–7 biến, nên niệm cho đến trọn đời.

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX, giúp con sám hối và tiêu trừ nghiệp chướng [trên thân con / tại bộ phận...], gia hộ cho con thân thể khỏe mạnh, khai mở trí tuệ."

**Cảnh báo:** Nếu cảm thấy bộ phận nào trên thân không dễ chịu, đau nhức → đó là **nghiệp chướng bị kích hoạt hóa thành linh tính** (điều tốt — phát lộ sớm còn tốt hơn sinh bệnh lúc già). Thường niệm 4–7 Ngôi Nhà Nhỏ; nếu đau nặng → thêm vài Ngôi Nhà Nhỏ nữa cho đến khi dễ chịu.

---

#### 4) Chuẩn Đề Thần Chú (Cundi Mantra)

**Công dụng:** Cầu sự nghiệp thành tựu, hôn nhân viên mãn, học hành thuận lợi. Đặc biệt hỗ trợ cho trẻ trẻ tìm việc, tìm bạn đời, học tập, sự nghiệp.

**Điều kiện:** Chủ yếu cầu một việc gì đó trong phạm vi **hợp lý, hợp pháp**. Phải có công đức tích lũy thì mới có thể đạt được cát tường.

**Công khóa:** 21, 27, hoặc 49 biến.

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX tâm tưởng sự thành, sự nghiệp thành công" (hoặc cầu một việc hợp lý cụ thể).

---

#### 5) Giải Kết Chú (Untangling Mantra)

**Công dụng:** Hóa giải oan kết giữa người với người: người yêu hiểu lầm, vợ chồng bất hòa, cha con mẹ con không hòa thuận, đồng nghiệp vướng mắc, chủ và nhân viên đối lập, nghiệp chướng đời trước.

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX và YYY [tên người thân/bạn bè/đồng nghiệp], hóa giải ác duyên."

---

#### 6) Chú Tiêu Tai Cát Tường (Auspiciousness Mantra)

**Công dụng:** Hóa giải oan kết từ đời trước khi gặp các sự việc đột phát: thoát khỏi kiện tụng, mất tiền rồi tìm lại, cãi vã, bị phạt tiền, bệnh đột phát, ác mộng, biết trước có nạn.

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX tiêu tai cát tường, bình an thuận lợi."

---

#### 7) Bạt Nhất Thiết Nghiệp Chướng Căn Bản Đắc Sanh Tịnh Độ Đà La Ni (Rebirth Mantra)

**Công dụng:** Cầu xin Quán Thế Âm Bồ Tát gia hộ, hưởng an lạc hiện đời, vãng sinh Cực Lạc, siêu độ các loài vật nhỏ đã từng sát hại (gia cầm, hải sản, côn trùng) — kể cả những con vật bị giết trong mộng.

**Thích hợp:** Trước khi tin Phật đã ăn các loài vật bị giết sống; bình thường bất đắc dĩ làm tổn hại sinh mạng nhỏ.

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** ⚠️ Không niệm sau 22:00; không niệm khi sấm chớp, mưa giông.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX, giúp con siêu độ những tiểu linh tính đã chết vì con, giúp con tiêu trừ nghiệp chướng."

---

#### 8) Đại Cát Tường Thiên Nữ Chú (Great Auspiciousness Goddess Mantra)

**Công dụng:** Trừ nghèo khó, mọi điều không lành; mau được đầy đủ phong phú, an vui, cát tường; mọi nguyện cầu về hôn nhân được viên mãn.

**Điều kiện:** **Phải có công đức tích lũy** thì mới có thể đạt được cát tường. Nếu không có công đức làm nền tảng → sẽ không linh nghiệm.

**Cũng có thể dùng để cầu nhân duyên.**

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX tìm được một đoạn thiện duyên, tình cảm viên mãn" (hoặc cầu một việc cát tường cụ thể).

---

#### 9) Công Đức Bảo Sơn Thần Chú (Virtue Treasury Mantra)

**Công dụng:** Tích lũy thiện nghiệp công đức; tiêu trừ tội nghiệp. Chuyển hóa các việc lành đã làm thành công đức để tiêu trừ nghiệp chướng.

**Điều kiện:** **Phải có sự tích lũy việc thiện làm nền tảng.**

**Thích hợp:** Trong một khoảng thời gian đã làm rất nhiều việc thiện, đồng thời cần cầu một việc gì đó.

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX chuyển hóa những việc thiện con đã làm thành công đức, gia hộ cho việc... được thuận lợi."

**Trường hợp đặc biệt:** Có thể niệm cho thai nhi trong bụng hoặc trẻ dưới 5 tuổi để chuyển những việc thiện đứa trẻ đã làm đời trước sang đời này, gia hộ cho bé tiêu tai bình an.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho thai nhi/cháu XXX, chuyển hóa những việc thiện đã làm trong đời trước thành công đức, gia hộ cho cháu được bình an khỏe mạnh."

---

#### 10) Chân Ngôn Diệt Tội Của Bảy Đức Phật (Seven Buddhas Mantra)

**Công dụng:** Tiêu trừ tội chướng, bình an cát tường, mọi việc thuận lợi, tạo phước cho đời sau.

**Phạm vi:** Tiêu trừ **những tội chướng nhỏ** mới tạo (đời này, hiện tại). Với **nghiệp chướng rất lớn hoặc nặng từ đời trước**, vẫn phải niệm **Lễ Phật Đại Sám Hối Văn** mới có thể tiêu trừ.

**Công khóa:** 3 biến, niệm thêm vào cuối mỗi ngày để bản thân được thanh tịnh hơn, bổ sung tiêu trừ những nghiệp chướng nhỏ trong ngày.

**Hoặc khi cần:** Ngay khi có những thân khẩu ý nghiệp nhỏ → niệm 21, 27, hoặc 49 biến.

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn (khi cần cầu):** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX tiêu trừ nghiệp chướng."

**Lưu ý:** Nếu dùng làm bước "Bổ Khuyết" hàng ngày → **không cần nói lời khấn.**

---

#### 11) Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni (Infinite Life Buddha Mantra)

**Công dụng:** Tiêu trừ yểu thọ đoản mệnh, tăng thọ cát tường, mau chứng Bồ Đề, sớm thành Phật.

**Thích hợp:** Người lớn tuổi cầu thọ; người trong mệnh có đại quan kiếp; sau trọng bệnh cần kéo dài thọ mạng.

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX tiêu tai kéo dài tuổi thọ."

---

#### 12) Như Ý Bảo Luân Vương Đà La Ni (Wish-Fulfilling Wheel King Mantra)

**Công dụng:** Được Phật quang chiếu soi khắp nơi, nhận được trí tuệ Phật và diệu pháp, hiểu rõ đạo lý Phật pháp, chuyển phiền não thành Bồ Đề, mọi việc thuận lợi, cát tường như ý, hạnh phúc bình an.

**Thích hợp:** Cầu cho một việc gì đó được như ý (ví dụ: sự nghiệp bình an thuận lợi).

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX, việc... được thuận lợi."

---

#### 13) Quán Âm Linh Cảm Chân Ngôn (Avalokitesvara Responsive Mantra)

**Công dụng:** Phật quang phổ chiếu, mọi việc thuận lợi, cát tường như ý, hạnh phúc bình an. Cầu xin Quán Thế Âm Bồ Tát đại từ đại bi hiển linh, ban cho gia trì, để sớm thấy linh nghiệm.

**Ứng dụng khẩn cấp:** Gặp tình huống cấp bách, bệnh đau nghiêm trọng → cũng có thể dùng để ngăn cơn đau.

**Điều kiện tiên quyết:** Người niệm **phải thanh tịnh, trong sạch, không có tạp niệm**, đồng thời **phải có một mức công đức nhất định** mới có hiệu quả. Nếu không → sau khi niệm **ngược lại còn không tốt**.

**Khuyến cáo:** Tốt nhất nên sau khi được Lư Đài Trưởng xem đồ đằng rồi mới chọn để niệm.

**Công khóa:** 21, 27, hoặc 49 biến (khi cần).

**Thời gian:** Ban ngày + buổi tối đều được phép.

**Lời khấn:** "Xin Quán Thế Âm Bồ Tát đại từ đại bi gia hộ cho con XXX được thân thể khỏe mạnh / việc... được thuận lợi, xin Quán Thế Âm Bồ Tát hiển linh."

---

### Core Mantras (Foundation Daily Practice)

**These 4 are mandatory in every daily practice:**

1. **Chú Đại Bi** (3–7 biến)
2. **Tâm Kinh** (3–7 biến)
3. **Lễ Phật Đại Sám Hối Văn** (1–7 biến)
4. **Vãng Sanh Chú** (21 biến)

**Additional mantras (8–13) are chosen based on individual needs and circumstances.**

---

### Phật Tâm Đệ Tử

Xin Quán Thế Âm Bồ Tát từ bi, nếu trong quá trình con dịch, chia sẻ, hoặc quản lý hướng dẫn này, có chỗ nào không đúng lý, không đúng pháp, xin Quán Thế Âm Bồ Tát, Chư vị Thần Hộ Pháp thương xót và tha thứ cho con.

---

## 8. References

- Chanting environment rules: `apps/api/src/modules/content/chanting/`
- Self-cultivation workspace: `apps/admin/src/features/self-cultivation/`
- Niem Kinh admin workspace: `apps/admin/src/routes/noi-dung/niem-kinh/`
- Incense offering ritual: [incense-offering-ritual-procedure.md](../altar-management/USE_CASES/incense-offering-ritual-procedure.md) — Sequence before daily recitation
- Daily continuity, pre-recitation, makeup policy: [daily-recitation-continuity-makeup-discipline.md](./daily-recitation-continuity-makeup-discipline.md)
