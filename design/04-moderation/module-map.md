# Moderation Module

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
- moderator xem report
- cập nhật trạng thái report
- áp dụng decision lên target entity

### Summary sync
- cập nhật `reportCount`
- cập nhật `lastReportReason`
- cập nhật `moderationStatus` hoặc `approvalStatus`
- cập nhật `isHidden` khi cần

### Notifications
- alert moderator/admin khi có report mới
- notify affected user khi có moderation decision nếu flow gọi notification module

## Current boundaries

### Moderation owns
- report records
- decision state của report

### Moderation does not own
- content/community entity canonical fields ngoài phần moderation summary
- user identity authority
- push delivery state

## Current rules
- `moderationReports` là source of truth
- target entity giữ summary fields để tối ưu read path
- guestbook dùng approval workflow nhẹ hơn comment/community content
