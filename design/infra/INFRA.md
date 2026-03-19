# PMTL Infrastructure: Why & What (Lý do & Mục đích)

Tài liệu này giải thích các thành phần hạ tầng (Infrastructure) của hệ thống PMTL.
Đây là bản chuẩn để đọc nhanh.

Nếu cần đi sâu exporters, metrics, alerting và topology vận hành chi tiết hơn, đọc thêm:
- `design/infra/INFRA_DEEP_DIVE.md`

---

## 🎯 4 Core Groups (4 Nhóm Chính)

### 1️⃣ **Business Layer** (Lớp ứng dụng chính)

| Component | Chức năng | Lợi ích mang lại |
|-----------|----------|---------|
| **apps/web** (Next.js) | Frontend / UI | Phục vụ người dùng cuối, đảm bảo tính Tương tác (Interactive) |
| **apps/cms** (Payload) | Backend / API | Cung cấp giao diện Admin cho Editor và Serve dữ liệu qua API |
| **worker (tiến trình xử lý nền)** (Bull queue (hàng đợi xử lý)) | Background Jobs | Xử lý các tác vụ ngầm (Email/Reindex) không làm block Main Thread |
| **Caddy** (Reverse Proxy) | Ingress / SSL | Định tuyến (Routing), quản lý HTTPS/SSL tự động |

**Request Flow**: User → Caddy → web/cms → database → return response

---

### 2️⃣ **Data Layer** (Lớp dữ liệu & Lưu trữ)

| Technology | Chức năng | Tại sao cần? | Lợi ích |
|---|---|---|---|
| **Postgres** (Database) | source of truth (nguồn dữ liệu gốc đáng tin cậy nhất) | Lưu trữ TẤT CẢ dữ liệu vĩnh viễn (Posts, Users, Comments) | Reliable, ACID compliance, Powerful Querying |
| **Redis** (Cache) | Distributed Cache | Lưu trữ tạm thời (Sessions, Recent posts) để tăng tốc độ | API Response nhanh gấp 10 lần |
| **Redis** (queue (hàng đợi xử lý)) | Job queue (hàng đợi xử lý) | Quản lý hàng chờ công việc (Email, Reindex) | Xử lý Async (Bất đồng bộ) mượt mà |
| **Meilisearch** (Search) | Search Engine | Đánh chỉ mục Full-text Search chuyên sâu | Tìm kiếm siêu nhanh, hỗ trợ Typo Tolerance |
| **PgBouncer** (Pooler) | Connection Pooling | Quản lý và tái sử dụng Connection tới DB | Giảm tải cho Postgres (từ 500 xuống ~20 connections) |

**Architecture Diagram**:
```
Apps (web/cms/worker (tiến trình xử lý nền))
     ↓
PgBouncer (Connection Pooler)
     ↓
Postgres (Persistent Storage)

Apps cũng truy vấn thêm:
  - Redis (Cache hit/miss check)
  - Meilisearch (Search queries)
```

---

### 3️⃣ **Observability** (Khả năng quan sát & Giám sát)

**Stack**: Prometheus + Grafana + Alertmanager + Exporters

| Tool | Chức năng | Tại sao chọn? | Lợi ích |
|------|----------|--------|---------|
| **Prometheus** | TSDB (Time-series DB) | Lưu trữ Metrics (CPU, RAM, DB Connections, v.v.) | Hỗ trợ Query, Graph, và Alerting mạnh mẽ |
| **Grafana** | Visualization UI | Vẽ biểu đồ từ dữ liệu Prometheus | Admin Dashboard trực quan, dễ theo dõi |
| **Alertmanager** | Alert Routing | Gửi cảnh báo tới Telegram/Slack/Email | Lọc trùng (Dedup) và điều hướng cảnh báo thông minh |
| **Exporters** | Metric Collection | Thu thập dữ liệu từ OS và các Services | Giám sát trạng thái thực (CPU/RAM/Disk, Redis Size) |

**Monitoring Flow**:
```
Services (Expose /metrics endpoint)
     ↓ (Prometheus Scrape mỗi 15 giây)
Prometheus (Lưu trữ Metrics)
     ↓ (Kiểm tra Alert Rules)
Alertmanager (Nếu threshold bị vi phạm)
     ↓
Telegram/Slack (Đội ngũ kỹ thuật nhận Notification)

Grafana (Truy vấn Prometheus để hiển thị Dashboard)
```

**Ví dụ Alert Rule**:
```
IF redis_memory_usage > 1GB trong 5 phút
THEN fire alert "RedisMemoryHigh"
TO Alertmanager → TO Telegram
```

---

### 4️⃣ **External Services** (Các dịch vụ bên thứ ba)

| service (lớp xử lý nghiệp vụ) | Chức năng | Lợi ích |
|---------|----------|---|
| Email (SMTP/SendGrid) | Email Delivery | Gửi Password Reset, Notifications từ worker (tiến trình xử lý nền) |
| Push (Firebase) | Web Push | Gửi thông báo trực tiếp tới trình duyệt người dùng |
| CDN (Cloudflare) | Content Delivery | Phân phối tài nguyên (Images, Audio, PDF) nhanh nhất |
| S3 Storage | Off-site Backup | Lưu trữ các bản Snapshot dự phòng của Postgres |

**Media/File note**:
- Với PDF, audio, video, image public:
  - current local/dev có thể dùng media volume hiện tại
  - production design nên chuẩn bị object storage rõ như `S3` hoặc `MinIO`
  - file nên đi qua allowlist, size/mime validation, và scan/quarantine flow nếu nguồn chưa trusted

---

## 🔀 Real-world Request Flows (Luồng yêu cầu thực tế)

### Case 1: User Loads Homepage
```
User truy cập Domain
  ↓
Caddy lắng nghe port 80/443
  ↓
Route / → apps/web (localhost:3000)
  ↓
Web gọi api/posts để lấy dữ liệu
  ↓
CMS kiểm tra Redis Cache
  ✓ Hit: Trả về dữ liệu ngay (~100ms)
  ✗ Miss: Query Postgres → Ghi vào Redis → Trả về (~300ms)
  ↓
User thấy giao diện hoàn chỉnh
```

**Lợi ích của Caching**: Tăng tốc độ phản hồi gấp 10 lần cho những lượt truy cập sau.

---

### Case 2: User Searches "Phật pháp"
```
User gõ từ khóa vào thanh Search
  ↓
Web gọi URL /api/search?q=Phật%20pháp
  ↓
CMS thực hiện Query tới Meilisearch
  ✓ Result: Trả về trong ~50ms
  ✓ Typo tolerance: Gõ "Phật Phàp" vẫn ra đúng kết quả
  ✓ Faceted Search: Hỗ trợ lọc theo Category/Tag/Date
  ↓
Web hiển thị danh sách kết quả
```

**Lớp Search Engine**: Đảm bảo trải nghiệm tìm kiếm chuyên nghiệp (UX tốt hơn hẳn SQL Search).

---

### Case 3: Editor Publishes New Post
```
Editor nhấn "Publish" trong Admin Panel
  ↓
CMS lưu dữ liệu vào Postgres (Sync)
  ✓ status = published, timestamp = now()
  ↓
CMS đẩy một Job vào Redis queue (hàng đợi xử lý): {type: 'reindex_post', postId: 123}
  ↓
Giao diện Admin trả về 200 OK ngay lập tức

Phía sau (Background), worker (tiến trình xử lý nền):
  ↓
Lấy (Pull) Job từ Redis queue (hàng đợi xử lý)
  ↓
Đánh lại chỉ mục (Reindex) vào Meilisearch
  ↓
Gửi thông báo tới Subscribers qua Email/Push
  ↓
Job hoàn thành
```

**Lợi ích của Queuing**: Phản hồi tức thì cho người dùng, các tác vụ nặng chạy ngầm không gây Lag.

---

### Case 4: System Health Monitoring (Cảnh báo tự động)
```
Mỗi 15 giây, Prometheus Scrape Metrics:
  - CPU usage: 45%, RAM: 2GB
  - Redis size: 512MB
  - Postgres: 12 active connections
  ↓
Prometheus kiểm tra các Alert Rules:
  NẾU CPU > 80% → Fire Alert
  NẾU Redis Memory > 1GB → Fire Alert
  ↓
Alertmanager nhận tín hiệu
  ↓
Gửi tin nhắn Telegram tới đội ngũ OPS 🚨
  ↓
Team kỹ thuật can thiệp kịp thời (Scale up)
```

**Lợi ích của Monitoring**: Phát hiện sớm sự cố (Proactive) thay vì chờ User phản ánh (Reactive).

---

## ⚡ Failure Scenarios & Recovery (Các tình huống lỗi & Phục hồi)

| Component | Impact (Ảnh hưởng) | Recovery Action | Estimated Time |
|-----------|-------------------|-----------------|----------------|
| Postgres | Down toàn hệ thống | Restart service (lớp xử lý nghiệp vụ) hoặc Restore Backup | 5-30 phút |
| Redis | App chạy chậm lại, queue (hàng đợi xử lý) bị nghén | Restart service (lớp xử lý nghiệp vụ) | < 1 phút |
| Meilisearch | Chức năng Search bị lỗi | Rebuild Meilisearch Index | 5-30 phút |
| PgBouncer | App mất kết nối tới DB | Restart hoặc kết nối trực tiếp DB | < 1 phút |
| Caddy | Người dùng không thể truy cập | Restart service (lớp xử lý nghiệp vụ) | < 1 phút |
| worker (tiến trình xử lý nền) | Tác vụ ngầm bị trì trệ | Restart worker (tiến trình xử lý nền) service (lớp xử lý nghiệp vụ) | < 1 phút |

**Critical Path**: Postgres → PgBouncer → Caddy → CMS → Web (Các thành phần bắt buộc phải sống để hệ thống vận hành).

---

## 🚀 Pre-launch Checklist (Danh sách kiểm tra trước khi ra mắt)

- [ ] Cấu hình Daily Backup Postgres lên S3.
- [ ] Thiết lập Prometheus + Grafana hoàn chỉnh.
- [ ] Định nghĩa đầy đủ Alert Rules (Critical & Warning).
- [ ] Kiểm tra kết nối Telegram/Slack của Alertmanager.
- [ ] Thực hiện Load Test (Stress test) để tìm nút thắt cổ chai.
- [ ] Thử nghiệm Failover (Khởi động lại các service (lớp xử lý nghiệp vụ) xem có tự phục hồi không).
- [ ] Viết Runbook hướng dẫn xử lý sự cố cơ bản cho team.

---

## 💡 TL;DR

**Cache + queue (hàng đợi xử lý) + Search + Monitoring = Fast, Reliable, Observable System**

- **Caching**: Phản hồi nhanh hơn 10 lần.
- **Queuing**: Xử lý tác vụ ngầm mượt mà.
- **Advanced Search**: Trải nghiệm tìm kiếm chuyên sâu.
- **Pooling**: Ổn định kết nối Cơ sở dữ liệu.
- **Observability**: Giám sát hệ thống toàn diện.

