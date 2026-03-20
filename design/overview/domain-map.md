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
- nguồn chuẩn cho ownership và responsibility là [architecture-principles.md](./architecture-principles.md)
- nếu `domain-map.md` và `architecture-principles.md` mâu thuẫn nhau, luôn tin `architecture-principles.md`
- `domain-map.md` chỉ dùng để:
  - định vị mô-đun
  - dẫn đường đọc tài liệu
  - mô tả mục đích bề mặt ở mức cao

---

## Recommended reading order (Thứ tự đọc tài liệu)
1. [README.md](../README.md)
2. [DECISIONS.md](../DECISIONS.md)
3. [architecture-principles.md](./architecture-principles.md)
4. [execution-map.md](./execution-map.md)
5. module map và use-case của mô-đun đang chuẩn bị triển khai

---

## Module index (Chỉ mục các mô-đun)

### 01-identity (Định danh)
- **Directory**: [01-identity](../01-identity/)
- **Use when (Dùng khi)**: làm đăng ký, đăng nhập, đăng xuất, Google auth, vai trò, hồ sơ cơ bản
- **Reference (Tài liệu chính)**: [module-map.md](../01-identity/module-map.md), [contracts.md](../01-identity/contracts.md), [PERMISSION_MATRIX.md](../01-identity/PERMISSION_MATRIX.md)

### 02-content (Nội dung)
- **Directory**: [02-content](../02-content/)
- **Use when (Dùng khi)**: làm bài viết, trang chủ đề, guide, download, chant items/plans, thư viện kinh
- **Reference (Tài liệu chính)**: [module-map.md](../02-content/module-map.md), [contracts.md](../02-content/contracts.md), [little-house-experience-architecture.md](../02-content/little-house-experience-architecture.md), [daily-practice-experience-architecture.md](../02-content/daily-practice-experience-architecture.md), [daily-practice-content-inventory.md](../02-content/daily-practice-content-inventory.md), [life-release-experience-architecture.md](../02-content/life-release-experience-architecture.md), [life-release-content-inventory.md](../02-content/life-release-content-inventory.md), [publish-little-house-guide.md](../02-content/use-cases/publish-little-house-guide.md), [publish-life-release-guide.md](../02-content/use-cases/publish-life-release-guide.md)

### 03-community (Cộng đồng)
- **Directory**: [03-community](../03-community/)
- **Use when (Dùng khi)**: làm bình luận bài viết, bài cộng đồng, trả lời cộng đồng, guestbook
- **Reference (Tài liệu chính)**: [module-map.md](../03-community/module-map.md), [contracts.md](../03-community/contracts.md)

### 04-engagement (Tương tác và tu tập)
- **Directory**: [04-engagement](../04-engagement/)
- **Use when (Dùng khi)**: làm bookmark, tiến độ đọc kinh, practice logs/sheets, `Ngôi Nhà Nhỏ`
- **Reference (Tài liệu chính)**: [module-map.md](../04-engagement/module-map.md), [contracts.md](../04-engagement/contracts.md), [schema.dbml](../04-engagement/schema.dbml)

### 05-moderation (Kiểm duyệt)
- **Directory**: [05-moderation](../05-moderation/)
- **Use when (Dùng khi)**: làm báo cáo vi phạm, xử lý report, duyệt guestbook
- **Reference (Tài liệu chính)**: [module-map.md](../05-moderation/module-map.md), [contracts.md](../05-moderation/contracts.md), [resolve-report.md](../05-moderation/use-cases/resolve-report.md)

### 06-search (Tìm kiếm)
- **Directory**: [06-search](../06-search/)
- **Use when (Dùng khi)**: làm search sync, fallback read path, batch reindex
- **Reference (Tài liệu chính)**: [module-map.md](../06-search/module-map.md), [contracts.md](../06-search/contracts.md), [index-published-post.md](../06-search/use-cases/index-published-post.md)

### 07-calendar (Lịch tu học)
- **Directory**: [07-calendar](../07-calendar/)
- **Use when (Dùng khi)**: làm event, lịch âm, lịch tu học cá nhân, daily advisory
- **Reference (Tài liệu chính)**: [module-map.md](../07-calendar/module-map.md), [PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md](../07-calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md), [organizational-events-architecture.md](../07-calendar/organizational-events-architecture.md), [manage-organizational-event-agenda.md](../07-calendar/use-cases/manage-organizational-event-agenda.md), [reschedule-or-cancel-event.md](../07-calendar/use-cases/reschedule-or-cancel-event.md)

### 08-notification (Thông báo)
- **Directory**: [08-notification](../08-notification/)
- **Use when (Dùng khi)**: làm push subscriptions, notification jobs, reminder schedules
- **Reference (Tài liệu chính)**: [module-map.md](../08-notification/module-map.md), [contracts.md](../08-notification/contracts.md), [dispatch-push-job.md](../08-notification/use-cases/dispatch-push-job.md)

### 09-vows-merit (Nguyện và công đức)
- **Directory**: [09-vows-merit](../09-vows-merit/)
- **Use when (Dùng khi)**: làm vow, tiến độ vow, life release journal
- **Reference (Tài liệu chính)**: [module-map.md](../09-vows-merit/module-map.md), [contracts.md](../09-vows-merit/contracts.md), [log-life-release.md](../09-vows-merit/use-cases/log-life-release.md), [assisted-entry-workflow.md](../09-vows-merit/assisted-entry-workflow.md), [create-assisted-life-release-entry.md](../09-vows-merit/use-cases/create-assisted-life-release-entry.md)

### 10-wisdom-qa (Trí tuệ và hỏi đáp)
- **Directory**: [10-wisdom-qa](../10-wisdom-qa/)
- **Use when (Dùng khi)**: làm bạch thoại, hỏi đáp, authority profile, offline bundle
- **Reference (Tài liệu chính)**: [module-map.md](../10-wisdom-qa/module-map.md), [INGESTION_PLAN.md](../10-wisdom-qa/INGESTION_PLAN.md)

### 11-contact (Liên hệ & Phụng Sự Viên)
- **Directory**: [11-contact](../11-contact/)
- **Use when (Dùng khi)**: làm trang liên hệ, danh sách phụng sự viên, liên hệ qua Zalo
- **Reference (Tài liệu chính)**: [module-map.md](../11-contact/module-map.md), [contracts.md](../11-contact/contracts.md), [update-contact-info.md](../11-contact/use-cases/update-contact-info.md), [manage-volunteer-directory.md](../11-contact/use-cases/manage-volunteer-directory.md)

---

## Cross-cutting references (Tài liệu xuyên mô-đun)
- **Base decisions (Quyết định nền tảng)**: [DECISIONS.md](../DECISIONS.md)
- **Architecture principles (Nguyên tắc kiến trúc)**: [architecture-principles.md](./architecture-principles.md)
- **Execution & debug maps (Bản đồ thực thi và gỡ lỗi)**: [execution-map.md](./execution-map.md)
- **Inter-module interactions (Tương tác giữa các mô-đun)**: [module-interactions.md](../tracking/module-interactions.md)
- **Policies (Chính sách)**: [audit-policy.md](../tracking/audit-policy.md), [sla-slo.md](../baseline/sla-slo.md), [security.md](../baseline/security.md)

---

## Rules for future edits (Quy tắc cập nhật về sau)
1. Khi thêm mô-đun mới: tạo thư mục vật lý trước, cập nhật `architecture-principles.md`, rồi mới thêm chỉ mục ngắn ở đây.
2. Không copy logic chi tiết từ canonical source sang file chỉ mục này.
3. Mỗi entry ở đây nên ngắn; nếu cần chi tiết, đưa sang `architecture-principles.md` hoặc `module-map.md` tương ứng.
