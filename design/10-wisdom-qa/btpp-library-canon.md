# BTPP Library Canon

> File này là canonical owner cho:
>
> - tên gọi public-facing của cụm `Bạch thoại Phật pháp`
> - route/public IA của thư viện trí huệ
> - glossary riêng cho cụm pháp môn liên quan
> - source taxonomy cho wisdom content
> - FAQ cho hub BTPP
> - warning policy cho content nhạy cảm, nhất là `Ngôi Nhà Nhỏ`

Nếu có mâu thuẫn giữa các file UI/SEO khác nhau về:

- route của thư viện trí huệ
- nghĩa của `Bạch thoại`, `Hỏi đáp`, `Khai thị`
- source labels
- warning block/wording nhạy cảm

thì file này thắng, rồi các file kia phải sửa theo.

---

## 1. Canonical public naming

### Public-facing name

- Tên chuẩn ngoài UI: `Bạch thoại Phật pháp`
- Tên hub ngắn trong nav: `Bạch thoại`
- Tên module nội bộ vẫn có thể dùng `wisdom-qa` và `baihua` cho data keys

### Acronym rule

- Dùng `BTPP` nếu cần viết tắt tiếng Việt
- Không dùng `BHFF` trong docs PMTL_VN vì đó là acronym lẫn tiếng Anh/pinyin và gây lệch với tiếng Việt

---

## 2. Canonical route decision

### Public routes

- `/bach-thoai`
- `/bach-thoai/[slug]`
- `/bach-thoai/sach-noi`
- `/bach-thoai/sach-noi/[bookSlug]`
- `/bach-thoai/sach-noi/[bookSlug]/chuong/[chapterNumber]`

### Admin route

- `/admin/noi-dung/bach-thoai`

### Decision

- Chọn `/bach-thoai`, không dùng `/bai-hoa`
- Lý do:
  - `bach-thoai` là âm Việt đúng, người Việt đọc hiểu ngay
  - ngắn hơn `bach-thoai-phat-phap`
  - đỡ mơ hồ hơn `bai-hoa`
  - vẫn giữ ASCII slug tốt cho SEO/share

### UI label rule

- H1 của hub: `Bạch thoại Phật pháp`
- Subtitle của hub:
  - `Thư viện Bạch thoại, Hỏi đáp, Khai thị, Sách nói`
- Trong bottom nav/sidebar chỉ cần:
  - `Bạch thoại`

---

## 3. Information architecture cho hub `/bach-thoai`

Hub này không được hiển thị như một khối mơ hồ.

Nó phải có 4 visible tabs rõ ràng:

1. `Bạch thoại`
2. `Hỏi đáp`
3. `Khai thị`
4. `Sách nói`

### Tab semantics

#### `Bạch thoại`

- long-form bài giảng dạng dễ hiểu
- đọc theo bài hoặc theo quyển
- ưu tiên source-backed text + translation

#### `Hỏi đáp`

- retrieval-first Q&A
- các bài kiểu `Wenda`, `Phật học vấn đáp`, `Huyền học vấn đáp`
- ưu tiên tìm theo vấn đề đời sống

#### `Khai thị`

- chỉ dạy, khai mở ngắn hơn hoặc context-specific hơn BTPP
- có thể gắn dịp, pháp hội, hoàn cảnh thực hành

#### `Sách nói`

- book -> chapter -> text-first + audio companion
- audio là companion, không che mất chapter text

### Rules

- Không được để tab `Hỏi đáp` chìm trong `Bạch thoại`
- Không gọi mọi wisdom content là `Bạch thoại`
- `Sách nói` là presentation format riêng, không phải category doctrinal ngang hàng với `Hỏi đáp`

---

## 4. Glossary chuẩn cho cụm pháp môn

| Thuật ngữ gốc | Tên chuẩn PMTL | Ghi chú |
|---|---|---|
| `白话佛法` | `Bạch thoại Phật pháp` | Lời giảng Phật pháp bằng ngôn ngữ dễ hiểu |
| `问答 / Wenda` | `Hỏi đáp` | Q&A có source code/timestamp rõ nếu có |
| `开示` | `Khai thị` | Chỉ dạy, khai mở; không gộp mù vào BTPP |
| `小房子` | `Ngôi Nhà Nhỏ` | Không dùng `Tiểu Phòng Tử` làm tên chính |
| `要经者` | `Người cần kinh` | Không dịch machine-like; phải giữ nghĩa nghi thức |
| `自存小房子` | `Ngôi Nhà Nhỏ tự tồn` | Loại để dành/tích lũy cho bản thân hoặc ngữ cảnh hợp lệ |
| `许愿` | `Phát nguyện` | Giữ đúng nghĩa cam kết/nguyện lực |
| `放生` | `Phóng sanh` | Dùng cả cho guide và journal thực hành |

### Search alias rule

Search/index nên map cả:

- `Bạch thoại Phật pháp`, `BTPP`, `白话佛法`
- `Hỏi đáp`, `Wenda`, `问答`, `玄学问答`, `佛学问答`
- `Ngôi Nhà Nhỏ`, `小房子`
- `Người cần kinh`, `要经者`
- `Ngôi Nhà Nhỏ tự tồn`, `自存小房子`
- `Phát nguyện`, `许愿`
- `Phóng sanh`, `放生`

---

## 5. Source taxonomy chuẩn

Các wisdom entry và practice-support entry phải map vào đúng source family.

| Source family | Label hiển thị | Dùng cho |
|---|---|---|
| `btpp_video` | `BTPP video` | `白话佛法视频开示*` |
| `btpp_radio` | `BTPP radio` | `白话佛法广播讲座*` hoặc radio discourse cùng family |
| `wenda` | `Hỏi đáp` | `Wenda`, `玄学问答`, `佛学问答` |
| `zongshu` | `Tổng thuật / Zongshu` | source kiểu tổng hợp, đọc theo mã/timestamp |
| `mail_qa` | `Hỏi đáp thư tín` | question-answer qua mail/editorial correspondence |
| `guide_manual` | `Hướng dẫn / nghi thức` | PDF/manual/ritual guide chuẩn như phóng sanh, Ngôi Nhà Nhỏ |

### Rules

- Không trộn `wenda` vào `btpp_video`
- Không gọi một `guide_manual` là `BTPP`
- `Sách nói` là presentation surface; source family vẫn phải là `btpp_video` hoặc `btpp_radio` hay family thực tế tương ứng

---

## 6. FAQ chuẩn cho hub `/bach-thoai`

Các câu FAQ tối thiểu:

1. `Bạch thoại Phật pháp là gì?`
2. `Bạch thoại Phật pháp khác gì với Hỏi đáp?`
3. `Bạch thoại Phật pháp khác gì với bài giảng/audio thông thường?`
4. `Nên đọc Bạch thoại theo chủ đề hay theo quyển?`

### Short answers baseline

- BTPP là lời giảng Phật pháp bằng ngôn ngữ dễ hiểu để người học áp dụng vào đời sống.
- `Hỏi đáp` thiên về câu hỏi tình huống cụ thể; `BTPP` thiên về bài giảng hệ thống hơn.
- Audio chỉ là phương thức nghe; canonical learning surface vẫn phải giữ text/source/translation rõ.
- Người mới có thể đọc theo chủ đề; người học sâu hơn có thể đi theo quyển/chương.

---

## 6.1 Canonical content classification

Không được gộp mù `Bạch thoại`, `Hỏi đáp`, `Khai thị`, và `bài viết`.

### `Wenda / Hỏi đáp`

Ví dụ kiểu:

- `Wenda20180624A 06:45`
- có `thính giả hỏi` + `Đài Trưởng trả lời`
- có mã chương trình / timestamp

thì canonical class phải là:

- `qaEntries`
- source family: `wenda`
- presentation surface: tab `Hỏi đáp`

Không được coi đó là:

- `Bạch thoại Phật pháp`
- `bài viết`
- `blog post`

### `Bạch thoại Phật pháp`

Là bài giảng có cấu trúc học, đọc theo bài hoặc theo quyển.

Canonical class:

- `wisdomEntries`
- source family: `btpp_video` hoặc `btpp_radio`

### `Khai thị`

Là chỉ dạy / khai mở / discourse theo dịp, pháp hội, hoàn cảnh.

Canonical class:

- `wisdomEntries`
- source family thường là `btpp_video`, `btpp_radio`, hoặc family source thật tương ứng

### `Bài viết`

`/bai-viet` chỉ dành cho editorial surface:

- bài giới thiệu
- bài tổng hợp biên tập
- bài update sản phẩm / thông báo / bài học viết lại theo giọng PMTL
- bài dẫn nhập để người mới hiểu feature hoặc topic

`/bai-viet` không được là owner canonical của:

- `Wenda`
- `Phật học vấn đáp`
- `Huyền học vấn đáp`
- `Bạch thoại Phật pháp`
- `Khai thị`

Posts có thể **trích dẫn hoặc dẫn link** sang `wisdom/qa`, nhưng không thay record canonical.

---

## 7. FAQ chuẩn cho `Ngôi Nhà Nhỏ`

Các câu FAQ tối thiểu:

1. `Ngôi Nhà Nhỏ là gì?`
2. `Ngôi Nhà Nhỏ dùng khi nào?`
3. `Có những loại / số biến nào?`
4. `Nếu viết sai hoặc chấm sai thì xử lý như thế nào?`
5. `Đốt Ngôi Nhà Nhỏ khi không có bàn thờ thì làm sao?`

### Short answers baseline

- `Ngôi Nhà Nhỏ` là một loại kinh văn/thực hành trong Pháp môn Tâm Linh; wording public phải luôn kèm source ref.
- Các loại/số biến không được hardcode kiểu truyền miệng; phải bám source-backed guide hiện hành.
- Viết sai/chấm sai là nhánh xử lý riêng, không được trả lời mơ hồ bằng annotation cộng đồng.
- Flow `không có bàn thờ` phải là guide/warning riêng, không chôn trong FAQ ngắn.

---

## 8. Warning policy cho `Ngôi Nhà Nhỏ`

`Ngôi Nhà Nhỏ` là high-risk content surface.

Mọi guide/FAQ/tooling liên quan phải có warning blocks mạnh hơn mặt bằng chung:

1. Không tự suy diễn rule từ kinh nghiệm truyền miệng.
2. Không trộn nguồn không chính thống vào canonical wording.
3. Mọi wording nhạy cảm phải có:
   - `sourceReference`
   - `sourceUrl` hoặc source code
   - `versionNote`

### Required warning block mẫu

- `Cảnh báo: nội dung này là rule nghi thức nhạy cảm. Chỉ dùng wording đã qua source ref và version note.`
- `Nếu gặp case đặc biệt hoặc wording giữa các bản cộng đồng khác nhau, ưu tiên source-backed guide đang được duyệt trong PMTL_VN.`

### Anti-rules

- Không dùng community annotation làm canonical answer.
- Không gộp FAQ ngắn thành rule hoàn chỉnh nếu source gốc chưa đủ.
- Không để tool/case selector tự “tính” rule khi thiếu source-backed matrix.

---

## 9. Product conclusion

### `Ngôi Nhà Nhỏ`

- design local đã có nền mạnh
- cần siết thêm glossary + source taxonomy + FAQ + warning policy

### `Bạch thoại Phật pháp`

- route `/bai-hoa` nên bỏ
- giữ hub ngắn gọn nhưng phải rõ nghĩa bằng `/bach-thoai`
- H1/nav/subtitle phải giải nghĩa rõ:
  - `Bạch thoại Phật pháp`
  - `Bạch thoại / Hỏi đáp / Khai thị / Sách nói`

---

## 10. Notes for AI/codegen

- Public route dùng tiếng Việt dễ hiểu, không dùng pinyin hoặc half-transliterated slug.
- Internal key vẫn có thể dùng `baihua` nếu cần cho data model, nhưng UI/public route không được lẫn.
- Nếu một page thuộc `Hỏi đáp` hay `Khai thị`, đừng gắn label `Bạch thoại` chỉ vì nó nằm dưới hub `/bach-thoai`.
