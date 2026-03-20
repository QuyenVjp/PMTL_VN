# Source-Backed Content Ingestion Plan

File này chốt cách nhập dữ liệu thật vào:

- `wisdomEntries`
- `qaEntries`
- `authorityProfiles`

Mục tiêu:

- để phụng sự viên nhập bài không phải đoán field
- để AI/codegen biết record nào là bắt buộc, record nào là optional
- để giữ chặt `source-backed` ngay từ lúc nhập dữ liệu

## Nguyên tắc chung

- Không nhập bài nếu chưa xác định được `source provenance (tầng nguồn)`.
- Không trộn `bài gốc`, `bản dịch`, `annotation (ghi chú)`, `testimony (chia sẻ linh nghiệm)` vào cùng một record gốc.
- Nếu là bài thực hành có rule cụ thể, phải trích riêng `practice rule extraction (trích xuất quy tắc thực hành)`.
- Nếu dùng web phụng sự viên Việt Nam, phải ghi rõ nó là:
  - `community_volunteer_site (web cộng đồng hỗ trợ)`
  - hoặc `community_translation (bản dịch cộng đồng)`

## Ingestion flow (luồng nhập dữ liệu) tổng quát

### Step 1. Xác định loại record

Chọn một trong ba loại:

- `wisdom entry (bài trí huệ / khai thị / Bạch thoại)`
- `qa entry (bài hỏi đáp / vấn đáp)`
- `authority profile (hồ sơ authority / nhân vật được giới thiệu)`

### Step 2. Xác định tầng nguồn

Chọn một trong các giá trị:

- `official_origin (nguồn gốc chính thức)`
- `official_mirror (nguồn chính thức dạng mirror)`
- `community_volunteer_site (web phụng sự viên)`
- `community_translation (bản dịch cộng đồng)`
- `community_annotation (ghi chú cộng đồng)`
- `testimonial_or_claim (chia sẻ hoặc claim)`

### Step 3. Chuẩn hóa source metadata

Bắt buộc điền:

- `sourceUrl`
- `sourceSiteLabel`
- `sourceCode` nếu bài có mã / timestamp
- `sourceLanguage`

### Step 4. Nhập nguyên văn gốc

Nếu có bài gốc hoặc transcript:

- `titleOriginal`
- `bodyOriginal`
- `questionOriginal`
- `answerOriginal`

### Step 5. Nhập bản Việt

Nếu đã có bản dịch:

- `titleVietnamese`
- `bodyVietnamese`
- `questionVietnamese`
- `answerVietnamese`
- `translationCredit`
- `reviewStatus`

### Step 6. Gắn tags và keyword aliases

- `topicTags`
- `problemTags`
- `keywordAliases`

### Step 7. Trích xuất rule thực hành nếu có

Ví dụ:

- rule số biến
- rule cùng ngày
- khung giờ không nên tụng
- điều kiện `có bàn thờ / không có bàn thờ`
- ngoại lệ cho phụ nữ mang thai hoặc đang ở cữ

Rule extraction phải giữ:

- `ruleType`
- `ruleSummaryVi`
- `sourceCode`
- `sourceUrl`
- `reviewStatus`

### Step 8. Publish gate

Chỉ được publish surface mặc định nếu:

- source provenance (tầng nguồn gốc dữ liệu) rõ
- source URL hợp lệ
- ít nhất có nguyên văn gốc hoặc excerpt gốc đủ dùng
- bản dịch đã ở trạng thái phù hợp

## Mapping chi tiết: `wisdomEntries`

### Khi nào dùng `wisdomEntries`

Dùng cho:

- `Bạch thoại Phật pháp`
- `Khai thị`
- `Phật ngôn Phật ngữ`
- `Bài pháp hội`
- bài audio/video có transcript hoặc entry text đi kèm

### Bắt buộc

- `publicId`
- `sourceUrl`
- `sourceSiteLabel`
- `sourceType`
- `sourceProvenance`
- `sourceLanguage`
- `titleOriginal`
- `reviewStatus`

### Nên có mạnh

- `sourceCode`
- `bodyOriginal`
- `titleVietnamese`
- `bodyVietnamese`
- `sourceImageRef`
- `translationCredit`
- `speaker`
- `publishedAt`

### Optional

- `audioRef`
- `videoRef`
- `summaryVietnamese`

### Ví dụ mapping

Nếu nhập một bài `Bạch thoại Phật pháp`:

- `sourceType = baihua`
- `titleOriginal = tên bài gốc`
- `titleVietnamese = tên bài dịch`
- `bodyOriginal = nguyên văn`
- `bodyVietnamese = bản dịch`
- `sourceProvenance = official_origin` hoặc `official_mirror`

## Mapping chi tiết: `qaEntries`

### Khi nào dùng `qaEntries`

Dùng cho:

- `Huyền học vấn đáp`
- `Phật học vấn đáp`
- transcript radio/Q&A
- bài có cấu trúc hỏi - đáp rõ

### Bắt buộc

- `publicId`
- `sourceUrl`
- `sourceSiteLabel`
- `qaType`
- `sourceProvenance`
- `questionOriginal`
- `answerOriginal`
- `reviewStatus`

### Nên có mạnh

- `sourceCode`
- `questionVietnamese`
- `answerVietnamese`
- `sourceImageRef`
- `translationCredit`
- `speaker`
- `publishedAt`

### Optional

- `keywordAliases`
- `topicTags`
- `problemTags`

### Rule extraction

Nếu Q&A có rule thực hành cụ thể, tạo thêm lớp phụ:

- `practiceRuleExtraction`
  - `ruleType`
  - `ruleSummaryVi`
  - `scope`
  - `countCap`
  - `timeWindow`
  - `householdCondition`
  - `exceptionAudience`

Q&A vẫn là owner của bài gốc; rule extraction chỉ là lớp phục vụ search, calendar, vows-merit.

## Mapping chi tiết: `authorityProfiles`

### Khi nào dùng `authorityProfiles`

Dùng cho:

- `Sư Phụ Lư Quân Hoành`
- authority profile liên quan pháp môn

### Bắt buộc

- `publicId`
- `displayNameVi`
- `sourceProvenance`
- `reviewStatus`

### Nên có mạnh

- `displayNameOriginal`
- `sourceUrl`
- `officialFactSummary`
- `translatedProfileSummary`
- `doctrinalClaims`

### Quy tắc tách field

- `officialFactSummary`
  - chỉ viết các fact có nguồn hoặc có thể đối chiếu
- `translatedProfileSummary`
  - phần giới thiệu tiếng Việt cho người dùng
- `doctrinalClaims`
  - các claim tín ngưỡng, khai thị, testimony đặc thù

Không được trộn 3 lớp này thành một đoạn văn duy nhất.

## Ingestion checklist (danh sách kiểm trước khi nhập dữ liệu) cho phụng sự viên

Trước khi bấm lưu một bài, kiểm:

- đây là `wisdom`, `qa`, hay `authority profile`
- đã có `sourceUrl` chưa
- đã xác định `sourceProvenance` chưa
- có nguyên văn gốc hoặc excerpt gốc chưa
- bản Việt là `draft` hay `reviewed`
- có cần ảnh chụp nguồn để peer review không
- có cần trích `practice rule extraction` không

## Ingestion policy (chính sách nhập dữ liệu) cho bài thực hành ngày đặc biệt

Nếu bài chứa logic như:

- số biến tối đa
- giờ không nên tụng
- phải thắp `Tâm hương`
- rule cho phụ nữ mang thai / ở cữ

thì phải nhập theo 2 lớp:

1. `qaEntries` hoặc `wisdomEntries`
   - giữ source-backed content
2. `practiceRuleExtraction`
   - giữ rule đã bóc tách để `Calendar` compose advisory (thông báo hoặc gói hướng dẫn)

## Example 1: `shuohua20140808 08:56`

### Into `qaEntries`

- `qaType = metaphysics_qa`
- `sourceCode = shuohua20140808 08:56`
- `sourceProvenance = official_mirror`
- `questionOriginal = ...`
- `answerOriginal = ...`
- `questionVietnamese = ...`
- `answerVietnamese = ...`
- `reviewStatus = translated_reviewed`

### Into `practiceRuleExtraction`

- `ruleType = life_release_follow_up`
- `ruleSummaryVi = Sau khi phóng sanh có thể niệm 37 biến ... trong ngày hôm đó`
- `scope = same_day_after_event`
- `countCap = 37`

## Example 2: bài thông báo `mùng 1 tháng 2 âm lịch`

### Source-backed layer

Không lưu nguyên bài thông báo cộng đồng như canonical rule duy nhất.

Phải tách:

- rule gốc từ bài Q&A / khai thị chính thức
- phần dịch Việt
- link phụng sự viên địa phương nếu có

### Advisory layer (lớp thông báo hoặc gói hướng dẫn)

`Calendar` sẽ compose:

- `announcementCopy`
- `recitationRules`
- `timeWindowRules`
- `householdConditions`
- `exceptionRules`
- `sourceRefs`

## Notes for AI/codegen

- Đừng biến ingestion (nhập dữ liệu) thành một form text duy nhất.
- Nên có UI nhập liệu theo block:
  - source
  - original
  - translation
  - tags
  - rule extraction
  - review
- `source-backed content` phải nhập một lần đúng, còn `daily advisory (thông báo hoặc gói hướng dẫn)` là lớp downstream được tính ra.
