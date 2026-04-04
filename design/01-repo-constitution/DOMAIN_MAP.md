# Domain Map (Bản đồ mô-đun nghiệp vụ)

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# PMTL_VN

> Ghi chú cho sinh viên:
> File này là index document (tài liệu chỉ mục), giúp định vị mô-đun và tài liệu chuẩn. Nó không phải nơi tự ý đổi owner/responsibility mapping (ánh xạ quyền sở hữu và trách nhiệm).

---

## Canonical source rule (Quy tắc nguồn chuẩn duy nhất)
- thứ tự ưu tiên nằm ở [ROOT_DOC_OWNERSHIP.md](ROOT_DOC_OWNERSHIP.md)
- ownership và responsibility mức domain nằm ở từng `NN-domain/MODULE_MAP.md`
- cross-module ownership/boundary nằm ở [design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md](../04-execution-overlay/cross-module/MODULE_INTERACTIONS.md)
- `domain-map.md` chỉ dùng để:
  - định vị mô-đun
  - dẫn đường đọc tài liệu
  - mô tả mục đích bề mặt ở mức cao

---

## Recommended reading order (Thứ tự đọc tài liệu)
1. [README.md](../README.md)
2. [DECISIONS.md](./DECISIONS.md)
3. [ROOT_DOC_OWNERSHIP.md](./ROOT_DOC_OWNERSHIP.md)
4. [module-interactions.md](../04-execution-overlay/cross-module/MODULE_INTERACTIONS.md)
5. [architecture-principles.md](./ARCHITECTURE_PRINCIPLES.md)
6. [execution-map.md](./EXECUTION_MAP.md)
7. module map và use-case của mô-đun đang chuẩn bị triển khai

---

## Module index (Chỉ mục các mô-đun)

### 01-identity (Định danh)
- **Directory**: [01-identity](../03-domains/identity/)
- **Use when (Dùng khi)**: làm đăng ký, đăng nhập, đăng xuất, Google auth, vai trò, hồ sơ cơ bản
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/identity/MODULE_MAP.md), [contracts.md](../03-domains/identity/CONTRACTS.md), [PERMISSION_MATRIX.md](../03-domains/identity/PERMISSION_MATRIX.md)

### 02-content (Nội dung)
- **Directory**: [02-content](../03-domains/content/)
- **Use when (Dùng khi)**: làm bài viết, trang chủ đề, guide, download, chant items/plans, thư viện kinh
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/content/MODULE_MAP.md), [contracts.md](../03-domains/content/CONTRACTS.md), [little-house-experience-architecture.md](../03-domains/content/little-house-experience-architecture.md), [daily-practice-experience-architecture.md](../03-domains/content/daily-practice-experience-architecture.md), [daily-practice-content-inventory.md](../03-domains/content/daily-practice-content-inventory.md), [life-release-experience-architecture.md](../03-domains/content/life-release-experience-architecture.md), [life-release-content-inventory.md](../03-domains/content/life-release-content-inventory.md), [media-library-experience-architecture.md](../03-domains/content/media-library-experience-architecture.md), [media-library-content-inventory.md](../03-domains/content/media-library-content-inventory.md), [publish-little-house-guide.md](../03-domains/content/USE_CASES/publish-little-house-guide.md), [publish-life-release-guide.md](../03-domains/content/USE_CASES/publish-life-release-guide.md), [publish-media-library-collection.md](../03-domains/content/USE_CASES/publish-media-library-collection.md)

### 03-community (Cộng đồng)
- **Directory**: [03-community](../03-domains/community/)
- **Use when (Dùng khi)**: làm bình luận bài viết, bài cộng đồng, trả lời cộng đồng, guestbook
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/community/MODULE_MAP.md), [contracts.md](../03-domains/community/CONTRACTS.md)

### 04-engagement (Tương tác và tu tập)
- **Directory**: [04-engagement](../03-domains/engagement/)
- **Use when (Dùng khi)**: làm bookmark, tiến độ đọc kinh, practice logs/sheets, `Ngôi Nhà Nhỏ`
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/engagement/MODULE_MAP.md), [contracts.md](../03-domains/engagement/CONTRACTS.md), [schema.dbml](../03-domains/engagement/SCHEMA_PLAN.dbml)

### 05-moderation (Kiểm duyệt)
- **Directory**: [05-moderation](../03-domains/moderation/)
- **Use when (Dùng khi)**: làm báo cáo vi phạm, xử lý report, duyệt guestbook
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/moderation/MODULE_MAP.md), [contracts.md](../03-domains/moderation/CONTRACTS.md), [resolve-report.md](../03-domains/moderation/USE_CASES/resolve-report.md)

### 06-search (Tìm kiếm)
- **Directory**: [06-search](../03-domains/search/)
- **Use when (Dùng khi)**: làm search sync, fallback read path, batch reindex
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/search/MODULE_MAP.md), [contracts.md](../03-domains/search/CONTRACTS.md), [index-published-post.md](../03-domains/search/USE_CASES/index-published-post.md)

### 07-calendar (Lịch tu học)
- **Directory**: [07-calendar](../03-domains/calendar/)
- **Use when (Dùng khi)**: làm event, lịch âm, lịch tu học cá nhân, daily advisory
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/calendar/MODULE_MAP.md), [PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md](../03-domains/calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md), [organizational-events-architecture.md](../03-domains/calendar/organizational-events-architecture.md), [manage-organizational-event-agenda.md](../03-domains/calendar/USE_CASES/manage-organizational-event-agenda.md), [reschedule-or-cancel-event.md](../03-domains/calendar/USE_CASES/reschedule-or-cancel-event.md)

### 08-notification (Thông báo)
- **Directory**: [08-notification](../03-domains/notification/)
- **Use when (Dùng khi)**: làm push subscriptions, notification jobs, reminder schedules
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/notification/MODULE_MAP.md), [contracts.md](../03-domains/notification/CONTRACTS.md), [dispatch-push-job.md](../03-domains/notification/USE_CASES/dispatch-push-job.md)

### 09-vows-merit (Nguyện và công đức)
- **Directory**: [09-vows-merit](../03-domains/vows-merit/)
- **Use when (Dùng khi)**: làm vow, tiến độ vow, life release journal
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/vows-merit/MODULE_MAP.md), [contracts.md](../03-domains/vows-merit/CONTRACTS.md), [log-life-release.md](../03-domains/vows-merit/USE_CASES/log-life-release.md), [assisted-entry-workflow.md](../03-domains/vows-merit/REFERENCES/ASSISTED_ENTRY_WORKFLOW.md), [create-assisted-life-release-entry.md](../03-domains/vows-merit/USE_CASES/create-assisted-life-release-entry.md)

### 10-wisdom-qa (Trí tuệ và hỏi đáp)
- **Directory**: [10-wisdom-qa](../03-domains/wisdom-qa/)
- **Use when (Dùng khi)**: làm bạch thoại, hỏi đáp, authority profile, offline bundle
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/wisdom-qa/MODULE_MAP.md), [INGESTION_PLAN.md](../03-domains/wisdom-qa/REFERENCES/INGESTION_PLAN.MD), [baihua-audiobook-text-first-architecture.md](../03-domains/wisdom-qa/baihua-audiobook-text-first-architecture.md), [baihua-audiobook-ingestion-inventory.md](../03-domains/wisdom-qa/baihua-audiobook-ingestion-inventory.md), [ingest-baihua-audiobook-source.md](../03-domains/wisdom-qa/USE_CASES/ingest-baihua-audiobook-source.md)

### 11-contact (Liên hệ & Phụng Sự Viên)
- **Directory**: [11-contact](../03-domains/contact/)
- **Use when (Dùng khi)**: làm trang liên hệ, danh sách phụng sự viên, liên hệ qua Zalo
- **Reference (Tài liệu chính)**: [module-map.md](../03-domains/contact/MODULE_MAP.md), [contracts.md](../03-domains/contact/CONTRACTS.md), [update-contact-info.md](../03-domains/contact/USE_CASES/update-contact-info.md), [manage-volunteer-directory.md](../03-domains/contact/USE_CASES/manage-volunteer-directory.md)

### 12-altar-management (Quản Lý Bàn Thờ)
- **Directory**: [12-altar-management](../03-domains/altar-management/)
- **Use when (Dùng khi)**: làm kiểm tra điều kiện bàn thờ, đồ thờ cúng (hương, đèn, bình hoa), protocol xử lý đồ cúng hư hỏng, watermark nguồn gốc hiện vật tâm linh
- **Reference (Tài liệu chính)**: [decisions.md](../03-domains/altar-management/DECISIONS.md), [module-map.md](../03-domains/altar-management/MODULE_MAP.md), [contracts.md](../03-domains/altar-management/CONTRACTS.md)
- **Chú ý**: Domain này cover phần **vật lý - nghi lễ** của bàn thờ; business logic phóng sinh và nguyện thuộc `09-vows-merit`; nội dung hướng dẫn bàn thờ thuộc `02-content`.

---

## Cross-cutting references (Tài liệu xuyên mô-đun)
- **Base decisions (Quyết định nền tảng)**: [DECISIONS.md](./DECISIONS.md)
- **Architecture summary (Tóm tắt kiến trúc)**: [architecture-principles.md](./ARCHITECTURE_PRINCIPLES.md)
- **Execution & debug maps (Bản đồ thực thi và gỡ lỗi)**: [execution-map.md](./EXECUTION_MAP.md)
- **Inter-module interactions (Tương tác giữa các mô-đun)**: [module-interactions.md](../04-execution-overlay/cross-module/MODULE_INTERACTIONS.md)
- **Policies (Chính sách)**: [audit-policy.md](../04-execution-overlay/api/AUDIT_POLICY.md), [sla-slo.md](../02-platform-baseline/deploy-ops/SLA_SLO.md), [security.md](../02-platform-baseline/security-runtime/SECURITY_POLICY.md)

---

## Rules for future edits (Quy tắc cập nhật về sau)
1. Khi thêm mô-đun mới: tạo thư mục vật lý trước, chốt `module-map.md` của mô-đun và cập nhật `design/04-execution-overlay/cross-module/MODULE_INTERACTIONS.md` nếu có boundary mới, rồi mới thêm chỉ mục ngắn ở đây.
2. Không copy logic chi tiết từ canonical source sang file chỉ mục này.
3. Mỗi entry ở đây nên ngắn; nếu cần chi tiết, đưa sang `module-map.md`, `contracts.md`, hoặc owner doc tương ứng.
