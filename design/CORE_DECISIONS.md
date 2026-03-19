# CORE_DECISIONS

> Ghi chú cho sinh viên:
> Nếu bạn ít thời gian, hãy đọc riêng phần `Decision` của các mục trước.
> Sau đó mới quay lại `Rationale` và `Trade-off`.

Tài liệu này chốt các quyết định cắt ngang quan trọng nhất của PMTL_VN.
Mỗi quyết định ở đây phải được ưu tiên hơn các giả định cũ trong design nếu hai bên mâu thuẫn.

## Decision 1. Data ownership thuộc về Postgres/Payload

### Context
Repo hiện có Redis cache, Redis queue (hàng đợi xử lý), worker (tiến trình xử lý nền) và Meilisearch.
Nếu không chốt ownership rõ, AI rất dễ generate logic đọc nhầm từ computed store.

### Decision
- PostgreSQL qua Payload là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) duy nhất cho dữ liệu ứng dụng.
- Redis chỉ giữ cache, queue (hàng đợi xử lý) state, coordination state.
- Meilisearch chỉ giữ search documents.

### Rationale
- Phù hợp với implementation hiện tại.
- Đơn giản hóa debugging, backup, và data recovery.
- Tránh split-brain giữa DB và search/cache.

### Trade-off
- Một số read path cần sync/refresh sau khi ghi.
- Search và notification có eventual consistency thay vì update đồng bộ tức thời.

### Delete corollary
- Cross-module relations không được phép tạo orphan âm thầm.
- Hard delete phải đi qua cleanup contract (hợp đồng dữ liệu/nghiệp vụ) của owner module (module sở hữu); nếu chưa có cleanup path rõ, dùng soft delete hoặc archive.

## Decision 2. Payload auth là auth authority duy nhất

### Context
Auth đang chạy trong `apps/cms` qua Payload.
Design cũ còn nhắc một auth framework thứ hai, gây lệch với codebase hiện tại.

### Decision
- Payload auth là authority duy nhất cho đăng ký, đăng nhập, session, reset mật khẩu và role.
- Web tiêu thụ auth contract (hợp đồng dữ liệu/nghiệp vụ) từ CMS.
- Google login / OAuth provider được phép tồn tại nếu nó đi vào cùng `users` collection và cùng session authority của Payload.
- Không thêm auth authority thứ hai, không tạo users store thứ hai, và không tách session sang framework khác.

### Rationale
- Khớp repo truth.
- Giảm số boundary (ranh giới trách nhiệm) auth cần đồng bộ.
- Dễ giữ role/access model nhất quán giữa admin và public app.

### Trade-off
- Auth flow phụ thuộc vào CMS runtime availability.
- Provider login làm auth flow phong phú hơn, nên contract (hợp đồng dữ liệu/nghiệp vụ) mapping giữa callback provider và `users` phải được ghi rõ thay vì suy đoán.

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
- Nếu sau này cần editorial review queue (hàng đợi xử lý) riêng, phải thêm decision mới thay vì diễn giải quá mức từ draft/publish hiện tại.

## Decision 4. Moderation report dùng source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) riêng

### Context
UGC hiện có nhiều bề mặt: `postComments`, `communityPosts`, `communityComments`, `guestbookEntries`.
Repo đã có `moderationReports` và sync summary ngược lên entity đích.

### Decision
- `moderationReports` là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) duy nhất cho report lifecycle.
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
- Một số future gated-content use case chưa được materialize đầy đủ ở current schema (lược đồ dữ liệu).
- AI cần đọc decision này cùng module schema (lược đồ dữ liệu) để không tự thêm visibility vô tội vạ.

## Decision 6. async (bất đồng bộ) side effect quan trọng đi qua outbox trước khi vào execution queue

### Context
Search indexing, push dispatch, email notification và webhook/revalidation đều là downstream side effect dễ bị rơi nếu canonical write thành công nhưng handoff thất bại.

### Decision
- Các tác vụ sau phải đi qua `Postgres transaction + outbox_events + dispatcher + execution queue/worker`:
  - search indexing
  - push dispatch
  - email notification
  - webhook/revalidation
- Không phát business event quan trọng bằng Redis pub/sub thuần hoặc fire-and-forget direct call từ request path.
- Execution queue vẫn được phép tồn tại, nhưng nó là tầng thực thi sau outbox chứ không phải transactional handoff gốc.
- Preferred tooling cho execution queue trên current stack là `BullMQ` thay vì hand-rolled Redis queue semantics.
- `Temporal` và `QStash` không phải baseline cho current phase.

### Rationale
- Giảm latency cho web/API path.
- Tăng độ chắc cho canonical write + downstream side effects.
- Dễ retry, replay, audit và reconciliation hơn.

### Trade-off
- Hệ thống có eventual consistency.
- Tăng thêm một lớp dispatcher/outbox cần quan sát.
- Cần thêm status/health cho outbox lag, queue lag và worker health.

## Decision 7. Search indexing là outbox-driven projection, published-only, có fallback (đường dự phòng)

### Context
Search hiện dựa trên Meilisearch nhưng repo đã có fallback (đường dự phòng) qua Payload query.

### Decision
- Search source fields nằm trên owner collections.
- Chỉ document đã publish mới được index.
- Flow chuẩn là:
  - canonical write ở content owner
  - append outbox event trong cùng transaction
  - dispatcher phát search-sync execution job
  - worker/indexer cập nhật Meilisearch
- Public search vẫn có payload fallback (đường dự phòng) nếu Meilisearch unavailable.
- Search sync guarantee hiện tại là `at-least-once async (bất đồng bộ) projection`, không phải exactly-once synchronous mirror.
- Search sync payload phải idempotent và có recovery path qua batch reindex/status checks.
- `Meilisearch` là search engine chính cho public search.
- `pgvector` không thay Meilisearch; chỉ là capability bổ sung khi đã chốt rõ recommendation / related-content / retrieval gần nghĩa.

### Rationale
- Bám implementation hiện có.
- Không biến search thành hard dependency cho mọi read path.
- Giữ dữ liệu index luôn là computed document.
- Giảm nguy cơ "write OK nhưng search sync rơi" cho publish/update quan trọng.

### Trade-off
- fallback (đường dự phòng) search chậm hơn và ít mạnh hơn Meilisearch.
- Cần theo dõi độ trễ index nếu publish volume tăng.
- Eventual consistency vẫn tồn tại; đổi lại canonical write không bị block bởi search engine.
- Muốn thêm recommendation bằng `pgvector` sẽ tăng độ phức tạp của pipeline embedding và retention policy.

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
- Một số thống kê hoặc derived read model (mô hình dữ liệu đọc) có thể trễ nhẹ.
- Read path có thể phải quay về DB cho các dữ liệu riêng tư hoặc mới thay đổi.

## Decision 9. Module boundaries ưu tiên owner rõ hơn abstraction đẹp

### Context
Design cũ từng để content ôm cả engagement và wishlist.
Repo hiện tại đã split collections khá rõ.

### Decision
- `content` chỉ giữ editorial content, taxonomy, media, scripture library, content search fields, và practice support reference content như `chantItems`, `chantPlans`, ritual guide, bài khai thị gốc.
- `community` giữ discussion surfaces.
- `engagement` giữ self-owned user state, gồm cả `practiceSheets` và `ngoiNhaNhoSheets`.
- `calendar` giữ event/lunar scheduling data và personal practice calendar read model (mô hình dữ liệu đọc).
- `notification` giữ delivery control-plane (lớp điều phối hệ thống).
- `search` giữ indexing/query contract (hợp đồng dữ liệu/nghiệp vụ), không giữ canonical business data.
- `08-vows-merit` giữ self-owned records cho `Phát nguyện` và `Phóng sanh`.
- `09-wisdom-qa` giữ curated retrieval records cho `Bạch thoại Phật pháp`, `Huyền học vấn đáp`, audio/video hỗ trợ đọc học.

### Rationale
- Khớp collection layout hiện tại.
- Giảm nguy cơ AI generate nhầm folder hoặc service (lớp xử lý nghiệp vụ).
- Dễ review hơn cho solo dev.

### Trade-off
- Một số flow phải đi qua cross-module references thay vì nằm gọn trong một collection lớn.
- Cần tài liệu interaction rõ để tránh duplicate logic.

### Ghi chú thêm từ tài liệu PDF thực hành
- Bộ PDF niệm kinh / phát nguyện / phóng sinh / Ngôi Nhà Nhỏ củng cố boundary (ranh giới trách nhiệm) này:
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
- Hợp với mô hình worker (tiến trình xử lý nền)/job hiện tại.

### Trade-off
- Có thêm bước sync summary.
- Thiết kế read path cần rõ field nào là canonical, field nào là summary.

## Decision 11. Runtime boundary validation và env contracts là bắt buộc

### Context
Hệ thống có nhiều boundary: request public, admin action, queue payload, webhook, search document, env/runtime config.

### Decision
- Mọi boundary quan trọng phải có schema validation runtime rõ ràng.
- `Zod` là lựa chọn mặc định cho request DTO, queue payload, webhook payload, search document schema và env contracts.
- TypeScript typing không được coi là đủ cho boundary runtime.

### Rationale
- Fail fast.
- Giảm silent corruption và drift giữa producer/consumer.
- Dễ debug hơn khi hệ thống có worker và downstream projections.

### Trade-off
- Tốn thêm công viết schema và giữ versioning.
- Có thể phải cập nhật schema ở nhiều nơi khi contract thay đổi.

## Decision 12. Media/file phải đi qua storage abstraction; current phase dùng local adapter, target phase là S3-compatible

### Context
Current production reality của PMTL_VN là chạy trên 1 VPS và chưa dùng object storage ngay.
Tuy vậy media/file vẫn là binary asset có rủi ro mất dữ liệu, khó backup, và là security boundary riêng.

### Decision
- Media/file phải đi qua storage abstraction rõ ràng, không để business logic phụ thuộc trực tiếp local filesystem path.
- Current phase:
  - cho phép `local disk storage` trên VPS
  - nhưng vẫn phải có adapter/interface storage rõ
  - metadata file nằm canonical trong Postgres
- Target phase:
  - chuyển sang `S3-compatible object storage`
  - không đổi logic nghiệp vụ phía trên adapter
- Upload pipeline phải tách:
  - metadata canonical
  - binary object
  - scan/quarantine/publish state khi feature đó được bật

### Rationale
- Khớp điều kiện hạ tầng hiện tại của dự án.
- Không khóa chặt business logic vào local path.
- Cho phép nâng cấp lên `S3` sau này mà không phải refactor lớn.

### Trade-off
- Current phase vẫn chịu rủi ro của local disk nếu VPS có sự cố.
- Tăng thêm yêu cầu thiết kế adapter, metadata, và config storage.

## Decision 13. Observability nên triển khai theo pha: lean baseline trước, traces nâng cấp sau

### Context
Metrics và logs là cần ngay.
Tracing có giá trị thật, nhưng tự host full stack observability trên `single VPS` có thể nặng hơn lợi ích ở current phase.

### Decision
- Baseline current phase:
  - `Prometheus + Grafana + Alertmanager + Pino`
  - app `/metrics`
  - health endpoints
- Tracing là phase nâng cấp:
  - chỉ bật khi có nhu cầu điều tra latency/distributed flow thật sự
  - nếu bật sớm, ưu tiên cân nhắc managed backend như `Grafana Cloud` trước khi tự host `Tempo`
- Khi tracing được bật, trace context nên đi xuyên web, cms, worker, DB call, search call, queue handoff và webhook call.

### Rationale
- Giữ observability đủ dùng mà không làm 1 VPS phải gánh quá nhiều thành phần.
- Vẫn chừa đường nâng cấp lên traces khi hệ thống phức tạp hơn.

### Trade-off
- Baseline lean sẽ ít chi tiết hơn full tracing stack.
- Nếu trì hoãn traces quá lâu, điều tra latency chéo service sẽ khó hơn.

## Decision 14. Semantic retrieval nâng cấp theo hướng optional capability, không ép thành mặc định

### Context
Search text và search semantic không phải cùng một bài toán.

### Decision
- `Meilisearch` tiếp tục là engine chính cho search box công khai.
- `pgvector` chỉ thêm khi đã chốt use case rõ:
  - related-content
  - recommendation
  - semantic retrieval / "bài gần nghĩa"
- Không bật `pgvector` chỉ vì "muốn có AI".

### Rationale
- Tránh over-engineer.
- Giữ public search đơn giản và nhanh.

### Trade-off
- Nếu muốn recommendation chất lượng cao hơn, phải đầu tư embedding pipeline, retention, reindex và quality evaluation.

## Decision 15. App-layer rate limit dùng Redis là bắt buộc cho public write/auth/search surfaces

### Context
Public auth, search, submit form, và upload file đều là bề mặt dễ bị abuse hoặc accidental burst trên 1 VPS.

### Decision
- Rate limit phải đặt ở app layer và dùng Redis làm counter store.
- Tối thiểu áp cho:
  - login
  - register
  - forgot password
  - create post/comment
  - search
  - upload file
- Rule có thể theo IP, user ID, hoặc cả hai tùy flow.

### Rationale
- Thực chiến, rẻ, và hợp với hạ tầng hiện tại.
- Bảo vệ app trước abuse mà không cần thêm infra nặng.

### Trade-off
- Tăng complexity ở request boundary.
- Khi Redis lỗi, cần degrade policy rõ thay vì bỏ trống guard.

## Decision 16. Health endpoints và Prometheus metrics là baseline vận hành bắt buộc

### Context
Hệ thống đã đủ nhiều dependency để cần readiness rõ và metrics có tên thống nhất.

### Decision
- Phải có:
  - `/health/live`
  - `/health/ready`
  - `/health/startup`
  - `/metrics`
- `ready` phải check tối thiểu:
  - Postgres
  - Redis
  - Meilisearch
  - local storage base dir ở mức hợp lý khi current phase còn dùng local disk
- App metrics phải phản ánh request, queue, outbox, upload, và rate-limit.

### Rationale
- Giúp deploy và recovery ít mù hơn.
- Hợp với Prometheus/Grafana stack đã chốt.

### Trade-off
- Tốn công chuẩn hóa metric names và health policy.

## Decision 17. Audit log và feature flags là hai control-plane tối thiểu nên có từ sớm

### Context
Hệ thống đang tăng số module và flow nhạy cảm; vừa cần khả năng điều tra, vừa cần rollout an toàn cho feature mới.

### Decision
- `audit_logs` là append-only cross-cutting table cho action quan trọng.
- `feature_flags` là bảng điều khiển tối thiểu cho rollout theo key.
- Helper kiểu `isFeatureEnabled(key)` là đủ cho current scope; chưa cần remote config platform.

### Rationale
- Rất đáng tiền trên 1 VPS nhưng chi phí thấp.
- Giúp bật feature mới dần dần mà không phải đổi code path mù.

### Trade-off
- Cần discipline để không lạm dụng feature flag thành config rác.

## Decision 18. Managed free-tier services được ưu tiên khi giảm tải vận hành mà không phá ownership

### Context
PMTL_VN đang theo hướng `single VPS`, chi phí thấp, và cần tránh tự host quá nhiều thành phần khi chưa thật cần.

### Decision
- Được ưu tiên dùng managed/free-tier service nếu:
  - không làm mất ownership boundary đã chốt
  - không tạo auth authority thứ hai
  - không buộc refactor lớn business logic
- Current preferred candidates:
  - `Cloudflare R2` cho target object storage
  - `Cloudflare` ở edge phía trước `Caddy`
  - `Grafana Cloud` nếu cần traces/logs/metrics mà không muốn tự host đủ stack
- Current non-preferred swaps:
  - đổi `Payload auth` sang auth SaaS khác
  - đổi `Meilisearch` sang search SaaS chỉ vì “xịn hơn”
  - đổi canonical Postgres hiện tại sang nền khác mà không có migration pressure rõ

### Rationale
- Thực dụng hơn cho team nhỏ và ngân sách thấp.
- Giảm vận hành nhưng vẫn giữ kiến trúc rõ ràng.

### Trade-off
- Tăng phụ thuộc vào vendor ngoài ở một số lớp hạ tầng.

