# Little House Spec

> Ghi chú cho sinh viên:
> File này là spec riêng cho `Ngôi Nhà Nhỏ`.
> Mục tiêu là để sau này làm UI, validation, collection fields, hoặc flow service (lớp xử lý nghiệp vụ) mà không phải đọc lại PDF từ đầu.
> Logic thực thi và schema (lược đồ dữ liệu) self-owned mới nhất xem thêm ở:
>
> - `design/03-engagement/schema.dbml`
> - `design/03-engagement/use-cases/manage-ngoi-nha-nho-sheet.md`

---

markmap:
colorFreezeLevel: 2
initialExpandLevel: 3

---

# Little House Spec

## 1. Scope

### In scope

- flow chuẩn bị trước khi tụng
- `chant items` / prayer templates liên quan
- validation cho `Kính Tặng` / `Tặng`
- flow đốt không có bàn thờ
- review flags cho phần cần người thật rà lại

### Out of scope

- viết code collection ngay
- contract (hợp đồng dữ liệu/nghiệp vụ) API cuối cùng
- OCR full của toàn bộ bản script gốc

## 2. Source of evidence

### Primary sources

- `6. Phương pháp tụng niệm NGÔI NHÀ NHỎ và những điều cần lưu ý`
- `7. Quy trình đốt ngôi nhà nhỏ không có bàn thờ PMTL`

### Generated extracts

- `design/01-content/practice-pdf-extracts/6-phuong-phap-tung-niem-ngoi-nha-nho-va-nhung-ieu-can-luu-y/document.md`
- `design/01-content/practice-pdf-extracts/7-quy-trinh-ot-ngoi-nha-nho-khong-co-ban-tho-pmtl/document.md`

## 3. Owner boundary (ranh giới trách nhiệm)

### Content owns

- prayer templates
- ritual guides
- checklist content
- script / printable reference
- explanation copy cho người mới

### Engagement owns

- trạng thái người dùng đang chuẩn bị hay đã hoàn tất
- draft session của user
- practice logs
- cờ `ready_to_burn` / `burned` nếu sau này cần lưu theo user

## 4. Chant items liên quan

### A. Mẫu thỉnh cầu trước khi tụng Ngôi Nhà Nhỏ

- `kind`: `prayer-template`
- `purpose`: mở đầu trước khi bắt đầu tụng
- `recommended_count`:
  - `3` lần cho câu niệm mở đầu
  - `1` lần cho lời thỉnh cầu chính
- `openingPrayer`:
  - “Nam mô đại từ đại bi, cứu khổ cứu nạn, quảng đại linh cảm Quán Thế Âm Bồ Tát Ma Ha Tát.” `3` lần
- `timeRules`:
  - chỉ dùng sau khi điền xong `Kính Tặng` và `Tặng`
- `needs_review`: `false`

### B. Mẫu khấn chuyển tặng trước khi đốt

- `kind`: `prayer-template`
- `purpose`: khấn trước khi đốt để chuyển số lượng tấm cho người nhận
- `recommended_count`:
  - `1` lần trước đốt
- `openingPrayer`:
  - nêu rõ họ tên người đốt, số lượng tấm, người tiếp nhận
- `timeRules`:
  - dùng khi chuyển sang step đốt
- `needs_review`: `true`
  - wording cần rà tay thêm

### C. Mẫu cảm tạ / kết thúc sau khi đốt

- `kind`: `closing-prayer`
- `purpose`: khép lại flow đốt
- `recommended_count`:
  - `1` lần
- `openingPrayer`:
  - cảm tạ và xác nhận việc chuyển tặng hoàn tất
- `timeRules`:
  - chỉ dùng sau khi đốt xong
- `needs_review`: `true`

### D. Nhóm bài niệm cấu thành Ngôi Nhà Nhỏ

- `kind`: `little-house-components`
- ghi chú:
  - bản PDF hiện xác nhận có flow và validation rõ
  - nhưng chưa chốt tại đây danh sách từng bài + số biến cuối cùng nếu extract trang biểu đồ chưa sạch hoàn toàn
- `needs_review`: `true`

## 5. Flow spec

### Flow 1. Preparation

1. Chọn loại người nhận
2. Điền `Kính Tặng`
3. Điền `Tặng`
4. Kiểm tra ngoại lệ “Ngôi Nhà Nhỏ tích lũy”
5. Hiện lời thỉnh cầu trước khi tụng

### Flow 2. Recitation

1. Nhắc user nên bắt đầu bằng `Chú Đại Bi` trong phần công khóa để tăng năng lực
2. Bắt đầu tụng theo cụm
3. Theo dõi tiến độ từng cụm
4. Chấm hoàn thành đúng cách

### Flow 3. Ready to burn

1. Xác nhận tấm đã trì xong
2. Kiểm tra người nhận vẫn đúng
3. Chuyển sang mode đốt:
   - có bàn thờ
   - không có bàn thờ

### Flow 4. Burning without altar

1. Chuẩn bị tấm đã trì và vật dụng đốt
2. Thắp tâm hương
3. Cảm tạ `3` lần
4. Niệm `Chú Đại Bi` `1` và `Tâm Kinh` `1`
5. Nâng tấm lên trước trán, quán tưởng
6. Đọc câu thỉnh cầu chuyển tặng
7. Đốt từ góc phải phía trên
8. Không niệm kinh, không nói chuyện trong lúc đốt
9. Khấn kết thúc
10. Xử lý tro theo hướng dẫn

## 6. Validation rules

### Required fields

- `recipientType` bắt buộc
- `recipientLabel` bắt buộc
- `giverName` bắt buộc

### Rule set

- không được bắt đầu tụng nếu thiếu `Kính Tặng`
- không được bắt đầu tụng nếu thiếu `Tặng`
- cần warning nếu `recipientLabel` quá mơ hồ
- cần helper text giải thích:
  - `Kính Tặng` = người nhận
  - `Tặng` = người tụng

### Validation copy gợi ý

- “Bạn cần điền rõ `Kính Tặng` trước khi bắt đầu tụng.”
- “Bạn cần điền rõ `Tặng` là tên người đang tụng.”
- “Nếu đây không phải trường hợp tích lũy, không để trống phần người nhận.”

## 7. Burning rules

### Before burning

- chuẩn bị tấm đã trì và đã chấm
- chuẩn bị phong bì đỏ / túi đỏ và vật dụng đốt
- chọn đúng flow “không có bàn thờ” nếu bối cảnh đó là thật

### During burning

- đốt từ góc phải phía trên
- không niệm kinh trong lúc đốt
- không nói chuyện trong lúc đốt
- chỉ giữ câu xin từ bi ngắn theo hướng dẫn nếu cần

### After burning

- đọc lời khấn kết thúc
- tro bỏ vào khăn giấy hoặc phong thư gấp nhỏ
- xử lý như rác sinh hoạt gia đình theo tài liệu

## 8. UI spec gợi ý

### Main screens

- `little-house-preparation-screen`
- `little-house-recitation-screen`
- `little-house-marking-guide-screen`
- `little-house-burning-screen`

### Best-fit components

- stepper
- checklist card
- prayer script panel
- warning banner
- image compare panel cho “chấm đúng / sai”

### Suggested states

- `draft_preparation`
- `ready_to_recite`
- `in_progress`
- `marked_complete`
- `ready_to_burn`
- `burned`

## 9. schema (lược đồ dữ liệu) hints

### Content-side hints

- `chantItems`
  - `kind`
  - `openingPrayer`
  - `recommendedPresets`
  - `timeRules`
  - `scriptPreviewImages`
- `downloads`
  - PDF hướng dẫn gốc
  - bản in / infographic

### Engagement-side hints

- `practiceLogs`
  - `recipientType`
  - `recipientLabel`
  - `giverName`
  - `sessionState`
  - `isReadyToBurn`
  - `burnedAt`

## 10. Review flags

### High priority review

- wording chính xác của câu khấn trước khi đốt
- wording câu khấn kết thúc
- phần hình minh họa chấm đúng / sai
- danh sách chi tiết các bài cấu thành Ngôi Nhà Nhỏ và số biến cuối cùng

### Medium priority review

- copy helper cho người mới
- warning text tránh hiểu sai “tích lũy”

### Current confidence

- preparation flow: `high`
- recitation guardrails: `high`
- burning without altar flow: `high`
- component chant item breakdown: `medium`

## 11. Assumption

- Spec này ưu tiên phần tiếng Việt sạch và logic flow.
- Chữ Hán và script gốc không được giữ làm nội dung chính trong spec.
- Khi cần làm màn hình chuẩn cuối cùng, vẫn nên đối chiếu lại ảnh trang từ thư mục extract.
