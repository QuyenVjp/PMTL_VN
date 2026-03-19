# Community Module

> Ghi chú cho sinh viên:
> Community là nơi chứa bề mặt thảo luận và đóng góp của người dùng.
> Nhưng report và quyết định xử lý vi phạm lại thuộc moderation module.

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# Community Module

## Mục tiêu
- mô tả các bề mặt thảo luận và đóng góp công khai
- giữ ranh giới rõ giữa community ownership và moderation ownership
- bám đúng collection hiện có trong repo

## Collections thuộc module

### Discussion on editorial content
- `postComments`

### Community forum-like surfaces
- `communityPosts`
- `communityComments`

### Lightweight public wall
- `guestbookEntries`

## Current responsibilities

### Reader interaction
- bình luận dưới bài viết
- thảo luận dưới bài cộng đồng
- reply theo thread

### Community submissions
- tạo bài cộng đồng
- gửi cảm nhận / hỏi đáp
- gửi lời nhắn guestbook

### Public-facing counters
- `commentsCount`
- `likes`
- `views`

### Moderation initiation
- cho phép user gửi report
- sync report sang moderation module

## References ra ngoài module

### Identity
- `authorUser`
- `submittedByUser`
- author name snapshot

### Content
- `postComments.post`

### Moderation
- community không sở hữu report source-of-truth
- community chỉ giữ moderation summary fields trên entity

### Notification
- submit/report flow có thể tạo async (bất đồng bộ) alert cho admin/super-admin

## Current rules
- UGC mặc định không trở thành canonical moderation record
- report lifecycle thuộc moderation module
- author snapshot được giữ ngay trên entity để ổn định public DTO
- guestbook là flow nhẹ hơn community post/comment

