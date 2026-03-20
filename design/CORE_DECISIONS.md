# CORE_DECISIONS (Các quyết định cốt lõi)

> Ghi chú cho sinh viên:
> Nếu bạn ít thời gian, hãy đọc riêng phần `Decision (Quyết định)` của các mục trước.
> Sau đó mới quay lại `Rationale (Cơ sở lý luận)` và `Trade-off (Sự đánh đổi)`.

Tài liệu này chốt các quyết định cắt ngang (cross-cutting) quan trọng nhất của PMTL_VN.
Mỗi quyết định ở đây phải được ưu tiên hơn các giả định cũ trong thiết kế (design) nếu hai bên mâu thuẫn.

## Decision 1. Data ownership (Quyền sở hữu dữ liệu) thuộc về Postgres + NestJS backend modules

### Context (Bối cảnh)
Repo hiện có cache/queue (bộ nhớ đệm/hàng đợi) kiểu Redis-compatible, worker (tiến trình xử lý nền) và Meilisearch.
Nếu không chốt ownership (quyền sở hữu) rõ ràng, AI rất dễ tạo ra (generate) logic đọc nhầm từ kho lưu trữ đã qua tính toán (computed store).

### Decision (Quyết định)
- PostgreSQL là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) duy nhất cho dữ liệu ứng dụng.
- Các mô-đun (modules) của `NestJS` backend là quyền lực (authority) cho luồng ghi nghiệp vụ (business write-path), xác thực (auth), kiểm soát truy cập (access control), và điều phối các luồng phía sau (downstream orchestration).
- `Valkey` (`Redis-compatible`) chỉ giữ trạng thái bộ nhớ đệm (cache), hàng đợi (queue), và trạng thái phối hợp (coordination state).
- Meilisearch chỉ giữ các tài liệu tìm kiếm (search documents).

### Rationale (Cơ sở lý luận)
- Phù hợp với bản triển khai (implementation) hiện tại.
- Đơn giản hóa việc gỡ lỗi (debugging), sao lưu (backup), và phục hồi dữ liệu (data recovery).
- Tránh tình trạng "não bị chia cắt" (split-brain) giữa cơ sở dữ liệu (DB) và các hệ thống tìm kiếm/bộ nhớ đệm.

### Trade-off (Sự đánh đổi)
- Một số luồng đọc (read path) cần đồng bộ/làm mới (sync/refresh) sau khi ghi.
- Tìm kiếm (Search) và thông báo (notification) có tính nhất quán sau cùng (eventual consistency) thay vì cập nhật đồng bộ tức thời.

### Delete corollary (Hệ quả của việc xóa)
- Các mối quan hệ liên mô-đun (cross-module relations) không được phép tạo ra dữ liệu mồ côi (orphan) một cách âm thầm.
- Xóa vĩnh viễn (Hard delete) phải đi qua hợp đồng dọn dẹp (cleanup contract) của mô-đun sở hữu (owner module); nếu chưa có luồng dọn dẹp rõ ràng, hãy dùng xóa mềm (soft delete) hoặc lưu trữ (archive).

## Decision 2. NestJS auth là auth authority (quyền lực xác thực) duy nhất

### Context (Bối cảnh)
Hướng đi hiện tại đã chốt quyền lực hệ thống phía sau (backend authority) là `NestJS`, không còn dựa vào nền tảng CMS làm quyền lực xác thực (auth authority).

### Decision (Quyết định)
- `NestJS auth module` là quyền lực (authority) duy nhất cho đăng ký, đăng nhập, phiên làm việc (session), thiết lập lại mật khẩu và vai trò (role).
- Web và Admin sử dụng hợp đồng xác thực (auth contract) từ API.
- Đăng nhập bằng Google / Nhà cung cấp OAuth được phép tồn tại nếu nó dẫn vào cùng bảng `users` và cùng quyền lực phiên/mã (session/token authority) của backend.
- Không thêm quyền lực xác thực thứ hai, không tạo kho lưu trữ người dùng thứ hai, và không tách phiên sang khung phần mềm (framework) khác.
- Nền tảng hiện tại (Current baseline) nên dùng:
  - mã truy cập ngắn hạn (short-lived access token)
  - xoay vòng mã làm mới (refresh token rotation)
  - HTTP-only cookies cho các luồng hướng tới trình duyệt (browser-facing flows) nếu phù hợp

### Rationale (Cơ sở lý luận)
- Hợp với hướng đi ưu tiên backend (backend-first) để có tính kiểm soát và quyền sở hữu kỹ thuật rõ ràng hơn.
- Dễ dàng xuất tài liệu `Swagger/OpenAPI` cho việc tích hợp tự động hóa và quản trị.
- Dễ dàng giữ cho mô hình vai trò/truy cập (role/access model) nhất quán giữa ứng dụng quản trị và ứng dụng công khai.

### Trade-off (Sự đánh đổi)
- Luồng xác thực (auth flow) giờ là phần bạn phải tự sở hữu hoàn toàn.
- Việc đăng nhập qua nhà cung cấp (Provider login) làm luồng xác thực phong phú hơn, nên việc ánh xạ hợp đồng (contract mapping) giữa phản hồi của nhà cung cấp và bảng `users` phải được ghi rõ thay vì suy đoán.

## Decision 3. Editorial publish workflow (Quy trình xuất bản nội dung) bám sát explicit status machine + publishedAt (máy trạng thái tường minh + thời điểm xuất bản)

### Context (Bối cảnh)
Khi không còn nền tảng CMS làm chủ quy trình (workflow owner), trạng thái xuất bản (publish state) phải được mô tả tường minh ở backend và lược đồ (schema) thay vì dựa vào các cơ chế bản nháp (drafts) có sẵn.

### Decision (Quyết định)
- Nội dung biên tập (Editorial content) dùng máy trạng thái (status machine) tường minh, tối thiểu:
  - `draft` (bản nháp)
  - `published` (đã xuất bản)
- `publishedAt` là trường dữ liệu chuẩn (canonical field) cho thời điểm công khai.
- Trạng thái `archived` (lưu trữ) chỉ thêm vào tập hợp (collection) nào thật sự cần, không ép thành quy trình chung nếu mã nguồn chưa dùng tới.

### Rationale (Cơ sở lý luận)
- Dễ triển khai trong `NestJS + Prisma`.
- Đủ rõ ràng cho bộ nhớ đệm web (web cache), đánh chỉ mục tìm kiếm (search indexing), và phân phối công khai (public delivery).

### Trade-off (Sự đánh đổi)
- Không còn việc "sử dụng sẵn" quy trình từ CMS.
- Nếu sau này cần hàng đợi đánh giá biên tập (editorial review queue) riêng, phải thêm quyết định (decision) mới thay vì diễn giải quá mức từ trạng thái draft/publish hiện tại.

## Decision 4. Moderation report (Báo cáo kiểm duyệt) dùng source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) riêng

### Context (Bối cảnh)
Nội dung do người dùng tạo (UGC) hiện có nhiều bề mặt: `postComments` (bình luận bài viết), `communityPosts` (bài viết cộng đồng), `communityComments` (bình luận cộng đồng), `guestbookEntries` (lưu bút).
Repo đã có `moderationReports` và đồng bộ (sync) bản tóm tắt (summary) ngược lên đối tượng bị báo cáo.

### Decision (Quyết định)
- `moderationReports` là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) duy nhất cho vòng đời của báo cáo (report lifecycle).
- Đối tượng bị báo cáo (entity đích) chỉ giữ các trường tóm tắt như `reportCount` (số lượng báo cáo), `lastReportReason` (lý do báo cáo gần nhất), `moderationStatus` (trạng thái kiểm duyệt), `isHidden` (bị ẩn), `approvalStatus` (trạng thái phê duyệt).

### Rationale (Cơ sở lý luận)
- Giữ cho logic kiểm duyệt (moderation logic) được tập trung.
- Cho phép nhiều mô-đun gửi báo cáo nhưng không làm trùng lặp quy trình xử lý.
- Phù hợp với các hợp đồng đường dẫn (route contracts) hiện có.

### Trade-off (Sự đánh đổi)
- Giao diện đọc (Read UI) cần kết hợp/tổng hợp (join/compose) giữa nguồn báo cáo và bản tóm tắt của đối tượng khi cần chi tiết.
- Có tính nhất quán sau cùng (eventual consistency) nhỏ giữa bản ghi báo cáo và trường tóm tắt trên đối tượng.

## Decision 5. Visibility (Khả năng hiển thị) phải là dữ liệu tường minh khi tính năng cần audience scoping (phạm vi khán giả)

### Context (Bối cảnh)
Nguyên tắc hệ thống yêu cầu khả năng hiển thị không được mã hóa cứng (hardcode).
Repo hiện tại chủ yếu công khai hóa nội dung biên tập theo trạng thái xuất bản (publish state).

### Decision (Quyết định)
- Không mã hóa (encode) phạm vi khán giả (audience visibility) trong logic phần mềm trung gian (middleware logic) hoặc các quy tắc đường dẫn kỳ ảo (magic route rules).
- Khi một tập hợp (collection) cần phân loại `public (công khai) / members-only (chỉ dành cho thành viên) / private (riêng tư)`, trường dữ liệu đó phải nằm trên chính tập hợp sở hữu dữ liệu.
- Phạm vi hiện tại (Current scope) không giả vờ rằng mọi tập hợp đều đã có trường này nếu bản triển khai (implementation) chưa thực sự dùng tới.

### Rationale (Cơ sở lý luận)
- Giữ nguyên các nguyên tắc kỹ thuật mà không làm sai lệch sự thật của repo.
- Tránh việc tạo ra các cột hoặc logic không tồn tại trong bản triển khai hiện tại.

### Trade-off (Sự đánh đổi)
- Một số kịch bản nội dung giới hạn (gated-content) trong tương lai chưa được hiện thực hóa đầy đủ trong lược đồ dữ liệu (schema) hiện tại.
- AI cần đọc quyết định này cùng với lược đồ mô-đun (module schema) để không tự ý thêm khả năng hiển thị (visibility) vô tội vạ.

## Decision 6. Async side effect (Tác động phụ bất đồng bộ) phải đi theo phase (giai đoạn), không bật full reliability stack (bộ công cụ tin cậy đầy đủ) quá sớm

### Context (Bối cảnh)
Đánh chỉ mục tìm kiếm, phân phát thông báo đẩy (push dispatch), thông báo qua email và phản hồi ngược (webhook)/xác thực lại (revalidation) đều là các tác động phụ cấp dưới (downstream side effect) có thể cần tách khỏi luồng xử lý yêu cầu (request path).
Nhưng với giai đoạn hiện tại (solo/sinh viên), không phải tác động phụ nào cũng xứng đáng trả "thuế phức tạp" (complexity tax) của bộ công cụ `outbox + dispatcher + queue + worker`.

### Decision (Quyết định)
- Mặc định giai đoạn 1 (phase 1):
  - giữ tác động phụ đồng bộ (sync side effect) nếu nó nhanh, ít rủi ro, và dễ thử lại (retry) bằng thao tác của người dùng.
  - không kích hoạt hàng đợi (queue) chỉ để "trông giống sản xuất chuyên nghiệp hơn".
- Chỉ khi tác động phụ vừa quan trọng vừa dễ thất bại, hoặc đủ chậm để làm luồng yêu cầu tệ đi, mới nâng cấp lên:
  - `Postgres transaction` (giao dịch cơ sở dữ liệu)
  - `outbox_events` (sự kiện chờ phát đi)
  - `dispatcher` (bộ phân phát)
  - `execution queue/worker` (hàng đợi/tiến trình thực thi)
- Không phát các sự kiện nghiệp vụ (business event) quan trọng bằng các cơ chế "phát và quên" (fire-and-forget) hoặc gọi trực tiếp nếu sự kiện đó đã được xác định là cần độ tin cậy.
- Khi hàng đợi thực thi tồn tại, kho lưu trữ trong bộ nhớ (in-memory store) được ưu tiên là `Valkey`; bản triển khai ưu tiên là `BullMQ` thay vì tự xây dựng các cơ chế hàng đợi.
- `Temporal` và `QStash` không phải là nền tảng (baseline) cho giai đoạn hiện tại.

### Rationale (Cơ sở lý luận)
- Tránh biến hạ tầng thành các bài tập lý thuyết trong sách vở trước khi tính năng thực sự cần tới.
- Giữ cho luồng yêu cầu (request path) đơn giản ở giai đoạn hiện tại.
- Khi đã nâng lên độ tin cậy bất đồng bộ (async reliability), vẫn có con đường đúng đắn để thử lại, phát lại, kiểm tra và đối soát (reconciliation).

### Trade-off (Sự đánh đổi)
- Nếu giữ xử lý đồng bộ (sync) lâu hơn, một số luồng yêu cầu có thể chậm hơn một chút nhưng sẽ cực kỳ dễ hiểu.
- Nếu kích hoạt bộ công cụ tin cậy bất đồng bộ, hệ thống sẽ có tính nhất quán sau cùng (eventual consistency).
- Bộ công cụ bất đồng bộ đòi hỏi tính bất biến khi gọi lại (idempotency), chính sách thử lại, xử lý công việc lỗi (poison-job handling), và trạng thái/sức khỏe (status/health) rõ ràng; không được làm nửa vời.

## Decision 7. Search đi theo phase (Tìm kiếm theo giai đoạn): Postgres-first (ưu tiên Postgres) trước, Meilisearch projection (phản chiếu Meilisearch) sau khi đủ xứng đáng

### Context (Bối cảnh)
Tìm kiếm là nơi rất dễ bị xây dựng quá mức (overbuild).
Nếu dung lượng nội dung còn nhỏ hoặc người dùng chưa dùng tìm kiếm như một tính năng cốt lõi, truy vấn Postgres thường là đủ để phát hành và gỡ lỗi.

### Decision (Quyết định)
- Giai đoạn 1 (Phase 1):
  - tìm kiếm công khai có thể chạy trực tiếp trên `Postgres / SQL / luồng đọc chuẩn gốc (canonical read path)`.
  - chỉ đánh chỉ mục hóa hoặc phản chiếu hóa khi tìm kiếm đã trở thành tính năng đủ quan trọng.
- Khi bật công cụ tìm kiếm riêng:
  - các trường nguồn tìm kiếm nằm trên chính các tập hợp chủ quản (owner collections).
  - chỉ các tài liệu đã xuất bản mới được đánh chỉ mục.
  - luồng chuẩn (flow chuẩn) là:
    - ghi dữ liệu chuẩn (canonical write) tại nơi sở hữu nội dung.
    - thêm sự kiện vào outbox (outbox event) trong cùng một giao dịch (transaction).
    - bộ phân phát (dispatcher) phát công việc thực thi đồng bộ tìm kiếm.
    - tiến trình xử lý nền (worker/indexer) cập nhật Meilisearch.
  - tìm kiếm công khai vẫn phải có đường dự phòng (fallback) về SQL/API nếu Meilisearch không sẵn dụng (unavailable).
  - việc đồng bộ tìm kiếm được đảm bảo là `at-least-once async (bất đồng bộ ít nhất một lần) projection`, không phải là một bản sao đồng bộ tức thời (exactly-once synchronous mirror).
  - dữ liệu đồng bộ tìm kiếm (payload) phải có tính bất biến (idempotent) và có đường phục hồi thông qua việc đánh chỉ mục lại hàng loạt (batch reindex) hoặc kiểm tra trạng thái.
- `pgvector` không thay thế cho Meilisearch; nó chỉ là khả năng bổ sung khi đã chốt rõ các tính năng gợi ý / nội dung liên quan / tìm kiếm theo nghĩa (retrieval).

### Rationale (Cơ sở lý luận)
- Giữ tính năng tìm kiếm tương xứng với quy mô hiện tại.
- Không biến tìm kiếm thành một dịch vụ bắt buộc phải lưu trạng thái (stateful service) quá sớm.
- Khi đã bật Meilisearch, vẫn giữ dữ liệu chỉ mục là các tài liệu được tính toán (computed document) thay vì dữ liệu chuẩn gốc.

### Trade-off (Sự đánh đổi)
- Tìm kiếm Postgres không mang lại trải nghiệm (UX) phong phú bằng Meilisearch nếu dung lượng và độ phức tạp của tìm kiếm tăng lên.
- Khi bật Meilisearch sẽ phát sinh thê gánh nặng về sao lưu, đánh chỉ mục lại, xử lý sai lệch (drift handling) và giám sát.
- Muốn thêm tính năng gợi ý bằng `pgvector` sẽ làm tăng độ phức tạp của quy trình nhúng dữ liệu (embedding pipeline) và chính sách lưu giữ (retention policy).

## Decision 8. Cache strategy (Chiến lược bộ nhớ đệm) chỉ áp dụng cho published public reads (các yêu cầu đọc nội dung đã xuất bản công khai)

### Context (Bối cảnh)
`Valkey` (`Redis-compatible`) hiện được phép dùng cho bộ nhớ đệm (cache) nhưng không được phép chứa đựng sự thật nghiệp vụ chuẩn gốc (canonical business truth).

### Decision (Quyết định)
- Chỉ nội dung công khai đã xuất bản (published public content) mới được đưa vào bộ nhớ đệm dùng chung (shared cache).
- Bản nháp, nội dung chờ kiểm duyệt, hàng đợi kiểm duyệt, và trạng thái cá nhân của người dùng không dùng bộ nhớ đệm dùng chung làm nguồn dữ liệu chính.
- Việc hủy giá trị (Invalidations) gắn liền với các hành động xuất bản/cập nhật quan trọng, không gắn với mọi thay đổi tạm thời.

### Rationale (Cơ sở lý luận)
- Đảm bảo an toàn cho khả năng hiển thị nội dung (content visibility).
- Giảm thiểu độ phức tạp so với việc phải xây dựng một ma trận hủy bộ nhớ đệm (cache invalidation matrix) đầy đủ.

### Trade-off (Sự đánh đổi)
- Một số thống kê hoặc mô hình dữ liệu đọc (derived read model) có thể bị trễ nhẹ.
- Luồng đọc (Read path) có thể phải quay về cơ sở dữ liệu (DB) cho các dữ liệu riêng tư hoặc dữ liệu vừa mới thay đổi.

## Decision 9. Module boundaries (Ranh giới mô-đun) ưu tiên owner (chủ sở hữu) rõ ràng hơn là abstraction (sự trừu tượng) đẹp đẽ

### Context (Bối cảnh)
Thiết kế cũ từng để mô-đun nội dung (content) ôm đồm cả sự tương tác (engagement) và danh sách mong muốn.
Repo hiện tại đã chia nhỏ các tập hợp (collections) khá rõ ràng.

### Decision (Quyết định)
- `content`: chỉ giữ nội dung biên tập, phân loại (taxonomy), truyền thông (media), thư viện kinh điển (scripture library), các trường tìm kiếm nội dung, và nội dung tham chiếu hỗ trợ thực hành (như các mục lễ bái, kế hoạch lễ bái, hướng dẫn nghi thức, bài khai thị gốc).
- `community`: giữ các bề mặt thảo luận.
- `engagement`: giữ trạng thái cá nhân của người dùng, bao gồm cả các tờ thực hành (practiceSheets) và tờ Ngôi Nhà Nhỏ (ngoiNhaNhoSheets).
- `calendar`: giữ dữ liệu lập lịch sự kiện/âm lịch và mô hình dữ liệu đọc cho lịch tu tập cá nhân.
- `notification`: giữ lớp điều phối phân phối thông báo (delivery control-plane).
- `search`: giữ các hợp đồng đánh chỉ mục/truy vấn, không giữ dữ liệu nghiệp vụ chuẩn gốc.
- `08-vows-merit`: giữ các bản ghi cá nhân cho `Phát nguyện` và `Phóng sanh`.
- `09-wisdom-qa`: giữ các bản ghi truy xuất đã được tuyển chọn cho `Bạch thoại Phật pháp`, `Huyền học vấn đáp`, âm thanh/video hỗ trợ học tập.

### Rationale (Cơ sở lý luận)
- Khớp với cấu trúc tập hợp (collection layout) hiện tại.
- Giảm nguy cơ AI tạo nhầm thư mục hoặc dịch vụ nghiệp vụ (service).
- Dễ dàng rà soát (review) hơn cho một nhà phát triển độc lập (solo dev).

### Trade-off (Sự đánh đổi)
- Một số luồng xử lý phải đi qua việc tham chiếu liên mô-đun (cross-module references) thay vì nằm gọn trong một tập hợp lớn.
- Cần tài liệu hóa các tương tác rõ ràng để tránh trùng lặp logic.

### Ghi chú thêm từ tài liệu PDF thực hành
- Các tài liệu PDF về Niệm kinh / Phát nguyện / Phóng sinh / Ngôi Nhà Nhỏ củng cố ranh giới trách nhiệm này:
  - kịch bản (script), lời khấn mẫu, số biến, quy tắc thời gian, danh sách kiểm tra nghi thức thuộc về lớp nội dung tham chiếu/công khai.
  - tiến độ cá nhân, cấu hình kế hoạch theo người dùng, nhật ký tu tập vẫn là trạng thái tương tác cá nhân (engagement state).

## Decision 10. Auditability (Khả năng kiểm tra) ưu tiên append-only log + denormalized summaries (nhật ký chỉ thêm + tóm tắt phi chuẩn hóa)

### Context (Bối cảnh)
Repo đã có `auditLogs`, `moderationReports`, `pushJobs`, và nhiều trường dữ liệu tóm tắt.

### Decision (Quyết định)
- Các hành động hệ thống quan trọng nên có bản ghi chỉ thêm (append-only record) hoặc bản ghi công việc (job record) riêng.
- Các trường tóm tắt (Summary fields) trên đối tượng đích được phép tồn tại để tối ưu luồng đọc (read path).
- Trường tóm tắt không được thay thế cho bản ghi nguồn (source record) của mô-đun gốc.

### Rationale (Cơ sở lý luận)
- Giữ được khả năng điều tra khi có lỗi hoặc tranh chấp về kiểm duyệt (moderation).
- Phù hợp với mô hình tiến trình xử lý nền (worker)/công việc (job) hiện tại.

### Trade-off (Sự đánh đổi)
- Phát sinh thêm bước đồng bộ tóm tắt (sync summary).
- Thiết kế luồng đọc (read path) cần phân định rõ trường nào là chuẩn gốc (canonical), trường nào là tóm tắt (summary).

## Decision 11. Runtime boundary validation (Kiểm tra ranh giới lúc thực thi) và env contracts (hợp đồng môi trường) là bắt buộc

### Context (Bối cảnh)
Hệ thống có nhiều ranh giới (boundary): yêu cầu công khai, hành động quản trị, dữ liệu hàng đợi, phản hồi ngược (webhook), tài liệu tìm kiếm, cấu hình môi trường/thực thi.

### Decision (Quyết định)
- Mọi ranh giới quan trọng phải có việc kiểm tra lược đồ lúc thực thi (schema validation runtime) rõ ràng.
- `Zod` là lựa chọn mặc định cho các đối tượng chuyển đổi dữ liệu yêu cầu (request DTO), dữ liệu hàng đợi, dữ liệu webhook, lược đồ tài liệu tìm kiếm và hợp đồng môi trường.
- Kiểu dữ liệu của TypeScript (typing) không được coi là đủ cho tính an toàn tại ranh giới lúc thực thi.
- Việc kiểm tra tại ranh giới không thay thế cho:
  - ủy quyền (authorization)
  - chính sách chống lạm dụng (anti-abuse policy)
  - bảo vệ chống phát lại (replay protection)
  - bất biến nghiệp vụ (business invariant)
  - bảo mật tải lên (upload security)
  - kiểm soát chi phí truy vấn (query cost control)

### Rationale (Cơ sở lý luận)
- Thất bại sớm (Fail fast).
- Giảm thiểu sự sai lệch dữ liệu âm thầm (silent corruption) và sự lệch pha giữa bên sản xuất (producer) và bên tiêu thụ (consumer).
- Dễ dàng gỡ lỗi hơn khi hệ thống có hàng đợi xử lý nền và các phản chiếu cấp dưới.

### Trade-off (Sự đánh đổi)
- Tốn thêm công sức viết lược đồ (schema) và giữ gìn các phiên bản.
- Có thể phải cập nhật lược đồ ở nhiều nơi khi hợp đồng (contract) thay đổi.

## Decision 11B. NestJS application baseline (Nền tảng ứng dụng NestJS) phải "khóa sổ" trước khi scaffold (tạo khung) hàng loạt

### Context (Bối cảnh)
Khi đã chốt `NestJS` là quyền lực phía sau (backend authority), thứ làm dự án đổ vỡ nhanh nhất không phải là thiếu khung phần mềm mà là thiếu chuẩn chung cho ORM, kiểm tra đầu vào (validation), bộ canh phòng (guards), định dạng lỗi và trình ghi nhật ký (logger).
Nếu không khóa sổ ngay từ đầu, AI/nhà phát triển sẽ tạo ra nhiều phong cách (style) song song trong cùng một mã nguồn.

### Decision (Quyết định)
- ORM mặc định: `Prisma`
- Kiểm tra đầu vào lúc thực thi mặc định: `Zod`
- Kiểm tra yêu cầu đi qua `ZodValidationPipe` tùy chỉnh.
- không dùng `class-validator` làm nguồn sự thật (source of truth) mặc định.
- Trình ghi nhật ký (logger) mặc định: `Pino` thông qua tích hợp Nest.
- Xử lý lỗi (error handling) mặc định:
  - bộ lọc ngoại lệ toàn cục (global exception filter)
  - vỏ bọc lỗi (error envelope) thống nhất có `code`, `message`, `status`, `requestId`.
- Chuỗi bộ canh phòng (guard chain) mặc định:
  - auth guard (bộ canh phòng xác thực)
  - role/permission guard (bộ canh phòng vai trò/quyền)
  - rate-limit guard (bộ canh phòng giới hạn tần suất)
  - validation pipe trước logic xử lý chính.

### Rationale (Cơ sở lý luận)
- Giảm thiểu sự lệch pha (drift) giữa các mô-đun.
- Giữ cho hợp đồng API, định dạng nhật ký, và tư thế gỡ lỗi được nhất quán.
- Phù hợp với việc lập trình có hỗ trợ của AI vì nguồn sự thật rõ ràng hơn.

### Trade-off (Sự đánh đổi)
- Cần đầu tư thời gian để khởi tạo (bootstrap) và xây dựng nền tảng ứng dụng kỹ lưỡng trước khi viết tính năng.
- Không thể để tình trạng "tùy mô-đun thích dùng decorator DTO hay phong cách lược đồ nào cũng được".

## Decision 11A. Security (Bảo mật) phải là tư thế có chính sách (posture with policy), không chỉ là danh sách các danh từ (checklist of nouns)

### Context (Bối cảnh)
Cookie, CSRF, CORS, RBAC, giới hạn tần suất, thắt chặt bảo mật tải lên và quản lý bí mật đều đã được nhắc tới trong thiết kế.
Nhưng nếu chỉ dừng ở mức "nhắc tới", hệ thống vẫn rất dễ tạo ra cảm giác an toàn giả tạo.

### Decision (Quyết định)
- Giai đoạn hiện tại (Current phase) phải chốt rõ bằng chính sách (policy):
  - mô hình phiên/mã (session/token model)
  - chính sách xoay vòng và ý nghĩa thu hồi mã làm mới (refresh token rotation & revoke semantics)
  - bộ canh phòng chống dò mật khẩu (brute-force guard) theo IP và tài khoản/email.
  - kiểm soát lạm dụng việc thiết lập lại mật khẩu / xác minh email.
  - danh sách cho phép CORS (CORS allowlist).
  - CSP và các tiêu đề bảo mật (security headers).
  - danh sách tệp được phép, dung lượng, kiểm tra loại tệp, ủy quyền xóa của luồng tải lên.
  - lưu trữ và xoay vòng bí mật (secret storage & rotation).
  - xác thực webhook nếu có webhook đầu vào.
- Không coi bảo mật là "đã có" nếu chưa viết được chính sách vận hành và bản triển khai tương ứng.

### Rationale (Cơ sở lý luận)
- Giảm thiểu "kịch bản bảo mật" (security theater - giả vờ an toàn).
- Buộc người triển khai phải suy nghĩ theo các trường hợp lạm dụng thực tế thay vì danh sách kiểm tra đẹp đẽ.

### Trade-off (Sự đánh đổi)
- Tăng lượng quyết định phải ghi rõ ngay từ đầu.
- Đòi hỏi kỷ luật cao hơn trong việc xác thực, tải lên, hành động quản trị và luồng triển khai.

## Decision 12. Media/file (Truyền thông/tập tin) phải đi qua storage abstraction (lớp trừu tượng lưu trữ); phase hiện tại dùng local adapter, phase mục tiêu là S3-compatible

### Context (Bối cảnh)
Thực tế sản xuất hiện tại (current production reality) của PMTL_VN là chạy trên 1 VPS và chưa dùng lưu trữ đối tượng (object storage) ngay lập tức.
Tuy vậy truyền thông/tập tin vẫn là các tài sản nhị phân có rủi ro mất dữ liệu, khó sao lưu, và là một ranh giới bảo mật riêng.

### Decision (Quyết định)
- Media/file phải đi qua lớp trừu tượng lưu trữ (storage abstraction) rõ ràng, không để nghiệp vụ (business logic) phụ thuộc trực tiếp vào đường dẫn hệ thống tập tin cục bộ (local filesystem path).
- Giai đoạn hiện tại (Current phase):
  - cho phép `local disk storage` (lưu trữ trên đĩa nội bộ) trên VPS.
  - nhưng vẫn phải có lớp giao tiếp/bộ chuyển đổi (adapter/interface) lưu trữ rõ ràng.
  - siêu dữ liệu tệp (metadata file) nằm chuẩn gốc trong Postgres.
- Giai đoạn mục tiêu (Target phase):
  - chuyển sang `S3-compatible object storage` (lưu trữ đối tượng tương thích S3).
  - không thay đổi logic nghiệp vụ phía trên bộ chuyển đổi.
- Quy trình tải lên (Upload pipeline) phải tách biệt:
  - siêu dữ liệu chuẩn gốc (metadata canonical)
  - đối tượng nhị phân (binary object)
  - trạng thái quét/cách ly/xuất bản (scan/quarantine/publish state) khi tính năng đó được kích hoạt.
- Lưu trữ nội bộ (Local storage) phải bị coi là một điểm yếu đã biết:
  - đĩa đầy (disk full)
  - gắn phân vùng sai (volume mount error)
  - sự lệch pha khi phục hồi DB và phục hồi tập tin
  - xóa nhầm tập tin khó khôi phục

### Rationale (Cơ sở lý luận)
- Khớp với điều kiện hạ tầng hiện tại của dự án.
- Không khóa chặt nghiệp vụ vào các đường dẫn nội bộ.
- Cho phép nâng cấp lên `S3` sau này mà không phải thực hiện cấu trúc lại (refactor) lớn.

### Trade-off (Sự đánh đổi)
- Giai đoạn hiện tại vẫn phải chịu rủi ro của đĩa nội bộ nếu VPS có sự cố.
- Tăng thêm yêu cầu trong việc thiết kế bộ chuyển đổi (adapter), siêu dữ liệu, và cấu hình lưu trữ.

## Decision 13. Observability (Khả năng giám sát) nên triển khai theo pha: lean baseline (nền tảng tinh gọn) trước, traces (truy vết) nâng cấp sau

### Context (Bối cảnh)
Nhật ký (Logs), kiểm tra sức khỏe (health checks) và một vài chỉ số (metrics) cơ bản là cần thiết ngay lập tức.
Nhưng việc tự vận hành (self-host) cả bộ công cụ giám sát đầy đủ trên một `single VPS` có thể gánh nặng hơn lợi ích mang lại ở giai đoạn hiện tại.

### Decision (Quyết định)
- Nền tảng giai đoạn hiện tại (Baseline current phase):
  - `Pino` (trình ghi nhật ký)
  - điểm cuối chỉ số ứng dụng `/metrics` (app metrics)
  - các điểm cuối kiểm tra sức khỏe (health endpoints)
  - tài liệu vận hành (runbook) + diễn tập phục hồi (restore drill)
- `Prometheus + Grafana + Alertmanager` chỉ kích hoạt khi đã có các kịch bản sử dụng chỉ số và cảnh báo rõ ràng.
- Truy vết (Tracing) là giai đoạn nâng cấp:
  - chỉ kích hoạt khi có nhu cầu thực tế trong việc điều tra độ trễ (latency) hoặc luồng xử lý phân tán (distributed flow).
  - nếu kích hoạt sớm, ưu tiên cân nhắc các dịch vụ được quản lý (managed backend) như `Grafana Cloud` trước khi tự vận hành `Tempo`.
- Khi truy vết được kích hoạt, ngữ cảnh truy vết (trace context) nên đi xuyên suốt qua web, api, worker, các lệnh gọi DB, các lệnh gọi tìm kiếm, bàn giao hàng đợi và các lệnh gọi webhook.

### Rationale (Cơ sở lý luận)
- Giữ cho khả năng giám sát đủ dùng mà không bắt một máy chủ ảo (VPS) phải gánh quá nhiều thành phần quá sớm.
- Vẫn để ngỏ con đường nâng cấp lên truy vết (traces) khi hệ thống trở nên phức tạp hơn.

### Trade-off (Sự đánh đổi)
- Nền tảng tinh gọn (Baseline lean) sẽ có ít chi tiết hơn so với bộ công cụ truy vết đầy đủ (full tracing stack).
- Nếu trì hoãn việc truy vết quá lâu, việc điều tra độ trễ chéo giữa các dịch vụ sẽ trở nên khó khăn hơn.

## Decision 14. Semantic retrieval (Truy xuất ngữ nghĩa) nâng cấp theo hướng optional capability (khả năng tùy chọn), không ép thành mặc định

### Context (Bối cảnh)
Tìm kiếm văn bản (search text) và tìm kiếm theo nghĩa (search semantic) không phải là cùng một bài toán.

### Decision (Quyết định)
- Khi công cụ tìm kiếm riêng đã được kích hoạt, `Meilisearch` là lựa chọn chính cho ô tìm kiếm công khai.
- `pgvector` chỉ thêm vào khi đã chốt kịch bản sử dụng rõ ràng:
  - nội dung liên quan (related-content)
  - gợi ý (recommendation)
  - truy xuất theo nghĩa (semantic retrieval) / "bài viết gần nghĩa".
- Không kích hoạt `pgvector` chỉ vì "muốn có AI".

### Rationale (Cơ sở lý luận)
- Tránh việc thiết kế quá mức (over-engineer).
- Giữ cho tìm kiếm công khai đơn giản và nhanh chóng.

### Trade-off (Sự đánh đổi)
- Nếu muốn có tính năng gợi ý chất lượng cao hơn, phải đầu tư vào quy trình nhúng dữ liệu (embedding pipeline), lưu giữ, đánh chỉ mục lại và đánh giá chất lượng.

## Decision 15. App-layer rate limit (Giới hạn tần suất ở tầng ứng dụng) là bắt buộc; shared counter store (kho lưu trữ bộ đếm dùng chung) chỉ bật khi luồng xử lý thực sự cần

### Context (Bối cảnh)
Xác thực công khai, tìm kiếm, gửi biểu mẫu, và tải tệp đều là các bề mặt dễ bị lạm dụng hoặc gặp tình trạng quá tải đột ngột (accidental burst) trên một máy chủ ảo (VPS).

### Decision (Quyết định)
- Giới hạn tần suất (Rate limit) phải được đặt ở tầng ứng dụng (app layer).
- Khi luồng xử lý đã cần bộ đếm dùng chung chính xác hơn hoặc ứng dụng đã có nhiều tiến trình/môi trường thực thi, ưu tiên dùng `Valkey` hoặc kho lưu trữ tương thích Redis làm kho lưu trữ bộ đếm (counter store).
- Áp dụng tối thiểu cho các hành động:
  - đăng nhập (login)
  - đăng ký (register)
  - quên mật khẩu (forgot password)
  - tạo bài viết/bình luận (create post/comment)
  - tìm kiếm (search)
  - tải tệp (upload file)
- Quy tắc có thể dựa theo IP, mã người dùng (user ID), hoặc cả hai tùy theo luồng xử lý.

### Rationale (Cơ sở lý luận)
- Bảo vệ ứng dụng trước sự lạm dụng ngay từ giai đoạn đầu.
- Việc thêm kho lưu trữ bộ đếm dùng chung vẫn là giải pháp rẻ và phù hợp với hạ tầng hiện tại.

### Trade-off (Sự đánh đổi)
- Làm tăng thêm độ phức tạp tại ranh giới yêu cầu (request boundary).
- Khi dùng kho lưu trữ bộ đếm dùng chung như `Valkey`, cần có chính sách xuống cấp (degrade policy) rõ ràng thay vì để trống các lớp bảo vệ.

## Decision 16. Health endpoints (Điểm cuối kiểm tra sức khỏe) là baseline (nền tảng) bắt buộc; metrics stack (bộ chỉ số) đầy đủ đi theo phase

### Context (Bối cảnh)
Ngay cả hệ thống đơn giản cũng cần có trạng thái sẵn sàng (readiness) rõ ràng.
Bộ chỉ số (Metrics stack) đầy đủ chỉ đáng để kích hoạt khi bạn thực sự đọc và sử dụng được nó.

### Decision (Quyết định)
- Phải có các điểm cuối:
  - `/health/live` (kiểm tra sự sống)
  - `/health/ready` (kiểm tra sự sẵn sàng)
  - `/health/startup` (kiểm tra khởi động)
  - `/metrics` (chỉ số đo lường)
- `ready` phải kiểm tra tối thiểu:
  - Postgres
  - thư mục gốc lưu trữ nội bộ (local storage base dir) ở mức hợp lý khi giai đoạn hiện tại còn dùng đĩa nội bộ.
- Nếu `Valkey` / `Meilisearch` đã kích hoạt thì `ready` mới cần kiểm tra thêm các phụ thuộc đó.
- Chỉ số ứng dụng (App metrics) giai đoạn 1 phải phản ánh tối thiểu:
  - yêu cầu (request)
  - độ trễ (latency)
  - lỗi (error)
  - tải lên (upload)
  - giới hạn tần suất (rate-limit)
- Nếu hàng đợi/sự kiện chờ phát/tìm kiếm đã kích hoạt thì các chỉ số mới cần phản ánh thêm về các thành phần đó.

### Rationale (Cơ sở lý luận)
- Giúp cho việc triển khai và phục hồi bớt "mù quáng" hơn.
- Không bắt buộc giai đoạn đầu phải ôm đồm cả bộ công cụ giám sát khổng lồ.

### Trade-off (Sự đánh đổi)
- Tốn công sức trong việc chuẩn hóa tên gọi các chỉ số và chính sách kiểm tra sức khỏe.

## Decision 17. Audit log (Nhật ký kiểm tra) và feature flags (Cờ tính năng) là hai control-plane (lớp điều phối) tối thiểu nên có từ sớm

### Context (Bối cảnh)
Hệ thống đang tăng số lượng mô-đun và các luồng xử lý nhạy cảm; vừa cần khả năng điều tra, vừa cần triển khai an toàn cho các tính năng mới.

### Decision (Quyết định)
- `audit_logs` là bảng cắt ngang chỉ cho phép thêm (append-only cross-cutting table) dành cho các hành động quan trọng.
- `feature_flags` là bảng điều khiển tối thiểu cho việc triển khai theo khóa (key).
- Các hàm hỗ trợ như `isFeatureEnabled(key)` là đủ cho phạm vi hiện tại; chưa cần các nền tảng cấu hình từ xa (remote config platform).
- `audit_logs` phải đủ để trả lời các câu hỏi:
  - ai vừa làm gì?
  - vào lúc nào?
  - trên đối tượng (entity) nào?
  - từ bề mặt (surface) nào?
- `feature_flags` phải đủ để tắt các tính năng bị lỗi mà không cần phải triển khai lại mã nguồn ngay lập tức.

### Rationale (Cơ sở lý luận)
- Rất xứng đáng đầu tư trên một máy chủ ảo (VPS) vì chi phí thấp nhưng mang lại giá trị cao.
- Giúp bật các tính năng mới dần dần mà không phải đối mặt với các rủi ro từ luồng mã nguồn chưa được kiểm chứng.

### Trade-off (Sự đánh đổi)
- Cần tính kỷ luật để không lạm dụng cờ tính năng thành các cấu hình rác.

## Decision 17A. Data correctness (Tính chính xác của dữ liệu) và dependency hygiene (Vệ sinh phụ thuộc) phải đứng trước infra elegance (sự thanh lịch của hạ tầng)

### Context (Bối cảnh)
Nhà phát triển độc lập (Solo dev) rất dễ bị thu hút vào các dịch vụ mới, bảng điều khiển mới, hoặc các gói phần mềm mới mà bỏ quên các ràng buộc duy nhất (unique constraint), ranh giới giao dịch (transaction boundary), cơ chế bảo vệ hành động phá hủy (destructive action guard), và các rủi ro từ sự phụ thuộc.

### Decision (Quyết định)
- Mọi luồng ghi (write path) chính phải chốt rõ:
  - các ràng buộc duy nhất (unique constraints)
  - ranh giới giao dịch (transaction boundaries)
  - rủi ro khi thử lại/tính bất biến (retry/idempotency risk)
  - xác nhận hành động phá hủy (destructive action confirmation)
  - các giả định về múi giờ/ngôn ngữ (timezone/locale assumptions)
- Mọi phụ thuộc mới phải có lý do rõ ràng:
  - giải quyết bài toán gì?
  - có được bảo trì tốt không?
  - giấy phép có chấp nhận được không?
  - có thể loại bỏ bớt các gói nào khác không?
- Sự đơn giản trong vận hành (Operational simplicity) được ưu tiên hơn sự thanh lịch về kỹ thuật.

### Rationale (Cơ sở lý luận)
- Các hệ thống nhỏ thường chết vì dữ liệu sai và các gói phần mềm rác nhanh hơn là vì thiếu một dịch vụ hạ tầng.
- Giúp thiết kế bám sát vào tính "dễ sống sót" thay vì "trông đúng bài bản".

### Trade-off (Sự đánh đổi)
- Các tài liệu sẽ trở nên bớt "quyến rũ" và ít từ khóa (buzzword) hơn.
- Buộc người làm phải nghiêm túc với những công việc nhàm chán nhưng quan trọng như ràng buộc dữ liệu, kế hoạch di cư, kế hoạch rút lui, rà soát phụ thuộc.

## Decision 18. Managed free-tier services (Các dịch vụ quản lý có tầng miễn phí) được ưu tiên khi giúp giảm tải vận hành mà không phá vỡ quyền sở hữu

### Context (Bối cảnh)
PMTL_VN đang đi theo hướng `single VPS`, chi phí thấp, và cần tránh việc tự vận hành quá nhiều thành phần khi chưa thực sự cần thiết.

### Decision (Quyết định)
- Được ưu tiên dùng các dịch vụ quản lý/tầng miễn phí nếu:
  - không làm mất ranh giới sở hữu (ownership boundary) đã chốt.
  - không tạo ra quyền lực xác thực (auth authority) thứ hai.
  - không bắt buộc phải cấu trúc lại lớn logic nghiệp vụ.
- Các ứng cử viên ưu tiên hiện tại (Current preferred candidates):
  - `Cloudflare R2` cho mục tiêu lưu trữ đối tượng.
  - `Cloudflare` tại ranh giới phía trước `Caddy`.
  - `Grafana Cloud` nếu cần các tính năng truy vết/nhật ký/chỉ số mà không muốn tự vận hành cả bộ công cụ.
- Các sự thay đổi không được ưu tiên hiện tại (Current non-preferred swaps):
  - đổi `Meilisearch` sang các dịch vụ tìm kiếm trả phí chỉ vì “tốt hơn”.
  - đổi cơ sở dữ liệu Postgres chuẩn gốc hiện tại sang nền tảng khác mà không có áp lực di cư rõ rệt.

### Rationale (Cơ sở lý luận)
- Thực dụng hơn cho các nhóm nhỏ và ngân sách thấp.
- Giảm bớt gánh nặng vận hành nhưng vẫn giữ được kiến trúc rõ ràng.

### Trade-off (Sự đánh đổi)
- Làm tăng sự phụ thuộc vào các nhà cung cấp bên ngoài ở một số lớp hạ tầng.
