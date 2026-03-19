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

- Chỉ module owner mới được định nghĩa canonical schema và business write-path của dữ liệu đó.
- Module khác được tham chiếu bằng:
  - quan hệ document/ID
  - DTO mapped qua route/service
  - event/job payload
- Search và notification là downstream module.
- Moderation là cross-cutting module nhưng không cướp ownership của entity bị report.

## Theo module

### Identity
- **Owns**:
  - `users`
  - auth/session lifecycle qua Payload auth
- **Referenced by**:
  - content
  - community
  - engagement
  - moderation
  - notification
- **Direct calls**:
  - web auth routes gọi CMS auth endpoints
- **Async side effects**:
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
- **Emits async work**:
  - search reindex
  - webhook/revalidation
  - notification khi có feature cần announce

### Community
- **Owns**:
  - `postComments`
  - `communityPosts`
  - `communityComments`
  - `guestbookEntries`
- **References**:
  - identity cho author snapshot / author user
  - content cho `postComments.post`
- **Emits async work**:
  - moderation alert
  - internal notification cho admin/super-admin

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
- **Emits async work**:
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
- **Emits async work**:
  - notify admin/super-admin
  - notify affected user sau decision

### Search
- **Owns**:
  - search query contract
  - indexing pipeline
  - runtime status contract
- **References**:
  - content source documents
  - queue/job state
- **Direct calls**:
  - public search route
  - status route
- **Async work**:
  - queue search sync
  - worker upsert/delete index documents

### Calendar
- **Owns**:
  - `events`
  - `lunarEvents`
  - `lunarEventOverrides`
- **References**:
  - content cho related posts
  - engagement/practice refs cho override targets
- **Emits async work**:
  - notification producer có thể đọc event publish/update nhưng không owned tại đây

### Notification
- **Owns**:
  - `pushSubscriptions`
  - `pushJobs`
- **References**:
  - identity cho target users
  - content/community/moderation/calendar cho message context
- **Async only**:
  - push dispatch
  - email notification job

## Interaction details

| From | To | Ownership model | Trigger | Mode | Side effects |
|---|---|---|---|---|---|
| Web auth UI | Identity | Identity owns auth/session | register/login/logout/reset | direct call | cookie/session update |
| Content | Search | Content owns source fields, Search owns index flow | publish/update post | async job | upsert/delete Meilisearch document |
| Content | Calendar | Calendar owns event record, Content chỉ tham chiếu | admin chọn `relatedEvent` | direct reference | không có write ngược mặc định |
| Content | Notification | Notification không sở hữu content | publish hoặc manual internal alert | async job | push/email announcement nếu feature bật |
| Community | Moderation | Moderation owns report record | submit report | direct create + async notify | tạo `moderationReports`, sync summary, alert admin |
| Community | Notification | Notification không sở hữu community data | submit post/comment/guestbook | async job | tạo push/email alert cho admin/super-admin |
| Community | Identity | Identity owns user | submit/comment/report | direct reference | snapshot author name trên entity để giảm phụ thuộc read path |
| Engagement | Content | Content owns scripture/library và practice support content | bookmark/progress/log | direct reference | không write ngược vào content canonical data |
| Content | Engagement | Engagement owns self-state | preference save / practice complete | direct call qua API contract | chỉ ghi user-state, không sửa script gốc |
| Engagement | Identity | Identity owns user | read/write self state | direct reference | self-owned records theo user |
| Moderation | Community | Community owns entity, Moderation owns report | admin decision | direct write-back | update `moderationStatus`, `isHidden`, `approvalStatus`, summary fields |
| Moderation | Notification | Notification owns delivery control plane | decision / new report | async job | notify admin/super-admin hoặc affected user |
| Search | Content | Content owns canonical documents | public query fallback | direct read | payload fallback khi Meilisearch unavailable |
| Calendar | Content | Content owns chant guide/script/downloads | event override cần map bài niệm hoặc guide | direct reference | calendar không copy ritual script vào event |
| Calendar | Notification | Notification owns delivery | event-related notice | async job | push/email nếu có producer gọi |
| Notification | Identity | Identity owns user identity | target resolution | direct read | lấy email / user id / role để enqueue delivery |

## Direct call vs event/job

### Nên dùng direct call/reference khi
- cần đọc canonical data ngay
- chỉ cần tham chiếu relation
- chưa có side effect tốn thời gian

### Nên dùng async job khi
- gửi push/email
- sync search index
- fan-out tới nhiều recipient
- side effect có thể retry

## Những tương tác không nên làm

- Search tự ghi ngược vào content canonical data.
- Notification tự suy ra canonical moderation status.
- Community tự lưu report lifecycle đầy đủ ngoài `moderationReports`.
- Engagement ghi bookmark/progress trực tiếp vào content collection.
- Redis hoặc Meilisearch được dùng làm nguồn dữ liệu gốc cho UI cần correctness cao.

## Bảng tổng kết module

| Module | Owns data | Chỉ tham chiếu | Sync hay async | Side effects chính |
|---|---|---|---|---|
| Identity | `users`, auth/session | media avatar, audit refs | chủ yếu sync | reset password email, auth cookies |
| Content | editorial docs, taxonomy, scripture, chant guides/plans, media links | users, events | sync write + async downstream | search sync, revalidation |
| Community | comments, community posts/comments, guestbook | users, posts | sync write + async downstream | moderation alert, admin notification |
| Engagement | bookmarks, reading progress, chant prefs, practice logs, practice sheets, `Ngôi Nhà Nhỏ` | users, sutras, chapters, chant refs từ content | sync | rất ít side effects hiện tại |
| Moderation | `moderationReports` | users, moderated entities | sync write + async notify | summary sync, admin/user notification |
| Search | search contract, index flow | content source fields, queue state | async-first | index upsert/delete, status reporting |
| Calendar | events, lunar events, overrides | posts, chant refs từ content | sync | event data cho module khác dùng |
| Notification | push subscriptions, push jobs | users, content/community/moderation/calendar context | async | push dispatch, email dispatch |
