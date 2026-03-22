# XLCH Official Alignment

> File này ghi lại những gì PMTL_VN cần preserve từ site official `xlch.org` khi chuẩn hóa IA, taxonomy, và content modeling cho Pháp Môn Tâm Linh.
> Last verified: 2026-03-22.

---

## 1. Official signals captured

Các family public-facing đang nhìn thấy rõ từ `xlch.org`:

- `初学入门`
  - `功课经文`
  - `许愿还愿`
  - `放生仪式`
  - `经典组合`
  - `佛台供设`
  - `各类升文`
- `节目录音`
  - `问答说话`
  - `白话佛法`
  - `玄艺综述`
  - `师父开示`
- `弘法视频`
  - `法会开示`
  - `精选开示`
  - `现场图腾`
  - `同修分享`
- `玄学问答`
- `佛法书籍`
- `疑问搜索`

---

## 2. What PMTL must preserve

### 2.1 Beginner onboarding is structured, not flat

Official site đang cho thấy `nhập môn` không chỉ là một bài giới thiệu. Nó là một family với ít nhất 6 trụ cột thực hành.

PMTL hiện đã có phần mạnh ở:

- `功课经文` -> `Kinh Bài Tập`
- `许愿还愿` -> `Phát nguyện`
- `放生仪式` -> `Phóng sanh`
- `经典组合` -> `Ngôi Nhà Nhỏ`

PMTL còn cần theo dõi gap ở:

- `佛台供设`
- `各类升文`

### 2.2 `Bạch thoại` và `Hỏi đáp` là hai family khác nhau

Official site đang tách:

- `白话佛法`
- `玄艺问答`

PMTL không được gộp hai family này dưới một hub mơ hồ rồi chỉ sửa bằng tab label.

### 2.3 `Zongshu` và `Khai thị` không phải synonym của `Bạch thoại`

Official channel `节目录音` đang thể hiện riêng:

- `白话佛法`
- `玄艺综述`
- `师父开示`

PMTL có thể dùng label Việt `Khai thị` cho presentation/public understanding, nhưng không được gộp tất cả chúng vào `BTPP`.

### 2.4 Search là first-class utility

`疑问搜索` là một public-facing utility riêng trên source official.

PMTL nên tiếp tục coi search là route và workflow riêng, không chỉ là filter phụ của một hub nội dung.

### 2.5 `法会开示`, `精选开示`, `现场图腾`, `同修分享` không phải cùng một lớp owner

Official video surface đang cho thấy ít nhất 4 lớp khác nhau:

- `法会开示`
- `精选开示`
- `现场图腾`
- `同修分享`

PMTL không nên gom cả 4 vào một bucket `video`.

Hướng preserve hợp lý:

- `法会开示` -> canonical `wisdomEntries`
- `精选开示` -> curated subset / presentational surface, không phải canonical data class mới
- `现场图腾` -> family nhạy cảm, cần policy riêng trước khi mở public surface
- `同修分享` -> testimony/community-support surface, không được ngụy trang thành doctrinal canon

---

## 3. Concrete PMTL updates triggered by this audit

- `Bạch thoại` giữ route `/bach-thoai`
- `Hỏi đáp` tách route `/hoi-dap`
- `Khai thị` hiện giữ ở level filter/detail type; chưa ép thành top-level public route canon phase này
- `Zongshu` phải giữ source family riêng
- docs canon phải ngừng coi `/bach-thoai` là umbrella cho `Hỏi đáp`

---

## 4. Open backlog after alignment

1. Quyết định có mở public route riêng cho `Khai thị` sau phase 1 hay không
2. Quyết định public IA cho `佛台供设`
3. Quyết định public IA cho `各类升文`
4. Bổ sung route/API/search/admin doc parity sau khi route `/hoi-dap` được chốt ở toàn bộ owner docs
5. Quyết định taxonomy và policy cho `现场图腾`
6. Quyết định `同修分享` đi vào `03-community` hay giữ ngoài launch scope
7. Chốt `精选开示` là curated view của `wisdomEntries`, không phải owner class mới
