# Moderation Module

> Ghi chú cho sinh viên:
> Moderation không chỉ là nút "ẩn bài".
> Nó có record nguồn riêng để sau này còn audit và giải thích vì sao đã xử lý.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Moderation Module

## Mục tiêu
- giữ report lifecycle ở một owner duy nhất
- mô tả decision flow hiện có
- mô tả cách sync moderation summary về entity đích

## Collection thuộc module
- `moderationReports`

## Target entity hiện được hỗ trợ
- `postComments`
- `communityPosts`
- `communityComments`
- `guestbookEntries`

## Current responsibilities

### Report intake
- nhận lý do report
- lưu reporter user hoặc reporter IP hash
- gắn entity type / entity publicId / entity ref

### Moderation decision
- admin xem report
- cập nhật trạng thái report
- áp dụng decision lên target entity
- admin được re-resolve decision của admin khác nếu policy cho phép
- scope có bảo vệ `super-admin`; chỉ `super-admin` mới được override phần protected này

### Summary sync
- cập nhật `reportCount`
- cập nhật `lastReportReason`
- cập nhật `moderationStatus` hoặc `approvalStatus`
- cập nhật `isHidden` khi cần

### Notifications
- alert admin/super-admin khi có report mới
- notify affected user khi có moderation decision nếu flow gọi notification module
- signal quan trọng nên phát qua `outbox_events`

## Current boundaries

### Moderation owns
- report records
- decision state của report

### Moderation does not own
- content/community entity canonical fields ngoài phần moderation summary
- user identity authority
- push delivery state

## Current rules
- `moderationReports` là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)
- target entity giữ summary fields để tối ưu read path
- guestbook dùng approval workflow nhẹ hơn comment/community content
- re-resolve hợp lệ phải để lại audit trail mới, không xóa lịch sử cũ
- `admin` không được thao tác trong `super-admin protected scope`
- canonical report/decision đi trước; alert/notify đi sau qua outbox
- target summary phải recompute được từ report source khi recovery

