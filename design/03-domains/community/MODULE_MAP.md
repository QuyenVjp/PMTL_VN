# Community Module

> Ghi chú cho sinh viên:
> Community là `social-lite surface` của PMTL: đủ sức hút để người dùng quay lại, nhưng vẫn phải mềm, kín đáo, và đặt moderation/privacy lên trước.

---

markmap:
colorFreezeLevel: 2
initialExpandLevel: 3

---

# Community Module

## Mục tiêu

- mô tả các bề mặt social-lite và đóng góp công khai
- giữ ranh giới rõ giữa community ownership và moderation ownership
- tạo retention loop lành mạnh bằng bài đăng, bình luận, tim, chia sẻ, và thông báo
- tuyệt đối không biến community thành nơi khoe progress tu tập

## Collections thuộc module

### Discussion on editorial content

- `postComments`

### Community social surface

- `communityPosts`
- `communityComments`

### Lightweight public wall

- `guestbookEntries`

## Current responsibilities

### Reader interaction

- bình luận dưới bài viết
- thảo luận dưới bài cộng đồng
- reply theo thread nông
- tim bài cộng đồng hoặc comment đủ điều kiện
- chia sẻ link công khai

### Community submissions

- tạo bài cộng đồng
- gửi chia sẻ kinh nghiệm, cảm nhận, câu hỏi
- gửi lời nhắn guestbook
- cho phép admin/editor đăng bài cộng đồng như official voice khi policy cho phép

### Public-facing counters and summaries

- `commentsCount`
- `likes` hoặc `heartCount`
- `views`
- `reportCount`
- `isHidden`
- `moderationStatus`
- `approvalStatus`

### Moderation initiation

- cho phép user gửi report
- sync report sang moderation module
- auto-hide tạm thời khi risk threshold vượt ngưỡng

### Retention hooks

- reply alert
- approval / rejection alert
- publish alert chọn lọc cho bài cộng đồng quan trọng
- share-ready metadata trên public surfaces

## References ra ngoài module

### Identity

- `authorUser`
- `submittedByUser`
- author name snapshot

### Content

- `postComments.post`
- canonical editorial/wisdom page URLs để comment/share không bị orphan

### Moderation

- community không sở hữu report source-of-truth
- community chỉ giữ moderation summary fields trên entity
- community chỉ phát report/review signal; moderation mới sở hữu report entity và decision lifecycle
- auto-hide summary phải recompute được từ moderation source khi drift

### Notification

- reply / approval / publish flow có thể tạo admin hoặc member alert
- `Phase 1`: best-effort hoặc control-plane record nếu async lane chưa active
- `Phase 2+`: alert quan trọng đi qua `outbox_events`

### Search / Share / Discovery

- public community post detail phải có shareable URL ổn định
- approved guestbook entries có thể xuất hiện ở lightweight discovery surface nhưng không thành infinite feed

## Current rules (Quy tắc hiện tại)

- UGC không trở thành canonical moderation record
- report lifecycle thuộc moderation module
- author snapshot được giữ ngay trên entity để ổn định public DTO
- guestbook luôn là surface nhẹ và phải qua duyệt trước khi public
- community post của member mặc định pending; admin/editor post có thể publish ngay theo role policy
- comment ưu tiên fast-path visible sau guard, nhưng actor/payload rủi ro có thể bị ép pending
- community có `tim`, nhưng không có reaction zoo hay gamification loop
- share là capability public; share analytics không phải canonical source
- canonical submit đi trước; alert/notify/review signal đi sau
- tuyệt đối không hiển thị progress tu tập cá nhân bằng system-generated projection
- các guideline chia sẻ hoằng pháp nhạy cảm tham chiếu thêm tại `REFERENCES/DHARMA_SHARING_MODERATION_NOTES.md`
