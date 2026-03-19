# PMTL_VN Domain Map (Bản đồ nghiệp vụ PMTL_VN)

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# PMTL_VN

> Ghi chú cho sinh viên (Note for students):
> File này giống như bản đồ thành phố (This file is like a city map).
> Nó giúp bạn biết module nào đang tồn tại thật trong repo (It helps you know which modules actually exist in the repo) và module nào đang là current scope (Phạm vi hiện tại) cần triển khai (needs to be implemented).

## Current Scope (Phạm vi hiện tại)

### 01. Identity (Danh tính & Tài khoản)
- **Owner (Chủ sở hữu)**: `users`
- **Authority (Thẩm quyền xác thực)**: Payload auth
- **Responsibilities (Trách nhiệm)**:
  - đăng ký, đăng nhập, đăng xuất (register, login, logout)
  - reset mật khẩu (reset password)
  - Google login trong cùng auth authority (Google login within the same auth authority)
  - role + block state (vai trò + trạng thái khóa)
  - profile cơ bản (basic profile)
- **Current role set (Nhóm vai trò hiện tại)**:
  - `super-admin` (Quản trị viên cấp cao)
  - `admin` (`Phụng sự viên`)
  - `member` (Thành viên)

### 02. Content (Nội dung)
- **Editorial collections (Bộ sưu tập biên tập)**:
  - `posts` (Bài viết)
  - `hubPages` (Trang trung tâm)
  - `beginnerGuides` (Hướng dẫn cho người mới)
  - `downloads` (Tải về)
  - `chantItems` (Mục niệm kinh)
  - `chantPlans` (Kế hoạch niệm kinh)
  - `media` (Phương tiện truyền thông)
  - `categories` (Danh mục)
  - `tags` (Thẻ)
- **Scripture library (Thư viện kinh văn)**:
  - `sutras` (Kinh điển)
  - `sutraVolumes` (Quyển kinh)
  - `sutraChapters` (Chương kinh)
  - `sutraGlossary` (Thuật ngữ kinh văn)
- **Responsibilities (Trách nhiệm)**:
  - editorial authoring (Soạn thảo nội dung biên tập)
  - publish workflow (Quy trình xuất bản)
  - taxonomy (Phân loại học)
  - media linking (Liên kết phương tiện)
  - content search fields (Các trường tìm kiếm nội dung)
  - giới thiệu pháp môn và sơ học (Introduction to the dharma door and beginner learning)
  - official notices, hub pages, download hubs (Thông báo chính thức, trang trung tâm, trung tâm tải về)
  - practice support reference content cho niệm kinh / nghi thức / Ngôi Nhà Nhỏ / bài khai thị (Nội dung tham khảo hỗ trợ tu tập cho niệm kinh, nghi thức, Ngôi Nhà Nhỏ, và bài khai thị)

### 03. Community (Cộng đồng)
- **Discussion surfaces (Bề mặt thảo luận)**:
  - `postComments` (Bình luận bài viết)
  - `communityPosts` (Bài viết cộng đồng)
  - `communityComments` (Bình luận cộng đồng)
  - `guestbookEntries` (Mục lưu bút)
- **Responsibilities (Trách nhiệm)**:
  - public discussion (Thảo luận công khai)
  - community submissions (Đóng góp từ cộng đồng)
  - guestbook messages (Tin nhắn lưu bút)
  - report initiation toward moderation (Khởi tạo báo cáo vi phạm gửi đến bộ phận kiểm duyệt)

### 04. Engagement / Practice Support (Gắn kết / Hỗ trợ tu tập)
- **Self-owned user state (Trạng thái người dùng tự sở hữu)**:
  - `sutraBookmarks` (Đánh dấu kinh văn)
  - `sutraReadingProgress` (Tiến trình đọc kinh)
  - `chantPreferences` (Tùy chỉnh niệm kinh)
  - `practiceLogs` (Nhật ký tu tập)
  - `practiceSheets` (Tờ khai tu tập)
  - `ngoiNhaNhoSheets` (Tờ khai Ngôi Nhà Nhỏ)
- **Responsibilities (Trách nhiệm)**:
  - bookmark (Đánh dấu)
  - reading progress (Tiến trình đọc)
  - practice configuration (Cấu hình tu tập)
  - personal practice history (Lịch sử tu tập cá nhân)
  - daily practice sheets (Tờ khai tu tập hàng ngày)
  - Ngôi Nhà Nhỏ inventory và tiến độ theo từng tờ (Kho Ngôi Nhà Nhỏ và tiến độ theo từng tờ)

### 05. Moderation (Kiểm duyệt)
- **Owner (Chủ sở hữu)**: `moderationReports`
- **Summary fields on target entities (Các trường tóm tắt trên thực thể mục tiêu)**:
  - `reportCount` (Số lượng báo cáo)
  - `lastReportReason` (Lý do báo cáo gần nhất)
  - `isHidden` (Đang bị ẩn)
  - `approvalStatus` (Trạng thái phê duyệt)
  - `moderationStatus` (Trạng thái kiểm duyệt)
- **Responsibilities (Trách nhiệm)**:
  - accept report (Tiếp nhận báo cáo)
  - admin/super-admin decision (Quyết định của quản trị viên/quản trị viên cấp cao)
  - sync moderation summary back to target entity (Đồng bộ tóm tắt kiểm duyệt ngược lại thực thể mục tiêu)

### 06. Search (Tìm kiếm)
- **Source fields live in owner collections (Các trường nguồn nằm trong bộ sưu tập chủ sở hữu)**
- **Index (Chỉ mục)**: Meilisearch
- **Queue (Hàng đợi)**: Redis + worker (tiến trình xử lý nền)
- **Current public search contract (Hợp đồng tìm kiếm công khai hiện tại)**:
  - posts search (Tìm kiếm bài viết)
  - wisdom search (Tìm kiếm trí huệ)
  - search status (Trạng thái tìm kiếm)
  - reindex trigger (Kích hoạt lập lại chỉ mục)
- **Responsibilities (Trách nhiệm)**:
  - queue (hàng đợi xử lý) search sync (Đồng bộ tìm kiếm qua hàng đợi)
  - build search document (Xây dựng tài liệu tìm kiếm)
  - serve unified `Kho Trí Huệ` query with fallback (Cung cấp truy vấn hợp nhất "Kho Trí Huệ" với cơ chế dự phòng)

### 07. Calendar (Lịch)
- **Owner collections / read models (Bộ sưu tập chủ sở hữu / mô hình đọc)**:
  - `events` (Sự kiện)
  - `lunarEvents` (Sự kiện âm lịch)
  - `lunarEventOverrides` (Ghi đè sự kiện âm lịch)
  - `personalPracticeCalendarReadModel` (Mô hình đọc lịch tu tập cá nhân)
- **Responsibilities (Trách nhiệm)**:
  - editorial event publishing (Xuất bản sự kiện biên tập)
  - lunar recurrence base (Cơ sở lặp lại âm lịch)
  - per-event practice override mapping (Ánh xạ ghi đè tu tập theo từng sự kiện)
  - compose personal practice calendar read model (Tổng hợp mô hình đọc lịch tu tập cá nhân)

### 08. Notification (Thông báo)
- **Control plane (Mặt phẳng điều khiển)**:
  - `pushSubscriptions` (Đăng ký nhận thông báo đẩy)
  - `pushJobs` (Công việc gửi thông báo đẩy)
  - reminder candidates/materialized jobs (Các ứng viên nhắc nhở/công việc đã cụ thể hóa)
- **Responsibilities (Trách nhiệm)**:
  - store browser subscription state (Lưu trữ trạng thái đăng ký của trình duyệt)
  - store notification preferences used for push delivery (Lưu trữ tùy chỉnh thông báo dùng cho việc gửi đẩy)
  - enqueue internal jobs (Đưa các công việc nội bộ vào hàng đợi)
  - notify admins or affected users asynchronously (Thông báo cho admin hoặc người dùng bị ảnh hưởng một cách bất đồng bộ)

### 09. Vows & Merit (Nguyện & Công đức)
- **Self-owned records (Bản ghi tự sở hữu)**:
  - `vows` (Lời nguyện)
  - `vowProgressEntries` (Cập nhật tiến độ nguyện)
  - `lifeReleaseJournal` (Sổ tay phóng sanh)
- **Responsibilities (Trách nhiệm)**:
  - phát nguyện (making vows)
  - theo dõi tiến độ nguyện (tracking vow progress)
  - sổ tay phóng sanh (life release journal)

### 10. Wisdom & QA (Trí huệ & Giải đáp)
- **Curated retrieval records (Bản ghi truy xuất được chọn lọc)**:
  - `wisdomEntries` (Mục trí huệ)
  - `qaEntries` (Mục giải đáp)
  - `offlineBundles` (Gói ngoại tuyến)
- **Responsibilities (Trách nhiệm)**:
  - Bạch thoại Phật pháp (Plain Talk Buddhism)
  - khai thị / Phật ngôn Phật ngữ (Dharma teachings / Words of the Buddha)
  - Huyền học vấn đáp (Metaphysics QA)
  - Phật học vấn đáp (Buddhism QA)
  - audio/video hỗ trợ đọc học (audio/video supporting reading and learning)
  - offline bundle (gói tải ngoại tuyến) cho người lớn tuổi (offline bundle (gói tải ngoại tuyến) for the elderly)

## Cross-Cutting Runtime (Giao thoa vận hành)

### Infrastructure (Hạ tầng)
- PostgreSQL: canonical app data (Dữ liệu ứng dụng gốc)
- Redis: cache + queue (hàng đợi xử lý) + coordination (Bộ nhớ đệm + hàng đợi + điều phối)
- worker (tiến trình xử lý nền): background processing (Xử lý nền)
- Meilisearch: search index (Chỉ mục tìm kiếm)
- Caddy: reverse proxy / HTTPS (Proxy ngược / HTTPS)

## Current Scope Boundaries (Ranh giới phạm vi hiện tại)

### Content does not own (Content không sở hữu)
- bookmarks (đánh dấu)
- reading progress (tiến trình đọc)
- practice logs (nhật ký tu tập)
- practice sheets (tờ khai tu tập)
- vow records (bản ghi lời nguyện)
- moderation reports (báo cáo kiểm duyệt)
- push jobs (công việc gửi thông báo đẩy)

### Engagement does not own (Engagement không sở hữu)
- canonical sutra content (nội dung kinh văn gốc)
- canonical chant/reference content (nội dung kinh tụng/tham khảo gốc)
- moderation decisions (quyết định kiểm duyệt)

### Search does not own (Search không sở hữu)
- canonical content (nội dung gốc)
- user state (trạng thái người dùng)
- moderation state (trạng thái kiểm duyệt)

### Notification does not own (Notification không sở hữu)
- canonical event/content/community data (dữ liệu sự kiện/nội dung/cộng đồng gốc)
- moderation source-of-truth (nguồn gốc kiểm duyệt)

## Cross-Module Delete Policy (Chính sách xóa liên module)

### Nguyên tắc gốc
- không dùng DB-level cascade delete bừa bãi giữa các module owner
- mặc định ưu tiên `soft delete`, `unpublish`, hoặc `archive` cho dữ liệu public/shared
- nếu có `hard delete`, owner module (module sở hữu) phải kích hoạt cleanup contract (hợp đồng dữ liệu/nghiệp vụ) rõ ràng để không tạo dữ liệu mồ côi

### Ví dụ bắt buộc
- nếu `Content` hard delete một `post`:
  - `Community` phải xóa hoặc tombstone toàn bộ `postComments` liên quan theo cleanup flow
  - `Moderation` phải đóng hoặc tombstone `moderationReports` trỏ tới target đã mất
  - `Search` phải xóa document khỏi index
  - `Notification` phải bỏ qua job còn trỏ tới target không còn tồn tại

### Rule thực dụng
- `postComments`, `communityComments`, `moderationReports`, `search documents` không được phép thành orphan âm thầm
- nếu chưa có cleanup automation hoàn chỉnh, không cho `hard delete` ở admin flow thường; chỉ cho `soft delete`

## Search Sync Guarantee (Cam kết đồng bộ Search)

### Guarantee hiện tại
- canonical write vào Postgres/Payload là bước quyết định
- search sync là `at-least-once async (bất đồng bộ) projection`, không phải đồng bộ tức thì tuyệt đối
- worker (tiến trình xử lý nền) chết giữa chừng không được làm mất canonical write
- job sync phải retry được và `reindex` thủ công phải tồn tại như recovery path

### Rule chống lệch
- search document phải idempotent theo `document id + updatedAt/version`
- status route phải cho thấy:
  - queue (hàng đợi xử lý) lag
  - worker (tiến trình xử lý nền) health
  - index freshness
- public search có fallback (đường dự phòng) qua Payload khi Meilisearch không còn đáng tin

### Outbox pattern
- current scope chưa bắt buộc `outbox pattern`
- lý do: repo đang đi theo Payload + queue (hàng đợi xử lý) + worker (tiến trình xử lý nền) và cần giữ đơn giản
- nhưng `outbox` là hướng nâng cấp hợp lệ nếu:
  - sync lệch xảy ra thường xuyên
  - nhiều downstream consumer cùng phụ thuộc một write
  - retry hiện tại không còn đủ tin cậy

## Permission Boundary (Ranh giới phân quyền)

### `super-admin`
- toàn quyền cross-module
- quản lý role và block state
- xử lý hard delete hoặc recovery operation nhạy cảm

### `admin` (`Phụng sự viên`)
- được tạo, sửa, publish, unpublish, moderate phần dữ liệu thuộc scope vận hành
- được xử lý bài/comment/report của người khác theo policy
- không được đụng vào `super-admin` account
- không được tự nâng quyền lên `super-admin`
- không được hard delete dữ liệu protected nếu policy chỉ cho soft delete

### `member`
- chỉ sở hữu self-state và public/community action của chính mình
- không có quyền moderation hay editorial

## Future Candidates (Ứng viên tương lai)

Chỉ là ứng viên tương lai, chưa phải current scope (Future candidates only, not current scope yet).

### Identity (Danh tính)
- richer public profile pages (trang hồ sơ công khai phong phú hơn)
- account linking policy nhiều provider hơn Google (chính sách liên kết tài khoản với nhiều nhà cung cấp hơn Google)

### Community (Cộng đồng)
- follows / subscriptions theo author hoặc thread (theo dõi / đăng ký theo tác giả hoặc chủ đề)
- richer reaction model ngoài `likes` (mô hình phản ứng phong phú hơn ngoài lượt "thích")

### Engagement (Gắn kết)
- streaks (chuỗi ngày thực hiện liên tiếp)
- stats dashboard (bảng điều khiển thống kê)

### Notification (Thông báo)
- in-app inbox nếu có owner data model riêng (hộp thư trong ứng dụng nếu có mô hình dữ liệu riêng)

Future candidate chỉ được nâng lên current scope khi có (Future candidates are only promoted to current scope when):
- owner collection hoặc owner service (lớp xử lý nghiệp vụ) rõ ràng (có bộ sưu tập hoặc dịch vụ sở hữu rõ ràng)
- API contract (hợp đồng dữ liệu/nghiệp vụ) rõ (có hợp đồng API rõ ràng)
- runtime path rõ (có đường thực thi rõ ràng)

