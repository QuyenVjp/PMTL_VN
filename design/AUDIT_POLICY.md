# AUDIT_POLICY

Tài liệu này chốt chính sách ghi audit cho PMTL_VN.
Mục tiêu là để mọi hành động quan trọng đều trả lời được:

- ai thực hiện
- lúc nào
- trên entity nào
- trước và sau khi thay đổi là gì
- side-effect nào đã được kích hoạt

## Nguyên tắc gốc

- `auditLogs` là append-only record cho điều tra và truy vết.
- Audit log không thay thế canonical business record.
- Summary fields trên entity được phép tồn tại để đọc nhanh, nhưng không thay cho audit trail.
- Hành động quan trọng phải log ở service/hook owner của module, không chỉ log ở UI.

## Khi nào bắt buộc ghi audit

### Identity
- đăng ký tài khoản mới
- đổi role
- khóa hoặc mở khóa tài khoản
- cập nhật profile bởi admin
- reset mật khẩu bởi flow quản trị hoặc support

### Content
- tạo document editorial mới
- chuyển `draft -> published`
- cập nhật document đã publish
- unpublish hoặc xóa document public
- thay đổi taxonomy quan trọng hoặc liên kết event

### Community
- gửi community post
- gửi post comment
- gửi community comment
- gửi guestbook entry
- action bị chặn vì request guard hoặc anti-spam

### Engagement
- tạo hoặc hoàn tất practice log
- thay đổi chant preferences
- ghi bookmark hoặc tiến độ đọc kinh nếu ảnh hưởng self-state chính
- tạo `Ngôi Nhà Nhỏ`
- hoàn thành `Ngôi Nhà Nhỏ`
- đánh dấu `Ngôi Nhà Nhỏ` đã hóa

### Moderation
- tạo moderation report
- admin ra quyết định
- cập nhật summary moderation trên entity đích

### Search
- batch reindex thủ công
- sync thất bại nhiều lần
- fallback search bị dùng do Meilisearch unavailable

### Calendar
- tạo hoặc publish event
- tạo lunar override làm thay đổi lịch hiển thị

### Notification
- tạo push job
- push job fail hoặc complete
- subscribe / unsubscribe push subscription

### Vows & Merit
- tạo phát nguyện
- pause / resume phát nguyện
- hoàn thành phát nguyện
- tạo journal phóng sanh

### Wisdom & QA
- publish hoặc gỡ entry chính thống
- cập nhật mapping bản dịch hoặc media official

## Những gì một audit log tối thiểu phải có

- `actor`
  - user id hoặc system actor
- `action`
  - động từ rõ, ví dụ `post.publish`, `moderation.report.submit`
- `entityType`
  - ví dụ `posts`, `moderationReports`, `guestbookEntries`
- `entityId`
  - internal id nếu có
- `publicId`
  - khi entity có public identity
- `correlationId`
  - để nối request với queue/job và log hệ thống
- `metadata`
  - context gọn nhưng đủ điều tra

## Snapshot trước/sau

- Với các thay đổi nội dung quan trọng, nên lưu:
  - `before`
  - `after`
  - `changedFields`
- Không cần copy toàn bộ document nếu quá lớn; ưu tiên field thay đổi có ý nghĩa.
- Với dữ liệu nhạy cảm:
  - không log password
  - không log token reset
  - không log IP thô nếu policy hiện tại dùng hash

## Quan hệ giữa audit log và module owner

- Module owner chịu trách nhiệm append audit cho canonical write-path của mình.
- Module downstream chỉ log phần control-plane của chính nó.

Ví dụ:
- Content publish log ở content service.
- Search chỉ log enqueue batch hoặc sync failure của index flow.
- Notification chỉ log job/subscription, không log lại toàn bộ nội dung canonical của post.

## Mức độ bắt buộc theo loại hành động

| Hành động | Audit bắt buộc | Ghi chú |
|---|---|---|
| Public content publish/update | Có | Phải log actor, publicId, changedFields |
| Community submit/report | Có | Phải có correlationId và anti-spam context |
| Moderation decision | Có | Phải log report id, target entity, decision |
| User profile self-update | Có | Có thể log nhẹ hơn admin action |
| Search query đọc thường | Không | Chỉ cần metrics, không cần audit từng query |
| Push dispatch từng recipient | Không bắt buộc | Job record là control-plane chính |

## Mapping khuyến nghị cho action names

- `auth.register`
- `auth.profile.update`
- `user.role.change`
- `post.create`
- `post.publish`
- `post.update.published`
- `community.post.submit`
- `community.comment.submit`
- `guestbook.submit`
- `practice-log.upsert`
- `sutra-progress.upsert`
- `ngoihanho.create`
- `ngoihanho.complete`
- `ngoihanho.offer`
- `moderation.report.submit`
- `moderation.report.resolve`
- `search.reindex.batch`
- `search.sync.failure`
- `event.publish`
- `vow.create`
- `vow.pause`
- `vow.fulfill`
- `life-release.log`
- `wisdom.entry.publish`
- `qa.entry.publish`
- `push.subscription.create`
- `push.subscription.deactivate`
- `push.job.create`
- `push.job.complete`
- `push.job.fail`

## Chính sách giữ dữ liệu

- Audit log nên giữ lâu hơn application job logs.
- Job log có thể được dọn theo retention ngắn hơn nếu vẫn giữ được audit event cốt lõi.
- Khi có tranh chấp cộng đồng hoặc sai nội dung public, audit trail phải đủ để reconstruct ai đã đổi gì.

## Notes for AI/codegen

- Đừng thêm audit ở UI rồi tưởng là đủ.
- Đừng log secret, token, raw password, IP thô khi policy đang dùng hash.
- Đừng bỏ audit ở các flow "chỉ là submit form" nếu flow đó tạo canonical record.
