# Architecture: Core Principles & Tech Stack Decisions (Nguyên tắc Kiến trúc & Quyết định Tech Stack)

## Why This Stack? (Tại sao chọn Tech Stack này?)

### Frontend: Next.js 16 App Router
- **SSR/SSG/ISR**: Tối ưu SEO cho nội dung Phật giáo với khối lượng Content lớn.
- **Server Actions**: Xử lý các Mutations (cập nhật dữ liệu) mà không cần xây dựng API riêng biệt.
- **Edge-ready**: Sẵn sàng triển khai trên hạ tầng Vercel Edge.
- **TypeScript First**: Đảm bảo Type Safety tuyệt đối.
- **Tailwind + shadcn/ui**: Xây dựng Design System nhất quán.

### Backend: Payload CMS v3
- **Headless but Admin-first**: Cung cấp Admin UI tuyệt vời ngay từ đầu.
- **Collections-based**: Hoàn hảo cho các Structured Content Domains (Posts, Sutras, Comments, v.v.).
- **Access Control Built-in**: Quản lý Row-level security và Field-level permissions.
- **Hooks + Middlewares**: Tùy biến Business Logic ngay tại Data Layer.
- **Self-hosted**: Thân thiện với Docker, toàn quyền kiểm soát Data.
- **PostgreSQL Native**: Trưởng thành, tin cậy cho việc xử lý Multi-user writes.

### Database: PostgreSQL 17
- **Source of Truth**: Mọi App Data đều cư ngụ tại đây.
- **JSON Support**: Sử dụng JSONB cho các dữ liệu Semi-structured (metadata, configs).
- **Full-text Search**: Có thể đóng vai trò dự phòng cho bộ máy tìm kiếm.
- **Transactions**: Rất quan trọng cho Multi-step workflows (Ví dụ: Publish → Notify → Reindex).
- **Performance**: Có sẵn các tính năng Vacuum, Partitioning, và Index Tuning.

### Search: Meilisearch (Engine chính, không dùng Postgres full-text)
- **Fast Faceted Search**: Lọc nhanh theo Category, Tag, Date.
- **Typo Tolerance**: Xử lý lỗi chính tả trong các thuật ngữ chuyên môn.
- **Sync-friendly**: Dễ dàng Reindex toàn bộ dữ liệu từ đầu.
- **JSON Documents**: Lưu trữ toàn bộ dữ liệu Post/Comment trong Index.
- **Free/Open-source**: Tránh bị Vendor Lock-in.
- **Lightweight**: Khởi động nhanh, chỉ chiếm ~50MB RAM, dễ dàng Scaling.

### Cache: Redis (Dùng cache tập trung, không dùng In-memory cache)
- **Session Store**: Lưu trữ các Auth.js Sessions (không lưu trong RAM của App).
- **Queue**: Sử dụng cho hàng chờ Bull/BullMQ trong các Background Jobs.
- **Real Cache**: Dữ liệu được chia sẻ giữa nhiều Server Instances.
- **Expiry TTL**: Tự động dọn dẹp (Cleanup), tránh rò rỉ bộ nhớ (Memory Leak).
- **Atomic Operations**: Hỗ trợ bộ đếm (Increment/Decrement) an toàn.

### Background Jobs: Redis Queue + Worker
- **Bull/BullMQ**: Thư viện xử lý hàng chờ chín muồi, ổn định.
- **Separate Process**: `apps/cms` sẽ đóng vai trò Worker Service để xử lý tác vụ ngầm.
- **Cron Support**: Lập lịch Reindex, Cleanup, hoặc tổng hợp Digest định kỳ.
- **Retry Logic**: Hỗ trợ Exponential Backoff khi gặp lỗi.
- **Monitoring**: Theo dõi Job Status và Failure Tracking.

### Ingress: Caddy (Thay thế cho Nginx)
- **Auto HTTPS**: Tự động cấp và gia hạn SSL Certs.
- **Simple Config**: Cấu pháp đơn giản, dễ đọc.
- **Reverse Proxy**: Điều hướng `/api` tới CMS và `/` tới Web App.
- **Rate Limiting**: Đã được tích hợp sẵn để bảo vệ hệ thống.
- **Metrics**: Tương thích tốt với Prometheus.

### Logging: Pino (Cực nhanh, thay thế cho Winston)
- **Structured JSON**: Dễ dàng phân tích, Grep và Index.
- **Performance**: Độ trễ (Overhead) thấp nhất hiện nay.
- **Child Loggers**: Theo vết Requests xuyên suốt toàn bộ hệ thống.
- **Sentry Integration**: Đẩy các Critical Errors trực tiếp tới Sentry.
- **Sampling**: Log 100% khi Dev, 10% khi Deploy Production.

---

## Core Architectural Principles (Các Nguyên tắc Kiến trúc Cốt lõi)

### 1. Single Source of Truth (Postgres)
- Mọi luồng ghi dữ liệu (Write-path) đều phải đi qua Postgres.
- Redis / Meilisearch chỉ là các **Computed Caches** của Postgres, không phải nơi lưu trữ chính.
- Mỗi Table đều có Owner rõ ràng.
- Mọi thay đổi đều được ghi vết trong `audit_logs`.

### 2. Async-First cho Non-Critical Paths
- **Sync (Đồng bộ)**: Authentication, Payment, Moderation Decisions.
- **Async (Bất đồng bộ)**: Email, Push, Search Reindex, Notification, Metrics.
- Sử dụng hàng chờ (Queue) để ngăn chặn Backpressure; App sẽ phản hồi 200 ngay lập tức.
- Retry Logic sẽ xử lý các Transient Failures (Lỗi tạm thời).

### 3. Cache Only Published Content
- **Drafts (Bản nháp)**: Không bao giờ cache, luôn lấy từ DB để đảm bảo tính thời gian thực và bảo mật.
- **Published**: Được lưu trong Redis (thông thường TTL là 1 giờ).
- **Search**: Chỉ các nội dung đã xuất bản mới có trong Meilisearch Index.
- Invalidate Cache khi bài viết được Publish, không thực hiện ở mọi lượt Edit.

### 4. Visibility as Data, Not Access Logic
- Mọi Content đều có cột `visibility: public | members_only | private`.
- Việc lọc dữ liệu thực hiện ở **Query Layer** (Payload API), không phải ở Middleware.
- Không có các bảng dữ liệu ẩn hay các quy tắc truy cập đặc thù.
- Admin luôn được phép Bypass qua quy tắc `user.role = 'admin'`.

### 5. Moderation as First-Class Citizen
- Mọi nội dung do User tạo ra đều phải qua trạng thái Review.
- Workflow: Draft → Approve → Publish (hoặc Reject).
- Sử dụng Soft-delete (đánh dấu đã xóa nhưng vẫn giữ dữ liệu) để Audit.
- Mọi Reports và Escalation (leo thang báo cáo) đều được theo dõi bằng số liệu Metrics.

### 6. Observability Built-In (Quan sát hệ thống)
- Sử dụng **Pino Structured Logs** ở mọi thành phần.
- **Prometheus Metrics** được phát ra từ chính bên trong ứng dụng.
- Xây dựng **Grafana Dashboards** cho đội ngũ vận hành (Ops Team).
- Tích hợp **Alertmanager** gửi cảnh báo tới Telegram.

### 7. Type Safety End-to-End
- Sử dụng **TypeScript** trong toàn bộ các ứng dụng Web, CMS, API, và Worker.
- Sử dụng **Zod Schemas** cho validation cả hai đầu Input và Output.
- Các Types trong Payload được tự động Generate từ Collections Config.
- Bật **Strict Mode** trong file `tsconfig.json` ở mọi nơi.

### 8. Domain-Driven Design với ranh giới rõ ràng
- **Content Module**: Posts, Sutras, Media, Taxonomy.
- **Community Module**: Threads, Comments, Follows.
- **Engagement Module**: Bookmarks, Progress, History.
- **Moderation Module**: Reports, Violations, Escalations.
- Các Modules giao tiếp với nhau qua **Events/Hooks**, không được phép Shared Tables.

### 9. Minimal External Dependencies (Tối giản sự phụ thuộc bên ngoài)
- Không dùng dịch vụ bên thứ ba khi có thể tự làm: Dùng Payload + Auth.js thay cho Firebase/Auth0.
- Không dùng Vercel AI: Gọi trực tiếp OpenAI API.
- Tự vận hành (Self-hosted) = Toàn quyền kiểm soát tài sản kỹ thuật.

---

## Priority Modules ( Build Order - Thứ tự xây dựng)

### Phase 1: Core (Tuần 1—2)
1. **Content** (Dharma Library)
   - Posts, Sutras, Media
   - Publish Workflow, Revision History
   - Search Index

2. **Identity** (Auth)
   - Register, Login, Session
   - Email Verification
   - Role-based Access (RBAC)

### Phase 2: Engagement (Tuần 3—4)
3. **Community** (Forums & Comments)
   - Threads, Replies, Comments
   - Moderation Queue
   - User Follows

4. **Engagement** (Reading Progress)
   - Bookmarks, Progress Tracking
   - Streaks, Stats
   - Leaderboard Cache

### Phase 3: Polish (Tuần 5—6)
5. **Calendar & Events**
6. **Notifications** (Email, Push)
7. **Search & Discovery** (Featured, Trending, Recommendation)

---

## Deployment Topology (Mô hình Triển khai)

### Development (Local Docker Compose)
```
apps/web      (npm run dev)
apps/cms      (npm run dev)
Worker        (npm run worker)
PostgreSQL    (docker)
Redis         (docker)
Meilisearch   (docker)
Caddy         (docker)
```

### Production (Cloud or VPS)
Triển khai bằng Docker Compose trên VPS đơn lẻ (cho ≤1000 MAU) hoặc mở rộng sang Container Registry + Managed DBs.

---

## Error Handling Strategy (Chiến lược xử lý lỗi)

| Tier | Responsibility |
|------|-----------------|
| **Caddy** | Trả về 4xx/5xx status codes, xử lý Timeout |
| **Payload/App** | Validate đầu vào (Zod), log lỗi chi tiết |
| **Worker** | Retry khi gặp Transient Error, sử dụng Dead-letter Queue |
| **Logging** | Pino → Structured JSON, dễ dàng tìm kiếm |
| **Monitoring** | Prometheus → Grafana Alerting |
