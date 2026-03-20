# Moderation Module Decisions (Các quyết định của mô-đun Kiểm duyệt)

> Ghi chú cho sinh viên:
> `moderationReports` mới là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất). Các cờ trên comment/post chỉ là summary fields (trường tóm tắt) để đọc nhanh.

---

## Decision 1. Dùng một moderation report source (nguồn báo cáo kiểm duyệt) thống nhất

### Context (Ngữ cảnh)
Nhiều loại thực thể có thể bị báo cáo: bài cộng đồng, bình luận, guestbook entry. Nếu mỗi chỗ tự giữ report riêng thì admin flow sẽ rất rối.

### Decision (Quyết định)
Toàn bộ vòng đời của report (báo cáo vi phạm) đi qua `moderationReports`.
Không tạo report table riêng cho từng mô-đun nội dung/cộng đồng.

### Rationale (Lý do)
- giữ admin workflow thống nhất
- giữ canonical record (bản ghi chuẩn gốc) ở một nơi duy nhất

---

## Decision 2. Thực thể đích chỉ giữ summary fields (trường tóm tắt)

### Context (Ngữ cảnh)
Public read path và admin listing thường cần biết nhanh nội dung có bị report nhiều không, có đang bị ẩn không.

### Decision (Quyết định)
Các field như:
- `reportCount`
- `lastReportReason`
- `moderationStatus`
- `approvalStatus`
- `isHidden`

chỉ là read-model summaries (phần tóm tắt cho đường đọc), không thay cho `moderationReports`.

### Rationale (Lý do)
- tăng tốc bề mặt đọc dữ liệu
- không làm mất lịch sử quyết định thực sự

---

## Decision 3. Resolution effect (hiệu lực xử lý) được áp lên target entity

### Context (Ngữ cảnh)
Moderator cần hành động có hiệu lực rõ ràng lên nội dung bị báo cáo.

### Decision (Quyết định)
Khi report được resolve (xử lý xong):
- comment/community target có thể đổi `moderationStatus`, `isHidden`
- guestbook target có thể đổi `approvalStatus`

Nhưng các thay đổi này luôn phải có thể truy ngược về `moderationReports`.

### Rationale (Lý do)
- bề mặt public cần đọc trạng thái nhanh
- admin vẫn cần root record (bản ghi gốc) để audit/review

---

## Decision 4. Reporter identity (định danh người báo cáo) phải được giảm lộ danh tính

### Context (Ngữ cảnh)
Không phải report nào cũng đến từ user đã đăng nhập. Nhưng lưu raw IP làm canonical field là cách làm kém an toàn.

### Decision (Quyết định)
Report chỉ lưu:
- `reporterUser` nếu có user hợp lệ
- hoặc `reporterIpHash` nếu là anonymous report

Không lưu raw IP làm canonical moderation field.

### Rationale (Lý do)
- giảm rủi ro lộ dữ liệu nhạy cảm
- vẫn đủ dữ liệu để điều tra abuse cơ bản

---

## Decision 5. Không tạo moderation queue riêng ở current scope (phạm vi hiện tại)

### Context (Ngữ cảnh)
Hệ thống solo-dev không nên đẻ thêm escalation table (bảng leo thang) hay moderation queue riêng khi admin workspace đã có thể suy ra danh sách việc cần làm từ report status.

### Decision (Quyết định)
Current scope không có:
- `moderationQueue`
- `escalationQueue`

Admin work queue (hàng chờ công việc quản trị) sẽ được suy ra từ trạng thái report và summary của target.

### Rationale (Lý do)
- tránh enterprise process bloat (phình to quy trình kiểu doanh nghiệp) quá sớm
- giảm bề mặt vận hành

---

## Decision 6. Tín hiệu quan trọng đi qua outbox; summary phải recompute được

### Context (Ngữ cảnh)
Báo cáo mới, quyết định xử lý, và thông báo kết quả đều là side-effect quan trọng với nhiều mô-đun khác.

### Decision (Quyết định)
- ghi `moderationReports` trước
- signal quan trọng như admin alert hoặc user notification phải đi qua `outbox_events`
- summary trên target phải recompute được từ `moderationReports` khi drift xảy ra

### Rationale (Lý do)
- giữ reliability (độ tin cậy) cho tín hiệu quan trọng
- có recovery path (đường phục hồi) rõ nếu summary bị lệch
