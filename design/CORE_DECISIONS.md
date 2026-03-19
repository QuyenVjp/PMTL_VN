# CORE_DECISIONS

> Ghi chú cho sinh viên:
> Nếu bạn ít thời gian, hãy đọc riêng phần `Decision` của cả 10 mục trước.
> Sau đó mới quay lại `Rationale` và `Trade-off`.

Tài liệu này chốt các quyết định cắt ngang quan trọng nhất của PMTL_VN.
Mỗi quyết định ở đây phải được ưu tiên hơn các giả định cũ trong design nếu hai bên mâu thuẫn.

## Decision 1. Data ownership thuộc về Postgres/Payload

### Context
Repo hiện có Redis cache, Redis queue, worker và Meilisearch.
Nếu không chốt ownership rõ, AI rất dễ generate logic đọc nhầm từ computed store.

### Decision
- PostgreSQL qua Payload là source of truth duy nhất cho dữ liệu ứng dụng.
- Redis chỉ giữ cache, queue state, coordination state.
- Meilisearch chỉ giữ search documents.

### Rationale
- Phù hợp với implementation hiện tại.
- Đơn giản hóa debugging, backup, và data recovery.
- Tránh split-brain giữa DB và search/cache.

### Trade-off
- Một số read path cần sync/refresh sau khi ghi.
- Search và notification có eventual consistency thay vì update đồng bộ tức thời.

## Decision 2. Payload auth là auth authority duy nhất

### Context
Auth đang chạy trong `apps/cms` qua Payload.
Design cũ còn nhắc một auth framework thứ hai, gây lệch với codebase hiện tại.

### Decision
- Payload auth là authority duy nhất cho đăng ký, đăng nhập, session, reset mật khẩu và role.
- Web tiêu thụ auth contract từ CMS.
- Google login / OAuth provider được phép tồn tại nếu nó đi vào cùng `users` collection và cùng session authority của Payload.
- Không thêm auth authority thứ hai, không tạo users store thứ hai, và không tách session sang framework khác.

### Rationale
- Khớp repo truth.
- Giảm số boundary auth cần đồng bộ.
- Dễ giữ role/access model nhất quán giữa admin và public app.

### Trade-off
- Auth flow phụ thuộc vào CMS runtime availability.
- Provider login làm auth flow phong phú hơn, nên contract mapping giữa callback provider và `users` phải được ghi rõ thay vì suy đoán.

## Decision 3. Editorial publish workflow bám Payload drafts + publishedAt

### Context
Collections editorial hiện đang dùng Payload drafts và các field như `publishedAt`, `contentPlainText`, `normalizedSearchText`.
Design cũ mô tả workflow enterprise nhiều trạng thái không còn khớp repo.

### Decision
- Editorial content dùng Payload `_status` (`draft` / `published`) làm workflow gốc.
- `publishedAt` là field canonical cho thời điểm public.
- Trạng thái `archived` chỉ thêm ở collection nào thật sự cần, không ép thành workflow chung nếu code chưa dùng.

### Rationale
- Khớp implementation hiện tại của `posts`, `hubPages`, `beginnerGuides`, `downloads`, `sutras`.
- Đủ rõ cho web cache, search indexing, và public delivery.

### Trade-off
- Workflow editorial hiện không chi tiết như hệ thống approval nhiều bước.
- Nếu sau này cần editorial review queue riêng, phải thêm decision mới thay vì diễn giải quá mức từ draft/publish hiện tại.

## Decision 4. Moderation report dùng source of truth riêng

### Context
UGC hiện có nhiều bề mặt: `postComments`, `communityPosts`, `communityComments`, `guestbookEntries`.
Repo đã có `moderationReports` và sync summary ngược lên entity đích.

### Decision
- `moderationReports` là source of truth duy nhất cho report lifecycle.
- Entity đích chỉ giữ summary fields như `reportCount`, `lastReportReason`, `moderationStatus`, `isHidden`, `approvalStatus`.

### Rationale
- Giữ moderation logic tập trung.
- Cho phép nhiều module gửi report nhưng không duplicate workflow.
- Phù hợp với route contracts hiện có.

### Trade-off
- Read UI cần join/compose giữa report source và target summary khi cần chi tiết.
- Có eventual consistency nhỏ giữa report record và summary field trên entity.

## Decision 5. Visibility phải là dữ liệu tường minh khi feature cần audience scoping

### Context
Nguyên tắc hệ thống yêu cầu visibility không được hardcode.
Repo hiện tại chủ yếu public hóa editorial content theo publish state.

### Decision
- Không encode audience visibility trong middleware logic hoặc magic route rules.
- Khi một collection cần `public / members-only / private`, field đó phải nằm trên collection sở hữu dữ liệu.
- Current scope không giả vờ rằng mọi collection đã có field này nếu implementation chưa dùng.

### Rationale
- Giữ nguyên nguyên tắc kỹ thuật mà không bẻ cong repo truth.
- Tránh generate cột/logic không tồn tại trong current implementation.

### Trade-off
- Một số future gated-content use case chưa được materialize đầy đủ ở current schema.
- AI cần đọc decision này cùng module schema để không tự thêm visibility vô tội vạ.

## Decision 6. Async jobs là mặc định cho notification, search, email

### Context
Search indexing, push dispatch và email notification đều đã có queue/worker path.

### Decision
- Các tác vụ sau phải đi qua Redis queue + worker:
  - search indexing
  - push dispatch
  - email notification
- Sync path chỉ enqueue hoặc fallback cục bộ khi queue path không khả dụng và flow cần tiếp tục.

### Rationale
- Giảm latency cho web/API path.
- Hợp với stack đã chốt.
- Dễ retry và quan sát lỗi hơn.

### Trade-off
- Hệ thống có eventual consistency.
- Cần thêm status/health endpoint để quan sát queue và worker.

## Decision 7. Search indexing là queue-first, published-only, có fallback

### Context
Search hiện dựa trên Meilisearch nhưng repo đã có fallback qua Payload query.

### Decision
- Search source fields nằm trên owner collections.
- Chỉ document đã publish mới được index.
- Flow chuẩn là enqueue search-sync job rồi để worker/indexer cập nhật Meilisearch.
- Public search vẫn có payload fallback nếu Meilisearch unavailable.

### Rationale
- Bám implementation hiện có.
- Không biến search thành hard dependency cho mọi read path.
- Giữ dữ liệu index luôn là computed document.

### Trade-off
- Fallback search chậm hơn và ít mạnh hơn Meilisearch.
- Cần theo dõi độ trễ index nếu publish volume tăng.

## Decision 8. Cache strategy chỉ áp dụng cho published public reads

### Context
Redis hiện được phép dùng cho cache nhưng không được phép chứa canonical business truth.

### Decision
- Chỉ published public content mới được đưa vào shared cache.
- Draft, pending UGC, moderation queues, và self-owned user state không dùng shared cache làm nguồn dữ liệu chính.
- Invalidations gắn với publish/update quan trọng, không gắn với mọi thay đổi tạm thời.

### Rationale
- An toàn cho content visibility.
- Đỡ phức tạp hơn nhiều so với full cache invalidation matrix.

### Trade-off
- Một số thống kê hoặc derived read model có thể trễ nhẹ.
- Read path có thể phải quay về DB cho các dữ liệu riêng tư hoặc mới thay đổi.

## Decision 9. Module boundaries ưu tiên owner rõ hơn abstraction đẹp

### Context
Design cũ từng để content ôm cả engagement và wishlist.
Repo hiện tại đã split collections khá rõ.

### Decision
- `content` chỉ giữ editorial content, taxonomy, media, scripture library, content search fields, và practice support reference content như `chantItems`, `chantPlans`, ritual guide, bài khai thị gốc.
- `community` giữ discussion surfaces.
- `engagement` giữ self-owned user state, gồm cả `practiceSheets` và `ngoiNhaNhoSheets`.
- `calendar` giữ event/lunar scheduling data và personal practice calendar read model.
- `notification` giữ delivery control-plane.
- `search` giữ indexing/query contract, không giữ canonical business data.
- `08-vows-merit` giữ self-owned records cho `Phát nguyện` và `Phóng sanh`.
- `09-wisdom-qa` giữ curated retrieval records cho `Bạch thoại Phật pháp`, `Huyền học vấn đáp`, audio/video hỗ trợ đọc học.

### Rationale
- Khớp collection layout hiện tại.
- Giảm nguy cơ AI generate nhầm folder hoặc service.
- Dễ review hơn cho solo dev.

### Trade-off
- Một số flow phải đi qua cross-module references thay vì nằm gọn trong một collection lớn.
- Cần tài liệu interaction rõ để tránh duplicate logic.

### Ghi chú thêm từ tài liệu PDF thực hành
- Bộ PDF niệm kinh / phát nguyện / phóng sinh / Ngôi Nhà Nhỏ củng cố boundary này:
  - script, lời khấn mẫu, số biến, time rule, checklist nghi thức thuộc lớp reference/public content
  - progress cá nhân, cấu hình plan theo user, practice log vẫn là self-owned engagement state

## Decision 10. Auditability ưu tiên append-only log + denormalized summaries

### Context
Repo đã có `auditLogs`, `moderationReports`, `pushJobs`, và nhiều summary fields.

### Decision
- Hành động hệ thống quan trọng nên có append-only record hoặc job record riêng.
- Summary fields trên entity đích được phép tồn tại để tối ưu read path.
- Summary field không được thay thế source record của module gốc.

### Rationale
- Giữ được khả năng điều tra khi có lỗi hoặc tranh chấp moderation.
- Hợp với mô hình worker/job hiện tại.

### Trade-off
- Có thêm bước sync summary.
- Thiết kế read path cần rõ field nào là canonical, field nào là summary.
