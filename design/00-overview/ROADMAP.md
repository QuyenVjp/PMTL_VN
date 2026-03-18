# PMTL_VN: Seven-Day Dev Roadmap (Lộ trình Phát triển 7 Ngày)

## Day 1: Finalize Content Module Design (Hoàn thiện Thiết kế Content Module) ✓

**Goal (Mục tiêu)**: Phê duyệt Content Schema, chốt 5 Design Decisions quan trọng.

**Files reviewed (Các tệp đã xem xét)**:
- `design/01-content/module-map.md` (Bản đồ Markmap)
- `design/01-content/flows.mmd` (5 Business Flows chính)
- `design/01-content/schema.dbml` (Entity & Relationship)
- `design/01-content/decisions.md` (5 Decisions thiết kế)

**Output (Kết quả)**: Content Module đã sẵn sàng để Implementation.

**Also completed (Các đầu mục khác đã hoàn tất)**:
- `design/00-overview/domain-map.md` (Mở rộng 8 Modules hệ thống)
- `design/00-overview/architecture.mmd` (Kiến trúc chi tiết với PgBouncer, Exporters, v.v.)
- `design/00-overview/architecture-flows.mmd` (8 System Flows chính)
- `design/00-overview/architecture-principles.md` (9 Nguyên tắc kiến trúc)
- `design/infra/INFRASTRUCTURE.md` (Chi tiết 13 Components hạ tầng)
- `design/infra/DEPENDENCIES.md` (Dependency Graph, Failure Scenarios)
- `design/infra/DOCKER_COMPOSE.md` (Tài liệu tham chiếu Dev Setup)

---

## Day 2: Create Community Module Design (Thiết kế Community Module)

**Goal (Mục tiêu)**: Xây dựng bản đồ Domain, Flows và các Entities cho cộng đồng/diễn đàn.

**To create (Các tệp cần tạo)**:
- `design/02-community/module-map.md`
- `design/02-community/flows.mmd`
- `design/02-community/schema.dbml`
- `design/02-community/decisions.md`

**Key questions (Câu hỏi then chốt)**:
- Thread Nesting: 1 level (reply to thread) hay 2 level (reply to reply)?
- Moderation: Auto-flag words hay Manual Review only?
- Comment Threading: Dạng Linear (tuyến tính) hay Tree (dạng cây)?

**Output (Kết quả)**: Hoàn tất thiết kế Community Module.

---

## Day 3: Create Engagement Module Design (Thiết kế Engagement Module)

**Goal (Mục tiêu)**: Xây dựng bản đồ cho Bookmarks, Progress Tracking, và Gamification.

**To create (Các tệp cần tạo)**:
- `design/03-engagement/module-map.md`
- `design/03-engagement/flows.mmd`
- `design/03-engagement/schema.dbml`
- `design/03-engagement/decisions.md`

**Key topics (Chủ đề quan trọng)**:
- Progress Tracking: Theo từng Sutra hay theo từng Series bài giảng?
- Streaks: Reset vào nửa đêm (Midnight) hay theo User Timezone?
- Leaderboard: Chụp ảnh Snapshot theo tuần hay theo tháng?

**Output (Kết quả)**: Hoàn tất thiết kế Engagement Module.

---

## Day 4: Rapid Moderation + Search Design (Thiết kế nhanh Moderation & Search)

**Goal (Mục tiêu)**: Thiết kế nhanh cho Moderation & Search (chưa đi sâu vào triển khai chi tiết).

**To create (Moderation)**:
- `design/04-moderation/module-map.md`
- `design/04-moderation/flows.mmd`
- `design/04-moderation/schema.dbml`
- `design/04-moderation/decisions.md`

**To create (Search)**:
- `design/05-search/module-map.md`
- `design/05-search/flows.mmd`
- `design/05-search/schema.dbml` (nếu cần)
- `design/05-search/decisions.md`

**Output (Kết quả)**: Phác thảo xong sơ đồ Moderation & Search Modules.

---

## Day 5: Create Calendar + Notification Design (Thiết kế Calendar & Notification)

**Goal (Mục tiêu)**: Thiết kế các tính năng nhẹ cho Calendar & Notification hệ thống.

**To create (Calendar)**:
- `design/06-calendar/module-map.md`
- `design/06-calendar/flows.mmd`
- `design/06-calendar/schema.dbml`
- `design/06-calendar/decisions.md`

**To create (Notification)**:
- `design/07-notification/module-map.md`
- `design/07-notification/flows.mmd`
- (Không có Schema riêng, sử dụng chung dữ liệu khác)
- `design/07-notification/decisions.md`

**Output (Kết quả)**: Hoàn thiện thiết kế Calendar & Notification Modules.

---

## Day 6: Consolidate Design Decisions + API Contracts (Hợp nhất Quyết định Thiết kế & Hợp đồng API)

**Goal (Mục tiêu)**: Viết tài liệu thiết kế tổng hợp và các API Surface.

**To create (Các tệp cần tạo)**:
- `design/CORE_DECISIONS.md` (Top 10 Decisions quan trọng nhất toàn hệ thống)
- `design/MODULE_INTERACTIONS.md` (Cách các Modules giao tiếp với nhau)
- `docs/api/API_SPEC.md` (REST Endpoints, Payload Specs)

**Tasks (Công việc)**:
- Review lại Decisions Files của cả 7 Modules.
- Trích xuất các Cross-cutting Decisions quan trọng nhất.
- Map lộ trình giao tiếp Module-to-Module.
- Phác thảo cấu trúc Payload Collection.

**Output (Kết quả)**: Làm rõ API Surface và Module Contracts.

---

## Day 7: Final Review + Setup Implementation Skeleton (Đánh giá cuối cùng & Thiết lập Khung Triển khai)

**Goal (Mục tiêu)**: Đảm bảo tính nhất quán (Consistency) và khởi động Implementation.

**Tasks (Công việc)**:
- Sanity-check tất cả Module Diagrams (kiểm tra các Actors và Flows).
- Verify lại ER Relationships (đảm bảo không có Orphaned Tables).
- Xác nhận các Tech Stack Decisions (DB Indexing, Cache TTL, Queue).
- Cập nhật `.agents/skills/pmtl-vn-architecture/SKILL.md` v2 (theo thiết kế cuối cùng).
- Thiết lập Payload Collection Scaffolding (cấu trúc thư mục `apps/cms/src/collections/`).
- Tạo `/docs/IMPLEMENTATION.md` (Hướng dẫn Step-by-step cho Sprint đầu tiên).

**Output (Kết quả)**: Đội ngũ Dev đã sẵn sàng để bắt đầu Implementation.

---

## Implementation Start (Tuần 2)

### Sprint 1: Setup + Content
- Payload CMS Boilerplate
- User + Auth Collections
- Content Collections (posts, revisions, media)
- Basic Payload Admin UI

### Sprint 2: Community + Testing
- Thread + Comment Collections
- Community Moderation Queue
- Unit Tests cho các Key Flows quan trọng

### Sprint 3: Engagement + Frontend
- Bookmark & Progress Collections
- Frontend Pages (read content, bookmark, profile)
- Search Integration (Meilisearch)

### Sprint 4+: Polish, Optimize, Launch (Tối ưu hóa & Phát hành)

---

## Deliverables Checklist (Danh sách Sản phẩm bàn giao)

Đến cuối Ngày 7, hệ thống cần có:

- [x] Domain-map (8 Modules, Actors, Flows)
- [x] Architecture Overview (Services, Connections)
- [x] Architecture Flows (8 Major Async/Sync Flows)
- [x] Architecture Principles (Why Tech, 9 Principles)
- [ ] 7 Module Designs (Map + Flows + Schema + Decisions mỗi module)
- [ ] Core Cross-cutting Decisions (Top 10)
- [ ] Module Interaction Map (APIs giữa các Modules)
- [ ] API Spec (Payload Collections)
- [ ] Implementation Skeleton (Cấu trúc Codebase)
- [ ] Updated .agents/skills với Final Architecture

---

## File Structure After Day 7 (Cấu trúc tệp sau Ngày 7)

```
design/
  00-overview/
    domain-map.md
    architecture.mmd
    architecture-flows.mmd
    architecture-principles.md
  01-content/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  02-community/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  03-engagement/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  04-moderation/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  05-search/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  06-calendar/
    module-map.md
    flows.mmd
    schema.dbml
    decisions.md
  07-notification/
    module-map.md
    flows.mmd
    decisions.md
  CORE_DECISIONS.md
  MODULE_INTERACTIONS.md
```

Total: 31 files, tất cả đều ở định dạng text-based, AI-friendly, và có thể theo dõi qua Git.

---

## How to Use These Files (Cách sử dụng các tệp này)

**For AI Prompting (Dành cho AI)**:
```
Dựa trên design/01-content/*, hãy tạo Payload Collection Config
```

**For Code Review (Dành cho kiểm duyệt mã nguồn)**:
```
Kiểm tra xem Implementation có khớp với design/01-content/schema.dbml không?
```

**For Status Meeting (Dành cho họp báo cáo)**:
```
Xem design/CORE_DECISIONS.md để cập nhật trạng thái cho Stakeholders
```

**For Onboarding New Dev (Hướng dẫn nhân sự mới)**:
```
Đọc design/00-overview/domain-map.md để hiểu kiến trúc hệ thống (System Overview)
```

Mọi dữ liệu luôn đồng bộ với mã nguồn nhờ vào phương pháp Text-based Design.
