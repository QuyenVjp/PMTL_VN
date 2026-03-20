# MODULE_INTERACTIONS

> Ghi chú cho sinh viên:
> File này trả lời câu hỏi "module nào được phép đụng vào dữ liệu nào".
> Khi bạn không chắc nên đặt code ở đâu, hãy đọc file này trước.

Tài liệu này mô tả cách các module của PMTL_VN giao tiếp với nhau trong repo hiện tại.
Mục tiêu là làm rõ:

- module nào sở hữu dữ liệu
- module nào chỉ tham chiếu
- gọi trực tiếp hay bất đồng bộ
- side effect nào được phép

## Quy tắc chung

- Chỉ module owner mới được định nghĩa canonical schema (lược đồ dữ liệu) và business write-path của dữ liệu đó.
- Module khác được tham chiếu bằng:
  - quan hệ document/ID
  - DTO mapped qua route/service (lớp xử lý nghiệp vụ)
  - event/job payload
- Search và notification là downstream module.
- Moderation là cross-cutting module nhưng không cướp ownership của entity bị report.
- **Phase 2+**: Business event quan trọng phải đi qua `outbox_events` trước khi được dispatcher phát sang execution queue hoặc downstream handler — chỉ áp dụng khi `outbox.enabled` feature flag đã bật. **Phase 1**: dùng sync hoặc fire-and-forget có log cho các event tương đương (xem `DECISIONS.md` section 7).
- Mọi boundary giữa module phải có schema runtime rõ cho request, event payload, webhook payload và env contract. Khi outbox/queue đã bật, queue payload cũng phải validate.

## Theo module

### Identity

- **Owns**:
  - `users`
  - auth/session lifecycle qua NestJS auth
- **Referenced by**:
  - content
  - community
  - engagement
  - moderation
  - notification
- **Direct calls**:
  - web auth routes gọi API auth endpoints
- **async (bất đồng bộ) side effects**:
  - reset password email
  - moderation decision notification đến user

### Content

- **Owns**:
  - editorial collections
  - taxonomy
  - scripture library
  - `chantItems`
  - `chantPlans`
  - media linkage
  - content search source fields
- **References**:
  - identity cho author/admin biên soạn refs
  - calendar cho `relatedEvent`
- **Emits async (bất đồng bộ) work**:
  - outbox event cho search reindex
  - outbox event cho webhook/revalidation
  - outbox event cho notification khi có feature cần announce

### Community

- **Owns**:
  - `postComments`
  - `communityPosts`
  - `communityComments`
  - `guestbookEntries`
- **References**:
  - identity cho author snapshot / author user
  - content cho `postComments.post`
- **Emits async (bất đồng bộ) work**:
  - outbox event cho moderation alert
  - outbox event cho internal notification cho admin/super-admin

### Engagement

- **Owns**:
  - `sutraBookmarks`
  - `sutraReadingProgress`
  - `chantPreferences`
  - `practiceLogs`
- **References**:
  - identity cho `user`
  - content cho `sutras`, `sutraChapters`
  - content practice refs cho `chantItems`, `chantPlans`
- **Emits async (bất đồng bộ) work**:
  - hiện tại tối thiểu; không đẩy search

### Moderation

- **Owns**:
  - `moderationReports`
- **References**:
  - community entities
  - `postComments`
  - identity cho reporter/admin actor
- **Direct writes to other modules**:
  - sync summary fields lên entity đích
- **Emits async (bất đồng bộ) work**:
  - notify admin/super-admin
  - notify affected user sau decision

### Search

- **Owns**:
  - search query contract (hợp đồng dữ liệu/nghiệp vụ)
  - indexing pipeline
  - runtime status contract (hợp đồng dữ liệu/nghiệp vụ)
- **References**:
  - content source documents
  - queue (hàng đợi xử lý)/job state
- **Direct calls**:
  - public search route
  - status route
- **async (bất đồng bộ) work**:
  - dispatcher phát search-sync job từ outbox
  - worker (tiến trình xử lý nền) upsert/delete index documents
  - optional semantic retrieval sync khi feature `pgvector` đã được chốt

### Calendar

- **Owns**:
  - `events`
  - `lunarEvents`
  - `lunarEventOverrides`
- **References**:
  - content cho related posts
  - engagement/practice refs cho override targets
- **Emits async (bất đồng bộ) work**:
  - notification producer có thể đọc event publish/update nhưng không owned tại đây

### Notification

- **Owns**:
  - `pushSubscriptions`
  - `pushJobs`
- **References**:
  - identity cho target users
  - content/community/moderation/calendar cho message context
- **async (bất đồng bộ) only**:
  - push dispatch
  - email notification job

### Contact

- **Owns**:
  - `contactInfo` (singleton)
  - `volunteers`
- **References**:
  - identity cho admin actor refs (audit)
- **Direct calls**:
  - public contact/volunteer routes
  - admin CRUD routes
- **async (bất đồng bộ) side effects**:
  - **Phase 1**: không có
  - **Phase 2+**: optional email notification cho admin khi có submission mới

## Interaction details

| From         | To           | Ownership model                                            | trigger (điểm kích hoạt)                   | Mode                                                      | Side effects                                                            |
| ------------ | ------------ | ---------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Web auth UI  | Identity     | Identity owns auth/session                                 | register/login/logout/reset                | direct call                                               | cookie/session update                                                   |
| Content      | Search       | Content owns source fields, Search owns index flow         | publish/update post                        | outbox event → async (bất đồng bộ) job                    | upsert/delete Meilisearch document                                      |
| Content      | Calendar     | Calendar owns event record, Content chỉ tham chiếu         | admin chọn `relatedEvent`                  | direct reference                                          | không có write ngược mặc định                                           |
| Content      | Notification | Notification không sở hữu content                          | publish hoặc manual internal alert         | outbox event → async (bất đồng bộ) job                    | push/email announcement nếu feature bật                                 |
| Community    | Moderation   | Moderation owns report record                              | submit report                              | direct create + outbox event                              | tạo `moderationReports`, sync summary, alert admin                      |
| Community    | Notification | Notification không sở hữu community data                   | submit post/comment/guestbook              | outbox event → async (bất đồng bộ) job                    | tạo push/email alert cho admin/super-admin                              |
| Community    | Identity     | Identity owns user                                         | submit/comment/report                      | direct reference                                          | snapshot author name trên entity để giảm phụ thuộc read path            |
| Engagement   | Content      | Content owns scripture/library và practice support content | bookmark/progress/log                      | direct reference                                          | không write ngược vào content canonical data                            |
| Content      | Engagement   | Engagement owns self-state                                 | preference save / practice complete        | direct call qua API contract (hợp đồng dữ liệu/nghiệp vụ) | chỉ ghi user-state, không sửa script gốc                                |
| Engagement   | Identity     | Identity owns user                                         | read/write self state                      | direct reference                                          | self-owned records theo user                                            |
| Moderation   | Community    | Community owns entity, Moderation owns report              | admin decision                             | direct write-back                                         | update `moderationStatus`, `isHidden`, `approvalStatus`, summary fields |
| Moderation   | Notification | Notification owns delivery control plane                   | decision / new report                      | outbox event → async (bất đồng bộ) job                    | notify admin/super-admin hoặc affected user                             |
| Search       | Content      | Content owns canonical documents                           | public query fallback (đường dự phòng)     | direct read                                               | payload fallback (đường dự phòng) khi Meilisearch unavailable           |
| Calendar     | Content      | Content owns chant guide/script/downloads                  | event override cần map bài niệm hoặc guide | direct reference                                          | calendar không copy ritual script vào event                             |
| Calendar     | Notification | Notification owns delivery                                 | event-related notice                       | outbox event → async (bất đồng bộ) job                    | push/email nếu có producer gọi                                          |
| Notification | Identity     | Identity owns user identity                                | target resolution                          | direct read                                               | lấy email / user id / role để dispatch delivery                         |

## Interaction details bổ sung cho lớp tu tập thực tế

| From         | To           | Ownership model                                | Trigger                                       | Mode                                   | Side effects                                    |
| ------------ | ------------ | ---------------------------------------------- | --------------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| Engagement   | Content      | Content owns bài đọc chuẩn                     | mở `Ngôi Nhà Nhỏ`, bài tập hằng ngày          | direct read                            | không write ngược                               |
| Engagement   | Notification | Notification owns delivery                     | reminder đọc hoặc đếm bài                     | outbox event → async (bất đồng bộ) job | push nhắc theo giờ                              |
| Vows & Merit | Calendar     | Calendar owns ngày tu học                      | gợi ý ngày phát nguyện hoặc phóng sanh        | direct read                            | build reminder candidates                       |
| Vows & Merit | Notification | Notification owns delivery                     | đến hạn vow, ngày phóng sanh                  | outbox event → async (bất đồng bộ) job | push/email reminder                             |
| Vows & Merit | Content      | Content owns lời khấn, ritual guide và variants | mở checklist phóng sanh hoặc companion guide | direct read                            | journal chỉ giữ refs, không write ngược         |
| Wisdom & QA  | Content      | Content owns beginner guides và hub điều hướng | đọc Bạch thoại hoặc khai thị                  | direct read                            | offline bundle (gói tải ngoại tuyến) build      |
| Wisdom & QA  | Search       | Search owns retrieval engine                   | tra cứu vấn đáp                               | direct read                            | query index                                     |
| Community    | Vows & Merit | Vows & Merit owns journal                      | user muốn chia sẻ phóng sanh hoặc linh nghiệm | explicit export/share                  | tạo post mới, không lộ record riêng tư mặc định |
| Calendar     | Engagement   | Engagement owns self-state                     | build lịch tu học cá nhân                     | direct read                            | không write ngược                               |
| Calendar     | Content      | Content owns daily practice guides/presets     | compose advisory cho ngày đặc biệt            | direct read                            | chỉ mang refs/preset, không copy ritual truth   |

## Direct call vs event/job

### Nên dùng direct call/reference khi

- cần đọc canonical data ngay
- chỉ cần tham chiếu relation
- chưa có side effect tốn thời gian

### Nên dùng async (bất đồng bộ) job khi

- gửi push/email
- sync search index
- fan-out tới nhiều recipient
- side effect có thể retry
- cần transactional handoff khỏi canonical write

Ghi chú:

- **Phase 2+**: "async job" luôn nên được hiểu là `canonical write -> outbox_events -> dispatcher -> execution queue -> worker`, không phải request path tự phát queue theo kiểu best effort.
- **Phase 1**: khi outbox/queue chưa bật, các side effect tương đương dùng sync inline hoặc fire-and-forget có log — không được im lặng bỏ qua (xem `DECISIONS.md` section 7, `infra.md` section "Async Reliability").

## Delete / cleanup contracts

### Quy tắc chung

- module owner nào xóa canonical record (bản ghi chuẩn gốc) phải chịu trách nhiệm phát cleanup signal cho downstream modules
- downstream module không tự giả vờ target còn tồn tại khi relation đã mất
- nếu cleanup chưa được tự động hóa an toàn, flow thường ngày chỉ được `soft delete`

### Ví dụ chuẩn

- `Content delete post`
  - `Community`: xóa hoặc tombstone `postComments`
  - `Moderation`: đóng/tombstone report liên quan
  - `Search`: remove index document
  - `Notification`: skip dangling jobs

### Điều không được làm

- để `postComments` mồ côi sau khi `post` đã bị xóa
- để `moderationReports` tiếp tục trỏ về target không còn tồn tại mà không có trạng thái `target_removed`

## Những tương tác không nên làm

- Search tự ghi ngược vào content canonical data.
- Notification tự suy ra canonical moderation status.
- Community tự lưu report lifecycle đầy đủ ngoài `moderationReports`.
- Engagement ghi bookmark/progress trực tiếp vào content collection.
- Community tự sở hữu `phát nguyện` hoặc `phóng sanh` journal canonical.
- Redis hoặc Meilisearch được dùng làm nguồn dữ liệu gốc cho UI cần correctness cao.

## Bảng tổng kết module

| Module       | Owns data                                                                                | Chỉ tham chiếu                                                 | Sync hay async (bất đồng bộ)                | Side effects chính                    |
| ------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------- | ------------------------------------- |
| Identity     | `users`, auth/session                                                                    | media avatar, audit refs                                       | chủ yếu sync                                | reset password email, auth cookies    |
| Content      | editorial docs, taxonomy, scripture, chant guides/plans, media links                     | users, events                                                  | sync write + async (bất đồng bộ) downstream | search sync, revalidation             |
| Community    | comments, community posts/comments, guestbook                                            | users, posts                                                   | sync write + async (bất đồng bộ) downstream | moderation alert, admin notification  |
| Engagement   | bookmarks, reading progress, chant prefs, practice logs, practice sheets, `Ngôi Nhà Nhỏ` | users, sutras, chapters, chant refs từ content                 | sync                                        | rất ít side effects hiện tại          |
| Moderation   | `moderationReports`                                                                      | users, moderated entities                                      | sync write + async (bất đồng bộ) notify     | summary sync, admin/user notification |
| Search       | search contract (hợp đồng dữ liệu/nghiệp vụ), index flow                                 | content source fields, queue state (trạng thái hàng đợi xử lý) | async-first (ưu tiên xử lý bất đồng bộ)     | index upsert/delete, status reporting |
| Calendar     | events, lunar events, overrides                                                          | posts, chant refs và daily practice refs từ content            | sync                                        | event data, advisory refs cho module khác dùng |
| Notification | push subscriptions, push jobs                                                            | users, content/community/moderation/calendar context           | async (bất đồng bộ)                         | push dispatch, email dispatch         |
