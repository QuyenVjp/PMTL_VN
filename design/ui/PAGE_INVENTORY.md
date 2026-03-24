# Page Inventory (Danh mục Trang / Màn hình)

Đây là danh mục đầy đủ tất cả routes của PMTL_VN.
Mỗi trang có: route, tiêu đề, auth level, module owner, nội dung chính, ghi chú mobile.

> **Cập nhật khi**: thêm trang mới, đổi auth requirement, đổi module owner.
> **Ref**: `tracking/api-route-inventory.md` cho API routes tương ứng.

---

## Auth levels

| Level | Mô tả |
|---|---|
| `public` | Không cần đăng nhập |
| `member+` | Phải đăng nhập (member hoặc admin) |
| `admin+` | Phải là admin hoặc super-admin |
| `super-admin` | Chỉ super-admin |

`editor+` hoặc `moderator+` nếu xuất hiện ở API docs là backend role narrowing bên trong admin surface; page-level gating ở file này vẫn dùng `admin+` hoặc `super-admin`.

---

## I. Public Pages (Trang công khai)

### 1.1 Homepage

| Field | Value |
|---|---|
| Route | `/` |
| Title | Trang chủ PMTL_VN |
| Auth | `public` |
| Module owner | Content (featured posts) + Calendar (advisory preview) |

**Nội dung chính:**
- Hero section: tiêu đề, tagline, CTA đăng nhập / bắt đầu tu học
- Five Treasures entry grid (5 cổng vào: Niệm kinh, Phát nguyện, Phóng sanh, Bạch thoại, Hỏi đáp)
- Bài viết nổi bật (featured posts, max 6)
- Hướng dẫn cho người mới (beginner guide spotlight)
- Lịch âm ngày hôm nay (compact)
- CTA Footer: tải app / đăng ký

**Mobile note**: Five Treasures grid 2×3 (mobile) → 5-in-a-row (desktop). Hero CTA nổi bật.

---

### 1.2 Posts (Bài viết)

| Field | Value |
|---|---|
| Route | `/bai-viet` |
| Title | Bài viết |
| Auth | `public` |
| Module owner | Content |

**Nội dung:**
- Danh sách bài viết (cards với title, excerpt, date, tags, author)
- Chỉ chứa editorial posts; không làm owner canonical cho Bạch thoại / Hỏi đáp / Khai thị
- Filter theo tag / category
- Pagination hoặc load more
- Search mini (link sang /tim-kiem)

---

### 1.3 Post Detail (Chi tiết bài viết)

| Field | Value |
|---|---|
| Route | `/bai-viet/[slug]` |
| Title | Tên bài viết |
| Auth | `public` (comments cần member+) |
| Module owner | Content + Community (comments) |

**Nội dung:**
- Header: title, date, author, tags, reading time
- Article body (rich text)
- Nếu bài trích doctrinal source hoặc Q&A, phải có link ngược về entry canonical thuộc Wisdom-QA
- Related content sidebar
- Comment section (load lazy)
- Report button trên từng comment (member+)
- Breadcrumb

---

### 1.4 Little House Hub (Ngôi Nhà Nhỏ — Tổng quan)

| Field | Value |
|---|---|
| Route | `/ngoi-nha-nho` |
| Title | Ngôi Nhà Nhỏ — Hướng Dẫn Toàn Diện |
| Auth | `public` |
| Module owner | Content |

**Nội dung chính:**
- Quick definition block: "Ngôi Nhà Nhỏ là gì?" (GEO-friendly, AI-extractable)
- 5 cửa vào lớn theo nhóm IA (không phải 13 link phẳng)
- Entry points: "Tôi mới bắt đầu", "Tôi cần xem quy trình đốt", "Tra cứu số lượng"...
- FAQ ngắn 4-5 câu phổ biến nhất
- CTA: "Bắt đầu thực hành" → `/tu-tap/nha-nho` (member+)

**SEO**: Primary keyword `ngôi nhà nhỏ`. Schema: `WebPage` + `ItemList` (5 nhóm) + `BreadcrumbList`.
**Mobile note**: 5 nhóm hiển thị dạng card 2 cột. CTA thực hành nổi bật.

---

### 1.4a Little House Group Landing Pages

| Routes | Auth | Module owner |
|---|---|---|
| `/ngoi-nha-nho/bat-dau` | `public` | Content |
| `/ngoi-nha-nho/tri-tung` | `public` | Content |
| `/ngoi-nha-nho/dot-va-hau-xu-ly` | `public` | Content |
| `/ngoi-nha-nho/tra-cuu` | `public` | Content |
| `/ngoi-nha-nho/thuc-hanh` | `public` (tracker cần `member+`) | Content |

**Mỗi group landing page có:**
- Sticky section nav (scroll-spy)
- Danh sách guide con trong nhóm (cards)
- CTA "Đọc nhanh" / "Xem checklist" / "Tải mẫu"
- CTA cuối: "Bắt đầu thực hành" → `/tu-tap/nha-nho`
- Breadcrumb: Trang chủ > Ngôi Nhà Nhỏ > [Nhóm]

**SEO**: Mỗi group page có H1, meta description, `Article` + `BreadcrumbList` schema.

---

### 1.4b Little House Guide Detail Pages

| Route pattern | Auth | Module owner |
|---|---|---|
| `/ngoi-nha-nho/[group]/[slug]` | `public` | Content |

**Ví dụ routes:**
- `/ngoi-nha-nho/dot-va-hau-xu-ly/quy-trinh-dot`
- `/ngoi-nha-nho/tri-tung/cham-do`
- `/ngoi-nha-nho/tri-tung/cac-buoc`
- `/ngoi-nha-nho/tra-cuu/so-luong`
- `/ngoi-nha-nho/tra-cuu/hoi-dap`

**Mỗi guide detail page có:**
- Sticky TOC (table of contents)
- Content blocks: step_sequence, warning_list, image_compare, faq_block, download_panel
- "Đọc nhanh" summary box đầu trang (speakable)
- Prev/Next guide navigation trong cùng nhóm
- CTA sang tracker: "Bắt đầu thực hành"
- Breadcrumb đầy đủ 4 cấp

**SEO**:
- `/quy-trinh-dot`: `HowTo` schema — cơ hội Featured Snippet cao nhất
- Tất cả: `Article` + `BreadcrumbList`
- Trang có FAQ: `FAQPage` schema
- Ref: `design/seo-geo/little-house-seo.md`, `design/seo-geo/structured-data.md`

**Mobile note**: Sticky TOC collapse thành dropdown. image_compare dạng side-by-side (không slider).

---

### 1.4c Daily Practice Hub (Kinh Bài Tập — Tổng quan)

| Field | Value |
|---|---|
| Route | `/kinh-bai-tap` |
| Title | Kinh Bài Tập Hằng Ngày |
| Auth | `public` |
| Module owner | Content |

**Nội dung chính:**
- Entry cards theo 5 nhóm: bắt đầu / các bước / lưu ý / theo tình huống / thực hành
- Quick definition: `Kinh Bài Tập là gì`, khác gì với `Ngôi Nhà Nhỏ`
- "Tôi là người mới" CTA dẫn vào luồng an toàn nhất
- Download panel cho PDF chuẩn và sách kinh liên quan
- CTA `Bắt đầu thực hành` → `/tu-tap/bai-tap` (member+)

**SEO**: Primary keyword `kinh bài tập hằng ngày`. Schema: `WebPage` + `ItemList` + `BreadcrumbList`.
**Mobile note**: Card IA hiển thị 1 cột, đọc được không cần mở accordion.

---

### 1.4d Daily Practice Group Landing Pages

| Routes | Auth | Module owner |
|---|---|---|
| `/kinh-bai-tap/bat-dau` | `public` | Content |
| `/kinh-bai-tap/cac-buoc` | `public` | Content |
| `/kinh-bai-tap/luu-y` | `public` | Content |
| `/kinh-bai-tap/theo-tinh-huong` | `public` | Content |
| `/kinh-bai-tap/thuc-hanh` | `public` (tracker cần `member+`) | Content |

**Mỗi group landing page có:**
- Sticky section nav
- Danh sách guide cards, FAQ highlights, related preset shortcuts
- CTA tải PDF và CTA sang tracker
- Breadcrumb: Trang chủ > Kinh Bài Tập > [Nhóm]

**SEO**: `Article` + `BreadcrumbList`, nhóm `các bước` có thể dùng `HowTo` khi phù hợp.

---

### 1.4e Daily Practice Guide Detail Pages

| Route pattern | Auth | Module owner |
|---|---|---|
| `/kinh-bai-tap/[group]/[slug]` | `public` | Content |

**Ví dụ routes:**
- `/kinh-bai-tap/cac-buoc/cho-nguoi-moi`
- `/kinh-bai-tap/luu-y/thoi-gian-va-dia-diem`
- `/kinh-bai-tap/theo-tinh-huong/benh-nang`
- `/kinh-bai-tap/thuc-hanh/ghi-buoi-tu`

**Mỗi guide detail page có:**
- Sticky TOC
- Block types: step_sequence, warning_list, chant_count_matrix, faq_block, download_panel
- Summary box đầu trang
- `Scenario preset` card nếu bài có preset liên quan
- CTA `Mở bảng thực hành`

**Mobile note**: TOC collapse thành dropdown. Step sequence ưu tiên dạng card dọc.

---

### 1.4ea Self-Cultivation Hub (Kinh Văn Tự Tu — Tổng quan)

| Field | Value |
|---|---|
| Route | `/kinh-van-tu-tu` |
| Title | Kinh Văn Tự Tu |
| Auth | `public` |
| Module owner | Content |

**Nội dung chính:**
- Quick definition: `Kinh Văn Tự Tu là gì`, khác gì với `Kinh Bài Tập` và `Ngôi Nhà Nhỏ`
- Entry cards theo 5 nhóm: bắt đầu / cách dùng / bảo quản / trường hợp sử dụng / tải xuống
- Boundary summary box để user không nhầm sang công khóa hằng ngày hoặc Ngôi Nhà Nhỏ
- Download panel cho mẫu in, PDF hướng dẫn, bảng phân biệt 3 surface
- CTA `Đọc cách dùng` và `Tải mẫu in`

**SEO**: Primary keyword `kinh văn tự tu`. Schema: `WebPage` + `ItemList` + `BreadcrumbList`.
**Mobile note**: Card IA hiển thị 1 cột, ưu tiên đọc nhanh và tải mẫu in rõ ràng.

---

### 1.4eb Self-Cultivation Group Landing Pages

| Routes | Auth | Module owner |
|---|---|---|
| `/kinh-van-tu-tu/bat-dau` | `public` | Content |
| `/kinh-van-tu-tu/cach-dung` | `public` | Content |
| `/kinh-van-tu-tu/bao-quan` | `public` | Content |
| `/kinh-van-tu-tu/truong-hop-su-dung` | `public` | Content |
| `/kinh-van-tu-tu/tai-xuong` | `public` | Content |

**Mỗi group landing page có:**
- Sticky section nav
- Danh sách guide cards hoặc download cards
- Boundary note với `Kinh Bài Tập` / `Ngôi Nhà Nhỏ` khi cần
- CTA `Xem hướng dẫn liên quan`
- Breadcrumb: Trang chủ > Kinh Văn Tự Tu > [Nhóm]

**SEO**: `Article` + `BreadcrumbList`, nhóm `cách dùng` có thể dùng `HowTo` khi phù hợp.

---

### 1.4ec Self-Cultivation Guide Detail Pages

| Route pattern | Auth | Module owner |
|---|---|---|
| `/kinh-van-tu-tu/[group]/[slug]` | `public` | Content |

**Ví dụ routes:**
- `/kinh-van-tu-tu/cach-dung/cach-ghi-kinh-tang`
- `/kinh-van-tu-tu/cach-dung/cach-cham-do`
- `/kinh-van-tu-tu/bao-quan/cach-cat-giu`
- `/kinh-van-tu-tu/truong-hop-su-dung/dung-cho-ban-than`

**Mỗi guide detail page có:**
- Sticky TOC
- Block types: step_sequence, warning_list, script_block, faq_block, download_panel
- Summary box đầu trang
- Source/version note cho rule nhạy cảm
- CTA `Tải mẫu in` hoặc `Xem hướng dẫn liên quan`

**Mobile note**: TOC collapse thành dropdown. `script_block` hiển thị dạng card dọc dễ đọc.

---

### 1.4f Life Release Hub (Phóng Sanh — Tổng quan)

| Field | Value |
|---|---|
| Route | `/huong-dan/phong-sanh` |
| Title | Phóng Sanh — Hướng Dẫn Nghi Thức |
| Auth | `public` |
| Module owner | Content |

**Nội dung chính:**
- định nghĩa ngắn, khi nào nên dùng guide này
- quick chooser: cho bản thân / cho người khác / nghi thức cơ bản / lưu ý
- warning đạo đức và checklist chuẩn bị ngắn
- download panel cho PDF và card mẫu khấn
- CTA `Mở sổ tay phóng sanh` -> `/phong-sanh` (member+)

**SEO**: Pillar page cho cluster `phóng sanh pháp môn tâm linh`.
**Mobile note**: quick chooser hiển thị dạng card dọc, không accordion sâu.

---

### 1.4g Life Release Guide Detail Pages

| Route pattern | Auth | Module owner |
|---|---|---|
| `/huong-dan/phong-sanh/[slug]` | `public` | Content |

**Ví dụ routes:**
- `/huong-dan/phong-sanh/nghi-thuc-co-ban`
- `/huong-dan/phong-sanh/cho-ban-than`
- `/huong-dan/phong-sanh/cho-nguoi-khac`
- `/huong-dan/phong-sanh/luu-y-va-chuan-bi`
- `/huong-dan/phong-sanh/xu-ly-khi-co-loai-vat-tu-vong`

**Mỗi guide detail page có:**
- summary box đầu trang
- step sequence hoặc script block
- ritual variant card
- warning list
- CTA `Ghi lại buổi phóng sanh`

**Mobile note**: step sequence dạng card dọc; scripts có nút copy/expand nhưng không ẩn phần placeholder quan trọng.

---

### 1.4h Media Library Hub (Thư viện pháp môn)

| Field | Value |
|---|---|
| Route | `/thu-vien/phap-mon` |
| Title | Thư viện ảnh & video Pháp Môn |
| Auth | `public` |
| Module owner | Content |

**Nội dung chính:**
- featured collection
- filter tabs: tất cả / video / hình ảnh / pháp hội / giới thiệu pháp môn / đồ đằng
- collection grid
- quick links sang event detail, bạch thoại, tài liệu tải xuống

**Mobile note**: tabs dạng pill scroll ngang; collection cards full-width, caption rõ.

---

### 1.4i Media Library Collection Detail

| Route pattern | Auth | Module owner |
|---|---|---|
| `/thu-vien/phap-mon/[slug]` | `public` | Content |

**Mỗi collection detail page có:**
- collection hero
- metadata bar
- media grid hoặc playlist panel
- related links về `Calendar` hoặc `Wisdom-QA` nếu có
- share / copy link secondary actions

**Mobile note**: ảnh ưu tiên grid 2 cột; video ưu tiên list dọc, không autoplay.

---

### 1.5 Beginner Guides (Hướng dẫn mới bắt đầu)

| Field | Value |
|---|---|
| Route | `/huong-dan` |
| Title | Hướng dẫn cho người mới |
| Auth | `public` |
| Module owner | Content |

**Nội dung:**
- Grid hướng dẫn theo chủ đề (niệm kinh, phóng sanh, ngôi nhà nhỏ...)
- Progress indicator nếu đã đăng nhập (link sang Engagement)
- Featured: "Bắt đầu từ đây" guide

---

### 1.5 Guide Detail (Chi tiết hướng dẫn)

| Field | Value |
|---|---|
| Route | `/huong-dan/[slug]` |
| Title | Tên hướng dẫn |
| Auth | `public` |
| Module owner | Content |

**Nội dung:**
- Long-form guide với table of contents
- Audio player nếu có audio
- PDF download button nếu có
- Next guide suggestion
- Breadcrumb + back

---

### 1.6 Downloads (Tài liệu tải xuống)

| Field | Value |
|---|---|
| Route | `/tai-lieu` |
| Title | Tài liệu & Kinh sách |
| Auth | `public` |
| Module owner | Content |

**Nội dung:**
- Grid tài liệu (PDF, audio) theo danh mục
- Filter: loại tài liệu, chủ đề
- Download button với file size

---

### 1.7 Sutra Library (Thư viện kinh sách)

| Field | Value |
|---|---|
| Route | `/kinh-sach` |
| Title | Kinh sách |
| Auth | `public` (bookmark cần member+) |
| Module owner | Content |

**Nội dung:**
- Danh sách kinh / bộ kinh
- Tóm tắt, số quyển, ngôn ngữ
- Progress bar nếu đã đăng nhập

---

### 1.8 Sutra Reading (Đọc kinh)

| Field | Value |
|---|---|
| Route | `/kinh-sach/[slug]` |
| Title | Tên kinh |
| Auth | `public` (progress cần member+) |
| Module owner | Content + Engagement (progress) |

**Nội dung:**
- Reading view: large font, high contrast
- Bookmarking (member+)
- Progress sync (member+)
- Glossary tooltips
- Audio play button nếu có
- Prev/Next chapter navigation

**Mobile note**: Full-screen reading mode. Swipe để next/prev chapter. Font size adjustable.

---

### 1.9 Chant Library (Niệm kinh)

| Field | Value |
|---|---|
| Route | `/niem-kinh` |
| Title | Niệm kinh |
| Auth | `public` |
| Module owner | Content |

**Nội dung:**
- support hub, không chỉ là generic chant library
- section `Bắt đầu từ đây`:
  - guide cards sang `Kinh Bài Tập`
  - ritual cards như `thắp tâm hương`
- section `Bài niệm`
- section `Nghi thức thường dùng`
- section `Kế hoạch gợi ý`
- section `Lưu ý quan trọng`
- filter theo loại, thời lượng, ngôn ngữ
- preview text + play button nếu có audio

**Route rule**:
- `/niem-kinh` là hub điều hướng
- không phải nơi nhét toàn bộ ritual flow chi tiết vào 1 page duy nhất

---

### 1.9a Chant Environment Rules

| Field | Value |
|---|---|
| Route | `/niem-kinh/luu-y-moi-truong-va-thoi-gian` |
| Title | Lưu ý môi trường & thời gian khi niệm kinh |
| Auth | `public` |
| Module owner | Content |

**Nội dung:**
- intro ngắn giải thích đây là canon cho `time/place/environment/body-state`
- 6 nhóm rule:
  - thời gian
  - địa điểm
  - ăn uống & thể trạng
  - tư thế & vệ sinh
  - nơi đặc biệt
  - những gì không nên tự suy diễn
- quick checklist `Trước khi bắt đầu`
- special-location caution cards
- reference-only caution notes cho giấc mơ / ánh sáng / tro lửa
- related guide refs sang `Kinh Bài Tập`, `Ngôi Nhà Nhỏ`, `Kinh Văn Tự Tu`

**Route rule**:
- đây là source-of-truth page, không chỉ là FAQ mở rộng
- các surface khác được nhúng snippet / deep-link từ đây, không copy wording mỗi nơi một kiểu

---

### 1.10 Chant Item Detail

| Field | Value |
|---|---|
| Route | `/niem-kinh/[slug]` |
| Title | Tên bài niệm |
| Auth | `public` (log practice cần member+) |
| Module owner | Content + Engagement |

**Nội dung:**
- Full chant text (bilingual: Vietnamese + Original)
- Audio player (lớn, dễ dùng cho người cao tuổi)
- Số biến / thời lượng suggested
- "Ghi lại buổi niệm" button (member+)
- Related practice rules (từ Wisdom-QA)

**Elderly note**: Audio controls PHẢI lớn (min 48px touch target). Play/Pause/Volume rõ ràng.

---

### 1.10a Chant Ritual Detail

| Field | Value |
|---|---|
| Route | `/niem-kinh/nghi-thuc/[slug]` |
| Title | Tên nghi thức |
| Auth | `public` |
| Module owner | Content |

**Nội dung:**
- header: tên nghi thức + khi nào nên dùng
- preparation card
- stepper tổng quát
- step cards với chip loại bước:
  - Chuẩn bị
  - Quán tưởng
  - Niệm thầm
  - Lạy
  - Kết thúc
- count labels rất rõ (`7 biến`, `13 biến`, `3 lần`...)
- condensed mode: xem nhanh
- expanded mode: xem chi tiết từng bước
- related chant items
- related plan / related guide CTA

**Rule**:
- các flow như `thắp tâm hương` phải đi route này
- không render như 1 khối article dài hoặc nhét vào chant item detail

---

### 1.10b Chant Plan Detail

| Field | Value |
|---|---|
| Route | `/niem-kinh/ke-hoach/[slug]` |
| Title | Tên kế hoạch niệm |
| Auth | `public` (member+ nếu log progress) |
| Module owner | Content + Engagement |

**Nội dung:**
- summary + estimated duration
- ordered sections
- ritual mở đầu nếu có
- list bài niệm chính
- closing items
- entry requirements
- CTA sang tracker hoặc guide liên quan

**Rule**:
- plan detail không được chôn raw ritual wording trong section text nếu ritual đã có owner riêng

---

### 1.11 Calendar (Lịch công khai)

| Field | Value |
|---|---|
| Route | `/lich` |
| Title | Lịch tu học |
| Auth | `public` (personal calendar cần member+) |
| Module owner | Calendar |

**Nội dung:**
- Lunar calendar view (tháng hiện tại)
- Các ngày đặc biệt được highlight (mùng 1, 15, kỵ nhật...)
- Advisory preview cho ngày hôm nay
- Event listing bên dưới
- Link sang `/lich-ca-nhan` (member+)

### 1.11a Events Listing (Sự kiện & Chương trình)

| Field | Value |
|---|---|
| Route | `/su-kien` |
| Title | Sự kiện & Chương trình |
| Auth | `public` |
| Module owner | Calendar |

**Nội dung:**
- Featured upcoming event ở đầu trang
- Filter theo loại: pháp hội / một ngày an lạc / gieo duyên / khóa tu / livestream
- Tabs hoặc toggle: sắp diễn ra / đã diễn ra
- Event cards với ngày, giờ, địa điểm, CTA cơ bản
- Search nhẹ theo tên hoặc địa điểm

**Mobile note**: Featured event chiếm full-width. Event card phải đọc được 3 dòng đầu không cần mở detail.

### 1.11b Event Detail (Chi tiết sự kiện tổ chức)

| Field | Value |
|---|---|
| Route | `/su-kien/[slug]` |
| Title | Tên sự kiện |
| Auth | `public` |
| Module owner | Calendar |

**Nội dung:**
- Hero với poster/cover, badge loại sự kiện, trạng thái
- Quick info: ngày giờ, địa điểm, hình thức offline/online/hybrid
- CTA row: đăng ký / xem bản đồ / livestream / tải chương trình
- Timeline chương trình theo khung giờ
- Speakers / facilitators
- Nội dung mô tả chi tiết
- Gallery ảnh và files đính kèm
- Related content nếu có
- Nếu có `bài pháp hội / khai thị liên quan`, chỉ hiện ref card/link sang canonical Wisdom-QA entry; event page không render full discourse text

**Mobile note**: Timeline hiển thị dọc từng card. CTA chính phải ở trên fold. Bản đồ mở external app dễ dàng.

---

### 1.12 Search (Tìm kiếm)

| Field | Value |
|---|---|
| Route | `/tim-kiem` |
| Title | Tìm kiếm |
| Auth | `public` |
| Module owner | Search |

**Nội dung:**
- Search bar lớn (prominent)
- Filter tabs: Tất cả / Bài viết / Kinh sách / Bạch thoại / Hỏi đáp / Khai thị
- Result cards với source attribution
- No results state với suggestions
- Recent searches (local storage)

**Elderly note**: Search bar ít nhất 52px height. Placeholder text rõ: "Nhập từ khóa để tìm kiếm..."

---

### 1.13 BTPP Library (Bạch thoại Phật pháp / Sách nói)

| Field | Value |
|---|---|
| Route | `/bach-thoai` |
| Title | Bạch thoại Phật pháp |
| Auth | `public` |
| Module owner | Wisdom-QA |

**Nội dung:**
- Search bar (tích hợp Wisdom-QA search)
- Visible tabs: `Bạch thoại` / `Sách nói`
- Related entry links sang `Hỏi đáp` nếu query/context phù hợp
- Entry vào `Sách nói Bạch thoại`
- Featured wisdom entries
- Tags cloud
- Subtitle giải nghĩa rõ: `Bài giảng Bạch thoại và sách nói`

---

### 1.13a Q&A Library (Hỏi đáp)

| Field | Value |
|---|---|
| Route | `/hoi-dap` |
| Title | Hỏi đáp |
| Auth | `public` |
| Module owner | Wisdom-QA |

**Nội dung:**
- Search bar retrieval-first
- tabs/filter: `Tất cả` / `Wenda` / `Chủ đề phổ biến`
- result cards ưu tiên question + answer excerpt + source code/timestamp
- related links sang `Bạch thoại` hoặc `Khai thị` nếu có entry liên quan
- subtitle: `Wenda, Huyền học vấn đáp, và tra cứu theo tình huống`

---

### 1.13b Baihua Audiobook Library

| Field | Value |
|---|---|
| Route | `/bach-thoai/sach-noi` |
| Title | Sách nói Bạch thoại Phật pháp |
| Auth | `public` |
| Module owner | Wisdom-QA |

**Nội dung:**
- book selector / grid
- nhóm sách: `Bạch thoại`, `Video khai thị`, `Radio lecture`
- featured books
- note rõ `text-first`, audio là companion

---

### 1.13c Baihua Audiobook Book Detail

| Field | Value |
|---|---|
| Route | `/bach-thoai/sach-noi/[bookSlug]` |
| Title | Tên sách |
| Auth | `public` |
| Module owner | Wisdom-QA |

**Nội dung:**
- cover + metadata sách
- full-book audio link nếu có
- danh sách chương theo thứ tự
- progress / recent chapter nếu member

---

### 1.13d Baihua Audiobook Chapter Detail

| Field | Value |
|---|---|
| Route | `/bach-thoai/sach-noi/[bookSlug]/chuong/[chapterNumber]` |
| Title | Tên chương |
| Auth | `public` |
| Module owner | Wisdom-QA |

**Nội dung:**
- original text
- bản dịch Việt
- chapter navigator
- audio companion nếu có
- source attribution

---

### 1.14 Wisdom / QA Entry Detail

| Field | Value |
|---|---|
| Route | `/bach-thoai/[slug]` hoặc `/hoi-dap/[slug]` |
| Title | Tên bài / câu hỏi |
| Auth | `public` |
| Module owner | Wisdom-QA |

**Nội dung:**
- Entry type chip: `Bạch thoại` / `Hỏi đáp` / `Khai thị`
- subtype chip phụ nếu cần: `Phật ngôn` / `Pháp hội`
- Source code / timestamp nếu là entry Q&A kiểu `Wenda20180624A 06:45`
- Original text (Hán/Pali nếu có)
- Vietnamese translation
- Source attribution (author, URL, screenshot)
- Related entries
- Download for offline button (member+)
- Audio player nếu có

**Route rule:**
- `Hỏi đáp / Wenda` canonical detail dùng `/hoi-dap/[slug]`
- `Bạch thoại`, `Khai thị`, `Phật ngôn`, `Pháp hội` detail dùng `/bach-thoai/[slug]`

---

### 1.14a Authority Profile Public Surface

| Field | Value |
|---|---|
| Route | chưa mở public route canon ở phase hiện tại |
| Title | Authority profile |
| Auth | n/a |
| Module owner | Wisdom-QA |

**Ghi chú:**
- `authorityProfiles` hiện là admin-first/source-attribution surface
- public FE không được tự render result card riêng cho authority profile nếu chưa có route canon ở `PAGE_INVENTORY`

---

### 1.15 Community (Cộng đồng)

| Field | Value |
|---|---|
| Route | `/cong-dong` |
| Title | Cộng đồng |
| Auth | `public` (post cần member+) |
| Module owner | Community |

**Nội dung:**
- List community posts (từ mới nhất)
- Filter theo tag
- "Chia sẻ bài" button (member+)

---

### 1.16 Guestbook (Sổ lưu niệm)

| Field | Value |
|---|---|
| Route | `/so-luu-niem` |
| Title | Sổ lưu niệm |
| Auth | `public` (submit cần captcha) |
| Module owner | Community |

**Nội dung:**
- Approved guestbook entries (cards)
- Submit form (tên, nội dung, CAPTCHA)
- Pending message sau submit

---

### 1.17 Contact & Volunteers (Liên hệ & Phụng Sự Viên)

| Field | Value |
|---|---|
| Route | `/lien-he` |
| Title | Liên hệ |
| Auth | `public` |
| Module owner | Contact |

**Nội dung:**
- Hero section: "Liên hệ với chúng tôi" + tagline ấm áp
- Thông tin liên hệ chung: cards icon (email, hotline, fanpage, Zalo OA)
- Danh sách Phụng Sự Viên: grid responsive
  - Mỗi card: avatar tròn + tên + vai trò + nút "Nhắn Zalo" (mở link Zalo trực tiếp)
  - Responsive: 2 cột mobile, 3 cột tablet, 4 cột desktop

**Elderly note**: Nút Zalo phải lớn (min 48px), icon Zalo rõ ràng, text "Nhắn Zalo". Avatar 64×64 trên mobile.

---

## II. Auth Pages (Xác thực)

### 2.1 Login

| Route | `/dang-nhap` | Auth | `public` (redirect nếu đã login) |
|---|---|---|---|

**Form**: email, password, "Ghi nhớ đăng nhập", "Quên mật khẩu?"
**CTA**: Đăng nhập / Đăng ký ngay
**Module**: Identity

---

### 2.2 Register

| Route | `/dang-ky` | Auth | `public` |
|---|---|---|---|

**Form**: email, password, confirm password, tên hiển thị
**Post-submit**: màn hình "kiểm tra email xác nhận"
**Module**: Identity

---

### 2.3 Forgot Password

| Route | `/quen-mat-khau` | Auth | `public` |
|---|---|---|---|

**Form**: email
**Post-submit**: "Đã gửi link đặt lại" (anti-enumeration)
**Module**: Identity

---

### 2.4 Reset Password

| Route | `/dat-lai-mat-khau?token=...` | Auth | `public` |
|---|---|---|---|

**Form**: password mới, confirm
**Module**: Identity

---

### 2.5 Email Verification

| Route | `/xac-nhan-email?token=...` | Auth | `public` |
|---|---|---|---|

**Nội dung**: Processing → Success/Error state
**Module**: Identity

---

## III. Member Pages (Trang thành viên)

### 3.1 Dashboard (Trang chủ thành viên)

| Route | `/dashboard` | Auth | `member+` |
|---|---|---|---|

**Nội dung:**
- Greeting + lunar date hôm nay
- Daily advisory card (từ Calendar)
- Quick action buttons: Ghi lại buổi tu / Cập nhật Ngôi Nhà Nhỏ / Phóng sanh
- Practice streak / summary
- Recent activity (optional)
- Notification bell

**Mobile**: Đây là màn hình sau login. Layout card-based. Max 3 quick actions.

---

### 3.2 Practice Hub (Tu tập)

| Route | `/tu-tap` | Auth | `member+` |
|---|---|---|---|

**Sub-routes:**
- `/tu-tap/bai-tap` — Daily practice sheet
- `/tu-tap/nha-nho` — Ngôi Nhà Nhỏ sheet
- `/tu-tap/lich-su` — Practice history

---

### 3.3 Daily Practice Sheet

| Route | `/tu-tap/bai-tap` | Auth | `member+` |
|---|---|---|---|
| Module | Engagement |

**Nội dung:**
- Header: ngày hôm nay (âm lịch + dương lịch)
- Advisory context card nếu vào từ `/lich-ca-nhan` hoặc ngày đặc biệt
- Scenario preset card nếu user mở từ guide công khai hoặc preset route
- Practice items list (từ chantPlans hoặc user preferences)
- Mỗi item: checkbox + số biến / thời lượng + input điều chỉnh
- Companion guide drawer: mở nhanh `các bước`, `lưu ý`, `thời gian/địa điểm`
- "Lưu buổi tu" button
- "Hoàn thành buổi tu" action khi đủ checklist
- Note field (optional)

**Elderly note**: Checkbox PHẢI lớn (min 44px). Font tối thiểu 17px. High contrast.

---

### 3.4 Ngôi Nhà Nhỏ Sheet

| Route | `/tu-tap/nha-nho` | Auth | `member+` |
|---|---|---|---|
| Module | Engagement |

**Nội dung:**
- Near-paper interface (xem `design/ui/ELDERLY_UX.md` + `design/02-content/little-house-spec.md`)
- Hiển thị tên kinh và số biến cần niệm
- Tally counter (gõ số hoặc +1 button)
- Progress bar tới hoàn thành
- "Dâng nhà" button khi đủ số biến
- History của các nhà đã hoàn thành

**Elderly note**: Interface này phải tương tự tờ giấy viết tay. Không có animation phức tạp. Large numbers.

---

### 3.5 Practice History

| Route | `/tu-tap/lich-su` | Auth | `member+` |
|---|---|---|---|
| Module | Engagement |

**Nội dung:**
- List các buổi tu đã ghi (date, items, duration)
- Filter theo tháng
- Tổng kết tháng (số buổi, tổng biến)
- Export PDF (optional, phase 2+)

---

### 3.6 Vow List (Phát nguyện)

| Route | `/phat-nguyen` | Auth | `member+` |
|---|---|---|---|
| Module | Vows-Merit |

**Nội dung:**
- Active vows (cards với progress)
- Completed vows (collapsed section)
- "Tạo nguyện mới" button
- Each card: tên nguyện, loại, progress bar, status

---

### 3.7 Create Vow

| Route | `/phat-nguyen/tao-moi` | Auth | `member+` |
|---|---|---|---|
| Module | Vows-Merit |

**Form:**
- Loại nguyện (dropdown: niệm kinh, phóng sanh, bố thí, khác)
- Nội dung nguyện (textarea)
- Target (số biến / số lần / không đo được)
- Thời hạn (optional)
- Submit → confirmation screen

---

### 3.8 Vow Detail

| Route | `/phat-nguyen/[id]` | Auth | `member+` |
|---|---|---|---|
| Module | Vows-Merit |

**Nội dung:**
- Nguyện đầy đủ + status
- Progress timeline (milestones đã đạt)
- "Ghi tiến độ" button
- "Viên mãn" button khi đủ
- Void option (với confirmation)

---

### 3.9 Life Release Journal (Phóng sanh)

| Route | `/phong-sanh` | Auth | `member+` |
|---|---|---|---|
| Module | Vows-Merit |

**Nội dung:**
- Journal entries list (date, loại vật, số lượng, địa điểm)
- advisory/preset card nếu vào từ ngày đặc biệt hoặc từ guide công khai
- quick links sang nghi thức cơ bản và variant đã dùng gần đây
- "Ghi lại buổi phóng sanh" button
- Monthly summary

---

### 3.10 Log Life Release

| Route | `/phong-sanh/ghi-lai` | Auth | `member+` |
|---|---|---|---|
| Module | Vows-Merit |

**Form:**
- Ngày (date picker)
- Loại vật (dropdown + free text)
- Số lượng / quy mô
- Địa điểm (optional)
- Bài niệm liên quan (từ Wisdom-QA, auto-suggest)
- guide context / ritual variant context nếu mở từ guide
- companion panel cho mẫu khấn và checklist
- Notes

---

### 3.11 Personal Calendar

| Route | `/lich-ca-nhan` | Auth | `member+` |
|---|---|---|---|
| Module | Calendar |

**Nội dung:**
- Lunar calendar view với personal overlays
- Advisory ngày hôm nay (expanded)
- Upcoming events / reminders
- Integration với vow reminders
- "Thiết lập nhắc nhở" link → /thong-bao

---

### 3.12 Offline Bundles

| Route | `/ngoai-tuyen` | Auth | `member+` |
|---|---|---|---|
| Module | Wisdom-QA |

**Nội dung:**
- Available bundles (danh sách)
- Download status (not downloaded / downloading / up-to-date / outdated)
- "Cập nhật" button khi có version mới
- Dung lượng và số entries
- Offline reading mode indicator

---

### 3.13 Notification Settings

| Route | `/thong-bao` | Auth | `member+` |
|---|---|---|---|
| Module | Notification |

**Nội dung:**
- Enable/disable push notifications
- Subscribe / unsubscribe button
- Notification types toggle (practice reminder / event / community)
- Permission guide nếu browser chưa cấp
- Reminder settings summary
- Capability state: supported / permission denied / subscribed / degraded

**Rule**:
- đây là settings surface, không phải inbox lịch sử thông báo
- không render raw push job history cho member ở route này

---

### 3.14 Profile Settings

| Route | `/tai-khoan` | Auth | `member+` |
|---|---|---|---|
| Module | Identity |

**Tabs:**
- Thông tin cá nhân (tên, avatar, pháp danh, bio)
- Đổi mật khẩu
- Phiên đăng nhập (danh sách sessions + đăng xuất thiết bị khác)
- Xóa tài khoản (confirmation flow)

---

## IV. Admin Pages (Trang quản trị)

### 4.1 Admin Dashboard

| Route | `/admin/dashboard` | Auth | `admin+` |
|---|---|---|---|

**Nội dung:**
- Summary stats: bài viết published, community posts pending review, reports pending, users
- Quick actions: publish post / approve guestbook / resolve report
- Recent activity feed (audit log summary)
- System health indicator (từ /health)

---

### 4.2 Post Management

| Route | `/admin/noi-dung/bai-viet` | Auth | `admin+` |
|---|---|---|---|
| Module | Content |

**Nội dung:**
- Data table: title, status, author, publishedAt, actions
- Filter: status / tag / date
- "Tạo bài viết" button
- Bulk actions: publish, unpublish, delete
- Click vào row → edit detail

---

### 4.3–4.7 Other Content Management

Similar pattern cho:
- `/admin/noi-dung/huong-dan` — Beginner Guides
- `/admin/noi-dung/kinh-bai-tap` — Daily Practice workspace
- `/admin/noi-dung/kinh-van-tu-tu` — Self-cultivation workspace
- `/admin/noi-dung/ngoi-nha-nho` — Little House workspace
- `/admin/noi-dung/phong-sanh` — Life Release workspace
- `/admin/noi-dung/thu-vien-phap-mon` — Media library workspace
- `/admin/noi-dung/tai-lieu` — Downloads
- `/admin/noi-dung/kinh-sach` — Sutras
- `/admin/noi-dung/niem-kinh` — Chant Items + Ritual Templates + Chant Plans

### 4.3a Little House Content Workspace

| Route | `/admin/noi-dung/ngoi-nha-nho` | Auth | `admin+` |
|---|---|---|---|
| Module | Content |

**Nội dung:**
- Tabs: Tổng quan / Nhóm hướng dẫn / Bài chi tiết / Case variants / FAQ / Downloads & in ấn / Ảnh minh họa / Version & nguồn
- Block preview cho public guide pages và tracker companion cards
- Validation cho warning blocks, script source refs, version notes
- Publish action + audit summary

---

### 4.3b Daily Practice Content Workspace

| Route | `/admin/noi-dung/kinh-bai-tap` | Auth | `admin+` |
|---|---|---|---|
| Module | Content |

**Nội dung:**
- Tabs: Tổng quan / Các bước / Lưu ý / Scenario presets / FAQ / Downloads / Version & nguồn
- Preview guide map cho 5 nhóm IA
- Validation cho time/place rules, count matrices, preset links
- Preview companion cards cho member tracker
- Publish action + audit summary

---

### 4.3c Self-Cultivation Content Workspace

| Route | `/admin/noi-dung/kinh-van-tu-tu` | Auth | `admin+` |
|---|---|---|---|
| Module | Content |

**Nội dung:**
- Tabs: Tổng quan / Cách dùng / Bảo quản / Trường hợp sử dụng / FAQ / Downloads / Version & nguồn
- Preview guide map cho IA riêng của `Kinh Văn Tự Tu`
- Validation cho boundary summary, source refs, wording nhạy cảm, printable assets
- Không có tracker preview hay daily preset preview
- Publish action + audit summary

---

### 4.3d Life Release Content Workspace

| Route | `/admin/noi-dung/phong-sanh` | Auth | `admin+` |
|---|---|---|---|
| Module | Content |

**Nội dung:**
- Tabs: Tổng quan / Nghi thức cơ bản / Variants / Lưu ý & chuẩn bị / FAQ / Downloads & nguồn / Version & review notes
- Preview public guide pages và member companion panel
- Validation cho script wording, species count matrix, warning blocks
- Publish action + audit summary

---

### 4.8 Media Management

| Route | `/admin/noi-dung/media` | Auth | `admin+` |
|---|---|---|---|
| Module | Content |

**Nội dung:**
- Grid view media assets
- Upload button (with drag-and-drop)
- Filter: type / status (pending/approved/quarantined)
- Delete button (với authorization check)
- Scan status indicator

### 4.8a Media Library Workspace

| Route | `/admin/noi-dung/thu-vien-phap-mon` | Auth | `admin+` |
|---|---|---|---|
| Module | Content |

**Nội dung:**
- Tabs: Tổng quan / Collections / Items / Featured slots / Nguồn & quyền sử dụng / Publish
- Preview hub `/thu-vien/phap-mon`
- Validation cho item types, external video domains, owner refs
- Publish action + audit summary

---

### 4.9 Community Management

| Route | `/admin/cong-dong/bai-dang` | Auth | `admin+` |
|---|---|---|---|
| Module | Community + Moderation |

**Nội dung:**
- Tabs: Bài đăng / Bình luận / Sổ lưu niệm
- Each tab: data table với status, report count, actions
- Quick hide/show toggle
- Link sang Kiểm duyệt

---

### 4.10 Moderation Queue

| Route | `/admin/kiem-duyet/bao-cao` | Auth | `admin+` |
|---|---|---|---|
| Module | Moderation |

**Nội dung:**
- Reports list (pending priority)
- Each report: target content preview, reason, reporter, date
- Actions: Resolve (hide / warn / ignore) + note
- Re-resolve history
- Filter: status / target type / date

---

### 4.11 User Management

| Route | `/admin/nguoi-dung` | Auth | `admin+` |
|---|---|---|---|
| Module | Identity |

**Nội dung:**
- Users table: email, name, role, status, joined date
- Search/filter
- Click row → user detail (sessions, activity summary)
- Block/unblock toggle (super-admin: promote role)

---

### 4.12 Calendar Management

| Route | `/admin/he-thong/lich` | Auth | `admin+` |
|---|---|---|---|
| Module | Calendar |

**Nội dung:**
- Events table (title, date, type, status)
- "Tạo sự kiện" button
- Lunar override management
- Advisory preview theo ngày/rule family
- Projection status + inspect panel cho read-model
- Trigger advisory refresh button

### 4.12a Event Detail Workspace

| Route | `/admin/he-thong/lich/[eventId]` | Auth | `admin+` |
|---|---|---|---|
| Module | Calendar |

**Nội dung:**
- Tabs: Thông tin chung / Lịch trình / Diễn giả / CTA & liên kết / Ảnh & file / Xuất bản
- Agenda table editor với sort order
- Speaker roster editor
- CTA manager: đăng ký, bản đồ, livestream, file chương trình
- Preview public detail page
- Publish action + audit summary

### 4.12b Search Operations

| Route | `/admin/he-thong/tim-kiem` | Auth | `admin+` |
|---|---|---|---|
| Module | Search |

**Nội dung:**
- Engine status: SQL fallback / Meilisearch / sync freshness
- Source cards: posts / guides / wisdom / little-house guides
- Reindex toàn bộ hoặc theo source
- Recent reindex log + error summary

### 4.12c Notification Operations

| Route | `/admin/he-thong/thong-bao` | Auth | `admin+` |
|---|---|---|---|
| Module | Notification |

**Nội dung:**
- Queue health, pending/processing/failed counts
- Recent push jobs table
- Job detail drawer: targeting, sent/failed counts, error summary
- Actions: create manual job, process, redrive

---

### 4.13 Wisdom-QA Management

| Route | `/admin/noi-dung/bach-thoai` | Auth | `admin+` |
|---|---|---|---|
| Module | Wisdom-QA |

**Nội dung:**
- Wisdom entries table (title, type, review status, source)
- Filter: review status / type / tag
- "Thêm bài" button
- Ingestion status + trigger button
- Offline bundle rebuild button
- Baihua audiobook import queue / translation review

---

### 4.14 System Management

| Route | `/admin/he-thong` | Auth | `admin+` (feature-flags: super-admin) |
|---|---|---|---|
| Module | Platform |

**Tabs:**
- Audit Log — searchable, filterable log entries
- Feature Flags — toggle on/off per flag (super-admin only)
- Health — live health status display
- Metrics — basic metrics dashboard

---

### 4.15 Volunteer Management (Quản lý Phụng Sự Viên)

| Route | `/admin/he-thong/phung-su-vien` | Auth | `admin+` |
|---|---|---|---|
| Module | Contact |

**Nội dung:**
- Data table: tên, vai trò, Zalo link, active/inactive, sort order
- "Thêm PSV" button
- Drag-and-drop sort order
- Toggle active/inactive
- Upload avatar
- Click row → edit detail (modal hoặc inline)

### 4.16 Assisted Entry Support (Nhập hộ phát nguyện / phóng sanh)

| Route | `/admin/ho-tro/phat-nguyen/nhap-ho` | Auth | `admin+` |
|---|---|---|---|
| Module | Vows-Merit |

**Nội dung:**
- Chọn member owner
- Tabs: Ghi phóng sanh hộ / Ghi tiến độ nguyện hộ / Lịch sử nhập hộ
- Form có `assistReason` bắt buộc
- Confirmation step trước submit
- Audit badge rõ actor/owner

---

## V. Page Count Summary

| Section | Count |
|---|---|
| Public pages | 25 |
| Auth pages | 5 |
| Member pages | 14 |
| Admin pages | 22 |
| **Total** | **66 pages** |

---

## Mobile-first priorities (Ưu tiên mobile-first)

Các trang **phải** perfect trên mobile trước:
1. Login / Register
2. Dashboard
3. Daily Practice Sheet
4. Ngôi Nhà Nhỏ Sheet
5. Chant Item Detail (with audio player)
6. Search
7. Post Detail
8. Personal Calendar

Admin pages được phép desktop-first nhưng phải usable trên tablet.
