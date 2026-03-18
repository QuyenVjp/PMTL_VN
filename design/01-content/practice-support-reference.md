# Practice Support Reference

> Ghi chú cho sinh viên:
> File này là cầu nối giữa tài liệu tu học PDF và design của repo.
> Hãy xem nó như “bản dịch nghiệp vụ” từ tài liệu giấy sang cấu trúc app.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Practice Support Reference

## Mục đích
- gom các tài liệu hướng dẫn niệm, phát nguyện, phóng sinh, và Ngôi Nhà Nhỏ vào một chỗ dễ đọc
- chỉ ra phần nào là logic nghiệp vụ có thể đưa vào app
- chỉ ra phần nào là nội dung hỗ trợ niệm nên giữ ở `content`
- giữ nhãn rõ cho nguồn trích xuất để không làm bẩn repo truth

## Generated extract output
- Pipeline local hiện đã xuất raw artifact vào:
  - `design/01-content/practice-pdf-extracts/README.md`
  - `design/01-content/practice-pdf-extracts/manifest.json`
- Mỗi PDF có:
  - `document.md`
  - `document.json`
  - thư mục `images/` chứa ảnh từng trang
- File đọc nhanh thêm:
  - `design/01-content/chant-items-catalog.md`
  - `design/01-content/practice-ui-checklists.md`
  - `design/01-content/little-house-spec.md`

## Quy ước nguồn trích xuất

### Cách hiểu các nhãn
- `source_type`: loại nguồn, ví dụ PDF có text hay PDF scan
- `extraction_method`: cách rút nội dung vào design
- `confidence`: độ tin cậy của phần tóm tắt hiện tại
- `needs_review`: có cần người thật rà lại trước khi code/chốt UI không

### Quy tắc dùng trong repo
- nếu tài liệu cho ra danh sách bài niệm, số biến, lời khấn mẫu, time rule:
  - ưu tiên map vào `chantItems`, `chantPlans`, `downloads`, `beginnerGuides`
- nếu tài liệu cho ra checklist hoặc state machine thực hành:
  - ưu tiên map vào flow design, validation rule, checklist UI
- nếu tài liệu chỉ là script kinh/chú để đọc tụng:
  - xem là content hỗ trợ niệm, không phải user-state

## Source inventory

### 1. Các bước niệm kinh bài tập hằng ngày
- `source_path`: `D:/downloadALL/brave-download/KINH SACH VA HD/1. Các bước niệm kinh bài tập (cho người mới bắt đầu)_V2 12.2017.pdf`
- `source_type`: `text_pdf`
- `extraction_method`: `text parse + user-confirmed summary`
- `confidence`: `high`
- `needs_review`: `false`
- Rút ra được:
  - onboarding cho người mới
  - danh sách bài niệm cốt lõi
  - purpose của từng bài
  - `recommended_count`
  - lưu ý thời gian niệm
  - prayer template hoặc opening intention

### 2. Sách kinh
- `source_path`: `D:/downloadALL/brave-download/KINH SACH VA HD/2.Sách kinh.pdf`
- `source_type`: `mixed_text_and_scan_pdf`
- `extraction_method`: `partial text parse + visual reading khi cần`
- `confidence`: `medium`
- `needs_review`: `true`
- Rút ra được:
  - danh mục kinh/chú dùng để hỗ trợ niệm
  - script content cho `chantItems`
  - preview image / script file cho reader UI
  - ghi chú:
    - nên xem theo chế độ `image-first`
    - không nên tin tuyệt đối OCR lẫn Hán tự / phiên âm

### 3. Trình tự thắp tâm hương
- `source_path`: `D:/downloadALL/brave-download/KINH SACH VA HD/3. Trình tự thắp tâm hương(上心香的程序).pdf`
- `source_type`: `text_pdf`
- `extraction_method`: `text parse + user-confirmed summary`
- `confidence`: `high`
- `needs_review`: `false`
- Rút ra được:
  - flow từng bước
  - quán tưởng / niệm thầm / số lần niệm
  - opening ritual trước khi vào công khóa

### 4. Trình tự phát nguyện
- `source_path`: `D:/downloadALL/brave-download/KINH SACH VA HD/4.Trình tự phát nguyện.pdf`
- `source_type`: `text_pdf`
- `extraction_method`: `text parse + user-confirmed summary`
- `confidence`: `high`
- `needs_review`: `false`
- Rút ra được:
  - mẫu khấn
  - nguyên tắc phát nguyện
  - guardrail về nội dung cầu xin

### 5. Nghi thức phóng sinh
- `source_path`: `D:/downloadALL/brave-download/KINH SACH VA HD/5. Nghi thức phóng sinh Pháp Môn tâm Linh (心灵法门放生仪式).pdf`
- `source_type`: `text_pdf`
- `extraction_method`: `text parse + user-confirmed summary`
- `confidence`: `high`
- `needs_review`: `false`
- Rút ra được:
  - flow `cảm ân -> niệm kinh -> cầu nguyện -> phóng sinh -> cảm ân`
  - biến thể theo đối tượng / tình huống
  - checklist thực hành

### 6. Phương pháp tụng niệm Ngôi Nhà Nhỏ
- `source_path`: `D:/downloadALL/brave-download/KINH SACH VA HD/6. Phương pháp tụng niệm NGÔI NHÀ NHỎ và những điều cần lưu ý (小房子念誦方法與注意事項).pdf`
- `source_type`: `mixed_text_and_scan_pdf`
- `extraction_method`: `text parse + visual transcription + manual structuring`
- `confidence`: `high`
- `needs_review`: `true`
- Rút ra được:
  - logic chuẩn bị người nhận
  - cách ghi `Kính Tặng / Tặng`
  - trình tự tụng theo cụm
  - cách chấm hoàn thành bằng bút đỏ
  - logic đốt theo bối cảnh có/không có bàn thờ
  - lời khấn trước/sau khi đốt

### 7. Quy trình đốt Ngôi Nhà Nhỏ không có bàn thờ
- `source_path`: `D:/downloadALL/brave-download/KINH SACH VA HD/7. Quy trình đốt ngôi nhà nhỏ không có bàn thờ PMTL.pdf`
- `source_type`: `scanned_image_pdf`
- `extraction_method`: `visual transcription + manual structuring`
- `confidence`: `medium`
- `needs_review`: `true`
- Rút ra được:
  - infographic checklist
  - flow đốt không có bàn thờ
  - cue rất hợp cho UI stepper / checklist / validation copy

## Business flows có thể đưa vào app

> Xem sơ đồ nhanh ở `design/01-content/practice-support-flows.mmd`.

### daily-recitation-flow
- use case:
  - công khóa hằng ngày cho người mới
- owner data:
  - `chantPlans`
  - `chantItems`
- user-state liên quan:
  - `chantPreferences`
  - `practiceLogs`
- UI gợi ý:
  - onboarding plan picker
  - checklist từng bài
  - preset `recommended_count`

### mental-incense-flow
- use case:
  - bước mở đầu trước công khóa hoặc trước nghi thức khác
- owner data:
  - `chantItems.openingPrayer`
  - `downloads` hoặc `media` cho script card / printable guide
- UI gợi ý:
  - stepper ngắn 3-5 bước
  - chế độ “đọc chậm từng câu”

### vow-making-flow
- use case:
  - phát nguyện có mẫu khấn và giới hạn nội dung
- owner data:
  - `chantItems`
  - `beginnerGuides`
  - `downloads`
- UI gợi ý:
  - form có guardrail
  - warning text cho phần không nên cầu xin sai phạm vi

### life-release-flow
- use case:
  - nghi thức phóng sinh
- owner data:
  - `chantPlans`
  - `chantItems`
  - `downloads`
- UI gợi ý:
  - checklist trước khi đi
  - mode “ritual flow”
  - branch theo loại đối tượng / bối cảnh

### little-house-recitation-flow
- use case:
  - thực hành tụng Ngôi Nhà Nhỏ
- owner data:
  - `chantItems`
  - `chantPlans`
  - `downloads`
- user-state liên quan:
  - `practiceLogs`
- validation/UI gợi ý:
  - nhập người nhận
  - chọn kiểu `Kính Tặng / Tặng`
  - đánh dấu tiến độ theo cụm
  - rule hướng dẫn cách chấm đúng/sai

### little-house-burning-without-altar-flow
- use case:
  - đốt Ngôi Nhà Nhỏ trong ngữ cảnh không có bàn thờ
- owner data:
  - `downloads`
  - `beginnerGuides`
- UI gợi ý:
  - checklist step-by-step
  - cảnh báo điều kiện trước/sau khi đốt
  - mode xem infographic từng bước

## Mapping vào module hiện tại

### Content owns
- `chantItems`:
  - bài niệm / chú / script
  - purpose
  - `recommendedPresets`
  - `timeRules`
  - opening prayer
  - media preview / script file
- `chantPlans`:
  - tập hợp bài niệm theo plan
  - target mặc định
  - optional item
- `downloads`:
  - PDF hướng dẫn
  - bản in
  - tài liệu hỗ trợ nghi thức
- `beginnerGuides`:
  - giải thích cho người mới
  - guardrail thực hành

### Engagement references
- `chantPreferences`:
  - bật/tắt optional item
  - chỉnh target
  - lưu ý nguyện theo item
- `practiceLogs`:
  - ghi lại buổi niệm thực tế
  - đánh dấu item đã hoàn thành

### Calendar references
- `lunarEvents`
- `lunarEventOverrides`
- chỉ dùng practice support content làm input cho ngày đặc biệt hoặc override, không sở hữu script gốc

## Guideline rút ra cho UI và validation

### Data model hint
- mỗi bài niệm nên có:
  - `purpose`
  - `recommended_count`
  - `opening_prayer` hoặc `prayer_template`
  - `time_rules`
  - `notes`

### Guardrails
- không trộn công khóa hằng ngày với logics riêng của Ngôi Nhà Nhỏ
- không để user-state sửa script gốc của bài niệm
- với phần `Kính Tặng / Tặng`, cần copy giải thích rõ và validation text cụ thể
- các flow nghi thức cần có mode checklist thay vì chỉ rich text dài

### Human review priority
- ưu tiên rà lại:
  - phần wording mẫu khấn
  - số biến mặc định cho từng bài
  - các điều kiện đốt / không đốt
  - infographic “chấm đúng/sai” của Ngôi Nhà Nhỏ

## File nên đọc tiếp theo
- nếu muốn nhập dữ liệu vào `chantItems`:
  - đọc `design/01-content/chant-items-catalog.md`
- nếu muốn làm UI stepper/checklist:
  - đọc `design/01-content/practice-ui-checklists.md`
- nếu muốn làm riêng flow `Ngôi Nhà Nhỏ`:
  - đọc `design/01-content/little-house-spec.md`

## Assumption cần ghi nhớ
- File này chưa phải OCR full toàn bộ PDF.
- Nó dùng:
  - repo truth hiện có về `chantItems`, `chantPlans`, `chantPreferences`, `practiceLogs`
  - phần nội dung anh đã xác nhận parse được
  - cấu trúc hóa lại để phục vụ design
- Khi có pipeline đọc PDF/vision đầy đủ hơn, file này nên được update trước rồi mới lan sang schema/flow/UI.
