# PMTL_VN Domain Map

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# PMTL_VN

> Ghi chú cho sinh viên:
> File này giống như bản đồ thành phố.
> Nó giúp bạn biết module nào đang tồn tại thật trong repo và module nào đang là current scope cần triển khai.

## Current Scope

### 01. Identity
- **Owner**: `users`
- **Authority**: Payload auth
- **Responsibilities**:
  - đăng ký, đăng nhập, đăng xuất
  - reset mật khẩu
  - Google login trong cùng auth authority
  - role + block state
  - profile cơ bản
- **Current role set**:
  - `super-admin`
  - `admin` (`Phụng sự viên`)
  - `member`

### 02. Content
- **Editorial collections**:
  - `posts`
  - `hubPages`
  - `beginnerGuides`
  - `downloads`
  - `chantItems`
  - `chantPlans`
  - `media`
  - `categories`
  - `tags`
- **Scripture library**:
  - `sutras`
  - `sutraVolumes`
  - `sutraChapters`
  - `sutraGlossary`
- **Responsibilities**:
  - editorial authoring
  - publish workflow
  - taxonomy
  - media linking
  - content search fields
  - giới thiệu pháp môn và sơ học
  - official notices, hub pages, download hubs
  - practice support reference content cho niệm kinh / nghi thức / Ngôi Nhà Nhỏ / bài khai thị

### 03. Community
- **Discussion surfaces**:
  - `postComments`
  - `communityPosts`
  - `communityComments`
  - `guestbookEntries`
- **Responsibilities**:
  - public discussion
  - community submissions
  - guestbook messages
  - report initiation toward moderation

### 04. Engagement / Practice Support
- **Self-owned user state**:
  - `sutraBookmarks`
  - `sutraReadingProgress`
  - `chantPreferences`
  - `practiceLogs`
  - `practiceSheets`
  - `ngoiNhaNhoSheets`
- **Responsibilities**:
  - bookmark
  - reading progress
  - practice configuration
  - personal practice history
  - daily practice sheets
  - Ngôi Nhà Nhỏ inventory và tiến độ theo từng tờ

### 05. Moderation
- **Owner**: `moderationReports`
- **Summary fields on target entities**:
  - `reportCount`
  - `lastReportReason`
  - `isHidden`
  - `approvalStatus`
  - `moderationStatus`
- **Responsibilities**:
  - accept report
  - admin/super-admin decision
  - sync moderation summary back to target entity

### 06. Search
- **Source fields live in owner collections**
- **Index**: Meilisearch
- **Queue**: Redis + worker
- **Current public search contract**:
  - posts search
  - wisdom search
  - search status
  - reindex trigger
- **Responsibilities**:
  - queue search sync
  - build search document
  - serve unified `Kho Trí Huệ` query with fallback

### 07. Calendar
- **Owner collections / read models**:
  - `events`
  - `lunarEvents`
  - `lunarEventOverrides`
  - `personalPracticeCalendarReadModel`
- **Responsibilities**:
  - editorial event publishing
  - lunar recurrence base
  - per-event practice override mapping
  - compose personal practice calendar read model

### 08. Notification
- **Control plane**:
  - `pushSubscriptions`
  - `pushJobs`
  - reminder candidates/materialized jobs
- **Responsibilities**:
  - store browser subscription state
  - store notification preferences used for push delivery
  - enqueue internal jobs
  - notify admins or affected users asynchronously

### 09. Vows & Merit
- **Self-owned records**:
  - `vows`
  - `vowProgressEntries`
  - `lifeReleaseJournal`
- **Responsibilities**:
  - phát nguyện
  - theo dõi tiến độ nguyện
  - sổ tay phóng sanh

### 10. Wisdom & QA
- **Curated retrieval records**:
  - `wisdomEntries`
  - `qaEntries`
  - `offlineBundles`
- **Responsibilities**:
  - Bạch thoại Phật pháp
  - khai thị / Phật ngôn Phật ngữ
  - Huyền học vấn đáp
  - Phật học vấn đáp
  - audio/video hỗ trợ đọc học
  - offline bundle cho người lớn tuổi

## Cross-Cutting Runtime

### Infrastructure
- PostgreSQL: canonical app data
- Redis: cache + queue + coordination
- Worker: background processing
- Meilisearch: search index
- Caddy: reverse proxy / HTTPS

## Current Scope Boundaries

### Content does not own
- bookmarks
- reading progress
- practice logs
- practice sheets
- vow records
- moderation reports
- push jobs

### Engagement does not own
- canonical sutra content
- canonical chant/reference content
- moderation decisions

### Search does not own
- canonical content
- user state
- moderation state

### Notification does not own
- canonical event/content/community data
- moderation source-of-truth

## Future Candidates

Chỉ là ứng viên tương lai, chưa phải current scope.

### Identity
- richer public profile pages
- account linking policy nhiều provider hơn Google

### Community
- follows / subscriptions theo author hoặc thread
- richer reaction model ngoài `likes`

### Engagement
- streaks
- stats dashboard

### Notification
- in-app inbox nếu có owner data model riêng

Future candidate chỉ được nâng lên current scope khi có:
- owner collection hoặc owner service rõ ràng
- API contract rõ
- runtime path rõ
