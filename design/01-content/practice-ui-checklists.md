# Practice UI Checklists

> Ghi chú cho sinh viên:
> File này viết theo kiểu “nếu làm UI thì cần hiện gì”.
> Mục tiêu là biến PDF nghi thức thành checklist, stepper, validation copy và trạng thái hoàn thành.

# Practice UI Checklists

## 1. Little House Recitation UI

### Mục tiêu màn hình
- giúp user không tụng sai thứ tự chuẩn bị
- giảm lỗi điền `Kính Tặng / Tặng`
- tách rõ:
  - chuẩn bị
  - tụng
  - chấm hoàn thành
  - chuẩn bị đốt

### Input cần có
- `recipientType`
  - người cần kinh
  - người quá cố
  - thai nhi
  - người cần kinh trong nhà
  - hóa giải oán kết
- `recipientLabel`
  - text bắt buộc cho phần `Kính Tặng`
- `giverName`
  - text bắt buộc cho phần `Tặng`
- `intentionText`
  - optional note để user tự nhớ mục đích
- `sheetCount`
  - số tấm dự định chuẩn bị / chuyển tặng

### Stepper đề xuất
1. Chuẩn bị thông tin
2. Điền `Kính Tặng`
3. Điền `Tặng`
4. Đọc lời thỉnh cầu trước khi tụng
5. Tụng theo cụm
6. Chấm hoàn thành đúng cách
7. Chuyển sang flow đốt hoặc lưu lại để đốt sau

### Validation rules
- không cho qua bước nếu thiếu `Kính Tặng`
- không cho qua bước nếu thiếu `Tặng`
- cảnh báo nếu `recipientLabel` quá ngắn hoặc mơ hồ
- copy hướng dẫn phải nhấn mạnh:
  - Ngôi Nhà Nhỏ tích lũy là ngoại lệ hiếm, không để mặc định
  - phần `Kính Tặng` và `Tặng` phải rõ trước khi tụng

### UI copy gợi ý
- helper text:
  - “Phần `Kính Tặng` là người nhận Ngôi Nhà Nhỏ.”
  - “Phần `Tặng` là tên người đang tụng.”
- warning text:
  - “Không bắt đầu tụng nếu chưa điền rõ người nhận và người tụng.”

### Checklist chấm hoàn thành
- có ảnh minh họa đúng/sai
- có checkbox xác nhận:
  - đã chấm đúng ô
  - không chấm nhầm
  - không gấp tờ sai cách trước khi hoàn tất

### State machine gợi ý
- `draft_preparation`
- `ready_to_recite`
- `in_progress`
- `marked_complete`
- `ready_to_burn`
- `burned`

### Review flags
- `needs_review`: `true`
- lý do:
  - phần ảnh “chấm đúng/sai” còn nên đối chiếu thêm bằng mắt
  - wording câu khấn trước khi tụng cần giữ rất chuẩn

## 2. Little House Burning Without Altar UI

### Mục tiêu màn hình
- biến infographic thành checklist step-by-step dễ làm theo
- tránh user vừa đốt vừa phải đọc một khối text dài

### Stepper đề xuất
1. Chuẩn bị tấm đã trì và vật dụng đốt
2. Thắp tâm hương
3. Cảm tạ `3` lần
4. Niệm `Chú Đại Bi` `1` và `Tâm Kinh` `1`
5. Nâng tấm lên trước trán và quán tưởng
6. Đọc câu thỉnh cầu chuyển tặng
7. Đốt từ góc phải phía trên
8. Không nói chuyện / không niệm kinh khi đang đốt
9. Khấn kết thúc và xử lý tro

### Guardrails
- trong lúc đốt:
  - không niệm kinh
  - không nói chuyện
- bắt buộc hiển thị rõ:
  - đốt từ góc phải phía trên
  - tro xử lý như rác sinh hoạt gia đình theo hướng dẫn tài liệu

### UI blocks nên có
- `before_you_start`
- `while_burning`
- `after_burning`
- `important_do_not`

### Review flags
- `needs_review`: `true`
- lý do:
  - flow nhạy cảm, phải rà lại wording khấn và note thao tác

## 3. Life Release UI

### Mục tiêu màn hình
- hỗ trợ nghi thức phóng sinh theo flow thật
- tách rõ phần:
  - đi trên đường
  - tại điểm phóng sinh
  - cho bản thân / thay người khác

### Stepper đề xuất
1. Chuẩn bị và lên đường
2. Niệm trên đường đi
3. Cảm ân
4. Niệm kinh
5. Chọn loại lời khấn
6. Phóng sinh
7. Cảm ân kết thúc

### Branching UI
- branch `for_self`
- branch `for_other_person`
- khác nhau ở câu khấn nguyện

### Checklist trước khi đi
- chọn nơi phù hợp
- tránh tiếp tay việc săn bắt
- chuẩn bị số lượng / đối tượng cần phóng sinh
- xác định khấn cho bản thân hay cho người khác

### Item checklist tại địa điểm
- `Cảm ân` `3` lần
- `Chú Đại Bi` `1`
- `Tâm Kinh` `1`
- `Thất Phật Diệt Tội Chân Ngôn` `7`
- đọc đúng mẫu khấn theo ngữ cảnh

### UI copy gợi ý
- “Nếu chưa thuộc kinh, có thể niệm liên tục thánh hiệu theo hướng dẫn.”
- “Khi phóng sinh thay người khác, tốt nhất dùng tiền của đối phương nếu có thể.”

### Review flags
- `needs_review`: `true`
- lý do:
  - phần wording mẫu khấn nên giữ chính xác
  - phần ethical checklist nên được biên tập thật rõ, tránh hiểu máy móc

## 4. Mapping vào component/data model

### Suggested data blocks
- `ritual_steps`
- `required_items`
- `opening_prayer`
- `closing_prayer`
- `warnings`
- `review_flags`
- `evidence_source`

### Suggested screen types
- `ritual-stepper`
- `checklist-card`
- `prayer-script-view`
- `image-proof-view`

## 5. Assumption
- Checklist này dựa trên các tài liệu:
  - `5. Nghi thức phóng sinh...`
  - `6. Phương pháp tụng niệm Ngôi Nhà Nhỏ...`
  - `7. Quy trình đốt ngôi nhà nhỏ không có bàn thờ...`
- Nó là design/UI guidance, chưa phải contract API cuối cùng.
