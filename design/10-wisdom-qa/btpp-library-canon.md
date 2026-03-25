# BTPP Library Canon

> File này là canonical owner cho:
>
> - tên gọi public-facing của cụm `Bạch thoại Phật pháp`
> - route/public IA của thư viện trí huệ
> - glossary riêng cho cụm pháp môn liên quan
> - source taxonomy cho wisdom content
> - official alignment với `xlch.org`
> - FAQ cho hub BTPP
> - warning policy cho content nhạy cảm, nhất là `Ngôi Nhà Nhỏ`

Nếu có mâu thuẫn giữa các file UI/SEO khác nhau về:

- route của thư viện trí huệ
- nghĩa của `Bạch thoại`, `Hỏi đáp`, `Khai thị`
- source labels
- family map official
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
- `/hoi-dap`
- `/hoi-dap/[slug]`
- `/bach-thoai/sach-noi`
- `/bach-thoai/sach-noi/[bookSlug]`
- `/bach-thoai/sach-noi/[bookSlug]/chuong/[chapterNumber]`

### Admin route

- `/admin/noi-dung/bach-thoai`

### Decision

- Chọn `/bach-thoai` cho `Bạch thoại Phật pháp`, không dùng `/bai-hoa`
- Chọn `/hoi-dap` cho `Wenda / Hỏi đáp`
- Lý do:
  - `bach-thoai` là âm Việt đúng, người Việt đọc hiểu ngay
  - ngắn hơn `bach-thoai-phat-phap`
  - đỡ mơ hồ hơn `bai-hoa`
  - vẫn giữ ASCII slug tốt cho SEO/share
  - official site đang tách `白话佛法` khỏi `玄艺问答`; PMTL không nên gộp chung dưới một hub mơ hồ nữa

### UI label rule

- H1 của `/bach-thoai`: `Bạch thoại Phật pháp`
- Subtitle của `/bach-thoai`:
  - `Bài giảng Bạch thoại và sách nói`
- H1 của `/hoi-dap`: `Hỏi đáp`
- Subtitle của `/hoi-dap`:
  - `Wenda, Huyền học vấn đáp, và tra cứu theo tình huống`
- Trong bottom nav/sidebar chỉ cần:
  - `Bạch thoại`
  - `Hỏi đáp`

---

## 3. Official family map aligned from `xlch.org`

Theo cấu trúc public-facing hiện thấy trên `xlch.org`, PMTL phải preserve ít nhất các family này:

1. `初学入门`
   - `功课经文`
   - `许愿还愿`
   - `放生仪式`
   - `经典组合`
   - `佛台供设`
   - `各类升文`
2. `节目录音`
   - `问答说话`
   - `白话佛法`
   - `玄艺综述`
   - `师父开示`
3. `弘法视频`
   - `法会开示`
   - `精选开示`
   - `现场图腾`
   - `同修分享`
4. `玄学问答`
5. `佛法书籍`
6. `疑问搜索`

### Canonical interpretation for PMTL

- `Bạch thoại Phật pháp` là family riêng
- `Wenda / Hỏi đáp` là family riêng
- `玄艺综述 / Zongshu` không được gộp mù vào `Bạch thoại`
- `师父开示 / 法会开示` là discourse/event channel; PMTL có thể dùng label Việt `Khai thị` cho presentation, nhưng không được vì vậy mà nhét nó thành tab con mặc định của `Bạch thoại`
- `疑问搜索` là utility/search surface riêng, không chỉ là decorative filter
- `初学入门` trên source official đang nhấn rất mạnh 6 trụ cột nhập môn; PMTL hiện đã có `Kinh Bài Tập`, `Phát nguyện`, `Phóng sanh`, `Ngôi Nhà Nhỏ`, nhưng vẫn phải theo dõi thêm gap ở `Phật đài` và `Các loại sớ / thăng văn`

---

## 4. Information architecture cho hub `/bach-thoai`

Hub này không được hiển thị như một khối mơ hồ, nhưng cũng không được ôm luôn các family khác.

Nó phải tập trung vào `Bạch thoại Phật pháp` và `Sách nói`.

1. `Bạch thoại`
2. `Sách nói`

### Tab semantics

#### `Bạch thoại`

- long-form bài giảng dạng dễ hiểu
- đọc theo bài hoặc theo quyển
- ưu tiên source-backed text + translation

#### `Sách nói`

- book -> chapter -> text-first + audio companion
- audio là companion, không che mất chapter text

### Rules

- Không gọi mọi wisdom content là `Bạch thoại`
- `Sách nói` là presentation format riêng của BTPP
- Nếu muốn dẫn qua `Hỏi đáp`, dùng related link hoặc cross-link card; không nhét thành tab của `/bach-thoai`
- `Khai thị` là content label/filter/detail type, không phải tab public mặc định của `/bach-thoai` ở phase hiện tại

### Query canon cho `/bach-thoai`

- URL state canonical:
  - `tab`
  - `q?`
  - `entryType?`
  - `sourceFamily?`
  - `tag?`
  - `offset`
  - `limit`
- defaults:
  - `tab=btpp`
  - `offset=0`
  - `limit=20`
- rules:
  - hub này dùng `offset` pagination cho phase hiện tại
  - `engine`, `tabCounts`, `filterFacets` phải đến từ aggregate payload
  - không tự suy `Khai thị` từ title string; nếu user lọc `entryType=event_discourse`, đó vẫn là filter state chứ không mở tab mới

---

## 4.1 Information architecture cho hub `/hoi-dap`

Hub `/hoi-dap` là surface retrieval-first cho:

- `Wenda`
- `玄艺问答`
- `佛学问答`
- các Q&A được index theo mã chương trình / timestamp / vấn đề đời sống

Visible tabs chuẩn:

1. `Tất cả`
2. `Wenda`
3. `Chủ đề phổ biến`

Rules:

- `Hỏi đáp` không được trình bày như subsection của `Bạch thoại`
- Detail page của `Hỏi đáp` phải ưu tiên code/timestamp/source label hơn essay layout
- Nếu entry Q&A có related `Khai thị` hoặc `Bạch thoại`, hiển thị ở related panel, không đổi canonical class của nó

### Query canon cho `/hoi-dap`

- URL state canonical:
  - `tab`
  - `q?`
  - `sourceFamily?`
  - `tag?`
  - `offset`
  - `limit`
- defaults:
  - `tab=all`
  - `offset=0`
  - `limit=20`
- tab semantics:
  - `all`: toàn bộ QA/result set trong hub
  - `wenda`: ưu tiên family `wenda`
  - `popular`: curated/topic-led projection nhưng vẫn phải đi từ aggregate payload, không hardcode ở client
- rules:
  - `engine`, `tabCounts`, `filterFacets` phải echo từ aggregate payload
  - `/hoi-dap` là retrieval-first hub riêng; không tái dùng query/tab canon của `/bach-thoai` một cách mù quáng

---

## 5. Glossary chuẩn cho cụm pháp môn

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

## 6. Source taxonomy chuẩn

Các wisdom entry và practice-support entry phải map vào đúng source family.

| Source family | Label hiển thị | Dùng cho |
|---|---|---|
| `btpp_video` | `BTPP video` | `白话佛法视频开示*` |
| `btpp_radio` | `BTPP radio` | `白话佛法广播讲座*` hoặc radio discourse cùng family |
| `wenda` | `Hỏi đáp` | `Wenda`, `玄学问答`, `佛学问答` |
| `zongshu` | `Tổng thuật / Zongshu` | `玄艺综述*`, source kiểu tổng hợp, đọc theo mã/timestamp |
| `mail_qa` | `Hỏi đáp thư tín` | question-answer qua mail/editorial correspondence |
| `guide_manual` | `Hướng dẫn / nghi thức` | PDF/manual/ritual guide chuẩn như phóng sanh, Ngôi Nhà Nhỏ |

### Rules

- Không trộn `wenda` vào `btpp_video`
- Không gọi một `guide_manual` là `BTPP`
- Không gọi `zongshu` là `BTPP` chỉ vì cùng xuất hiện trong menu âm thanh / khai thị
- `Sách nói` là presentation surface; source family vẫn phải là `btpp_video` hoặc `btpp_radio` hay family thực tế tương ứng

---

## 7. FAQ chuẩn cho hub `/bach-thoai`

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

## 7.1 FAQ chuẩn cho hub `/hoi-dap`

Các câu FAQ tối thiểu:

1. `Hỏi đáp là gì?`
2. `Hỏi đáp khác gì với Bạch thoại Phật pháp?`
3. `Wenda có phải là Khai thị không?`
4. `Nên tìm Hỏi đáp theo chủ đề hay theo mã chương trình?`

### Short answers baseline

- `Hỏi đáp` là surface tra cứu theo câu hỏi thật, thường có mã chương trình hoặc timestamp.
- `Wenda` không phải `Bạch thoại`; hai loại này phải giữ owner và label riêng.
- Một số entry `Khai thị` có thể liên quan câu hỏi thực hành, nhưng canonical class của nó không đổi chỉ vì user nhìn thấy từ khóa giống nhau.
- Search và filters phải hỗ trợ cả tìm theo câu hỏi đời sống lẫn tìm theo source code.

---

## 7.2 Canonical content classification

Không được gộp mù `Bạch thoại`, `Hỏi đáp`, `Khai thị`, và `bài viết`.

### `Wenda / Hỏi đáp`

Ví dụ kiểu:

- `Wenda20180624A 06:45`
- có `thính giả hỏi` + `Đài Trưởng trả lời`
- có mã chương trình / timestamp

thì canonical class phải là:

- `qaEntries`
- source family: `wenda`
- presentation surface: hub `/hoi-dap`

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
- public surface hiện tại:
  - search filter `Khai thị`
  - related cards từ event / BTPP / Hỏi đáp
  - chưa mở public top-level route riêng làm canon phase hiện tại

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

## 8. FAQ chuẩn cho `Ngôi Nhà Nhỏ`

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

## 9. Warning policy cho `Ngôi Nhà Nhỏ`

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

## 10. Product conclusion

### `Ngôi Nhà Nhỏ`

- design local đã có nền mạnh
- cần siết thêm glossary + source taxonomy + FAQ + warning policy

### `Bạch thoại Phật pháp`

- route `/bai-hoa` nên bỏ
- giữ hub ngắn gọn nhưng phải rõ nghĩa bằng `/bach-thoai`
- không dùng `/bach-thoai` làm ô gom tất cả `Hỏi đáp`
- mở `Hỏi đáp` như family riêng bằng `/hoi-dap`
- `Khai thị` giữ ở level label/filter/detail type cho phase hiện tại, không ép thành tab con của `/bach-thoai`

---

## 11. Notes for AI/codegen

- Public route dùng tiếng Việt dễ hiểu, không dùng pinyin hoặc half-transliterated slug.
- Internal key vẫn có thể dùng `baihua` nếu cần cho data model, nhưng UI/public route không được lẫn.
- Nếu một page thuộc `Hỏi đáp`, route/detail của nó không được đi qua `/bach-thoai`.
- Nếu một page thuộc `Khai thị`, đừng gắn label `Bạch thoại` chỉ vì source cùng xuất hiện trong channel `节目录音` hoặc `弘法视频`.
