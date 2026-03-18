# PMTL_VN Domain Map

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# PMTL_VN

## Current Scope

### 01. Identity
- **Owner**: `users`
- **Authority**: Payload auth
- **Responsibilities**:
  - đăng ký, đăng nhập, đăng xuất
  - reset mật khẩu
  - role + block state
  - profile cơ bản
- **Current role set**:
  - `super-admin`
  - `admin`
  - `editor`
  - `moderator`
  - `member`

### 02. Content
- **Editorial collections**:
  - `posts`
  - `hubPages`
  - `beginnerGuides`
  - `downloads`
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

### 04. Engagement
- **Self-owned user state**:
  - `sutraBookmarks`
  - `sutraReadingProgress`
  - `chantPreferences`
  - `practiceLogs`
- **Practice references used by this area**:
  - `chantItems`
  - `chantPlans`
- **Responsibilities**:
  - bookmark
  - reading progress
  - practice configuration
  - personal practice history

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
  - moderator decision
  - sync moderation summary back to target entity

### 06. Search
- **Source fields live in owner collections**
- **Index**: Meilisearch
- **Queue**: Redis + worker
- **Current public search contract**:
  - posts search
  - search status
  - reindex trigger
- **Responsibilities**:
  - queue search sync
  - build search document
  - serve search query with fallback

### 07. Calendar
- **Owner collections**:
  - `events`
  - `lunarEvents`
  - `lunarEventOverrides`
- **Responsibilities**:
  - editorial event publishing
  - lunar recurrence base
  - per-event practice override mapping

### 08. Notification
- **Control plane**:
  - `pushSubscriptions`
  - `pushJobs`
- **Async delivery paths**:
  - push dispatch
  - email notification jobs
- **Responsibilities**:
  - store browser subscription state
  - store notification preferences used for push delivery
  - enqueue internal jobs
  - notify moderators or affected users asynchronously

## Cross-Cutting Runtime

### Infrastructure
- PostgreSQL: canonical app data
- Redis: cache + queue + coordination
- Worker: background processing
- Meilisearch: search index
- Caddy: reverse proxy / HTTPS

### Optional Monitoring
- PgBouncer
- Prometheus
- Grafana
- Alertmanager
- Exporters
- Blackbox

## Current Scope Boundaries

### Content does not own
- bookmarks
- reading progress
- practice logs
- moderation reports
- push jobs

### Community does not own
- moderation decisions
- user identity authority
- search index documents

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
- public profile pages hoàn chỉnh
- social graph sâu hơn
- mention/handle routing

### Content
- gated membership content với audience visibility đầy đủ
- richer version comparison UI

### Community
- follows / subscriptions theo author hoặc thread
- richer reaction model ngoài `likes`

### Engagement
- streaks
- stats dashboard
- article bookmarks nếu repo quyết định thêm collection riêng

### Moderation
- automated policy packs
- escalation workflow nhiều cấp

### Search
- recommendations
- search suggestions
- discovery ranking nâng cao

### Notification
- digest scheduling
- in-app inbox nếu có owner data model riêng

### Calendar
- event registration
- personalized reminder rules ngoài push subscription hiện tại

Future candidate chỉ được nâng lên current scope khi có:
- owner collection hoặc owner service rõ ràng
- API contract rõ
- runtime path rõ
