# source provenance (tầng nguồn gốc dữ liệu) Matrix

File này chốt `nguồn gốc dữ liệu / data provenance (nguồn gốc dữ liệu)` cho các bài `Bạch thoại Phật pháp`, `Khai thị`, `Huyền học vấn đáp`, bài giới thiệu pháp môn, và các rule thực hành.

Mục tiêu:

- không trộn lẫn `nguồn gốc chính thức` với `bản dịch cộng đồng`
- cho phép cộng đồng Việt cùng dịch và kiểm duyệt
- vẫn giữ được một lớp `source-backed` để AI/codegen không tự bịa nội dung

## Tại sao phải có file này

Trong PMTL_VN, một bài thực tế thường có nhiều lớp:

- bài gốc Hoa
- bài mirror hoặc site chính thức khác của cùng pháp môn
- bản dịch Việt của phụng sự viên
- chú thích hoặc ghi chú cộng đồng
- hình ảnh / ảnh chụp nguồn để đối chiếu

Nếu không tách provenance (nguồn gốc dữ liệu) rõ, rất dễ xảy ra:

- dịch nhầm nhưng tưởng là bài gốc
- dùng web cộng đồng như source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)
- search trả lẫn bài chính thức với bản bình luận
- AI lấy một đoạn annotation rồi xem như khai thị gốc

## Source tiers / Các tầng nguồn

### 1. `official_origin` | Nguồn gốc chính thức

Là bài gốc được xem là nguồn chuẩn cao nhất hiện có.

Ví dụ:

- `lujunhong2or.com`
- `guanyincitta.com`

### 2. `official_mirror` | Nguồn chính thức dạng mirror / chi nhánh

Là site cùng hệ thống, cùng nội dung chính thống, nhưng không phải root domain mà user Việt thường biết trước.

Ví dụ:

- `orientalradio.com.sg`
- một site chính thức địa phương thuộc cùng pháp môn

### 3. `community_volunteer_site` | Web phụng sự viên / web cộng đồng

Là site phục vụ truyền tải, chia sẻ, hoặc hỗ trợ người Việt.

Ví dụ:

- site nhóm phụng sự viên Việt Nam
- link cộng đồng kiểu `gyph.org` nếu dùng để dẫn nhập hoặc chia sẻ bài đã dịch

### 4. `community_translation` | Bản dịch cộng đồng

Là bản dịch do phụng sự viên hoặc cộng đồng thực hiện.

### 5. `community_annotation` | Chú thích / ghi chú cộng đồng

Là phần cộng đồng thêm vào để giải thích, tóm lược, hoặc hướng dẫn đọc.

### 6. `testimonial_or_claim` | Chia sẻ linh nghiệm / claim / lời kể

Là các nội dung chứng nghiệm, nhận định, hoặc claim không phải bài gốc chuẩn hóa.

## Required fields theo loại nguồn

### Với `official_origin` hoặc `official_mirror`

Phải có:

- `sourceUrl`
- `sourceSiteLabel`
- `sourceType`
- `sourceCode` nếu bài có mã/timestamp
- `originalTitle`
- `originalText` hoặc excerpt đủ dùng

### Với `community_translation`

Phải có thêm:

- `translatedTitle`
- `translatedText`
- `translationCredit` nếu policy cho phép
- `reviewStatus`
- relation về source gốc

### Với `community_annotation`

Phải có:

- relation sang entry gốc
- người viết hoặc nhóm viết nếu policy cho phép
- label rõ là `annotation`, không nhét vào body gốc

## review status (trạng thái kiểm duyệt) / Trạng thái kiểm duyệt

- `source_verified`
- `translated_draft`
- `translated_reviewed`
- `human_review_required`

## Cách map vào module

### `09-wisdom-qa`

Sở hữu:

- source-backed entry
- translation state
- screenshot/image ref của nguồn
- authority profile provenance (nguồn gốc dữ liệu)

### `06-calendar`

Không sở hữu bài gốc.

Chỉ được:

- đọc source-backed rule đã duyệt
- compose thành `daily practice advisory (thông báo hoặc gói hướng dẫn)`
- gắn `sourceRefs` để user bấm xem lại bài gốc

### `08-vows-merit`

Không sở hữu bài khai thị gốc.

Chỉ được:

- lưu `practiceRuleRefs` liên quan tới `phóng sanh`, `phát nguyện`
- tham chiếu sang entry đã được source-backed ở `09-wisdom-qa`

## Ví dụ mẫu nên coi là canonical pattern

### `shuohua20140808 08:56`

Nên được lưu với các lớp:

- `sourceCode`
  - `shuohua20140808 08:56`
- `sourceUrl`
  - bài transcript chính thức hoặc official mirror
- `originalQuestion`
- `originalAnswer`
- `translatedQuestion`
- `translatedAnswer`
- `tags`
  - `phóng sanh`
  - `Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni`
  - `same-day rule`
- `practiceRuleSummary`
  - sau khi phóng sanh có thể niệm 37 biến trong ngày hôm đó
- `reviewStatus`

### Thông báo ngày mùng 1 / rằm của phụng sự viên Việt Nam

Nên tách thành:

- source-backed rule refs từ bài gốc chính thức
- bản Việt đã duyệt
- `community_volunteer_site` chỉ giữ CTA, lời chúc, link hỗ trợ địa phương

## Notes for AI/codegen

- Đừng để một `community_volunteer_site` thay thế `official_origin`.
- Đừng gộp `bài gốc`, `bản dịch`, `annotation`, `testimony` vào cùng một field text.
- Với bài thực tế, ưu tiên format:
  - `nguyên văn gốc`
  - `bản dịch Việt`
  - `link gốc`
  - `ảnh nguồn`
  - `review status (trạng thái kiểm duyệt)`

