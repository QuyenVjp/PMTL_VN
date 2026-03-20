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
2. [CORE_DECISIONS.md](../CORE_DECISIONS.md)
3. [architecture-principles.md](./architecture-principles.md)
4. [execution-map.md](./execution-map.md)
5. module map và use-case của mô-đun đang chuẩn bị triển khai

---

## Module index (Chỉ mục các mô-đun)

### 00-identity (Định danh)
- **Directory**: [00-identity](../00-identity/)
- **Use when (Dùng khi)**: làm đăng ký, đăng nhập, đăng xuất, Google auth, vai trò, hồ sơ cơ bản
- **Reference (Tài liệu chính)**: [module-map.md](../00-identity/module-map.md), [contracts.md](../00-identity/contracts.md), [PERMISSION_MATRIX.md](../00-identity/PERMISSION_MATRIX.md)

### 01-content (Nội dung)
- **Directory**: [01-content](../01-content/)
- **Use when (Dùng khi)**: làm bài viết, trang chủ đề, guide, download, chant items/plans, thư viện kinh
- **Reference (Tài liệu chính)**: [module-map.md](../01-content/module-map.md), [contracts.md](../01-content/contracts.md)

### 02-community (Cộng đồng)
- **Directory**: [02-community](../02-community/)
- **Use when (Dùng khi)**: làm bình luận bài viết, bài cộng đồng, trả lời cộng đồng, guestbook
- **Reference (Tài liệu chính)**: [module-map.md](../02-community/module-map.md), [contracts.md](../02-community/contracts.md)

### 03-engagement (Tương tác và tu tập)
- **Directory**: [03-engagement](../03-engagement/)
- **Use when (Dùng khi)**: làm bookmark, tiến độ đọc kinh, practice logs/sheets, `Ngôi Nhà Nhỏ`
- **Reference (Tài liệu chính)**: [module-map.md](../03-engagement/module-map.md), [contracts.md](../03-engagement/contracts.md), [schema.dbml](../03-engagement/schema.dbml)

### 04-moderation (Kiểm duyệt)
- **Directory**: [04-moderation](../04-moderation/)
- **Use when (Dùng khi)**: làm báo cáo vi phạm, xử lý report, duyệt guestbook
- **Reference (Tài liệu chính)**: [module-map.md](../04-moderation/module-map.md), [contracts.md](../04-moderation/contracts.md), [resolve-report.md](../04-moderation/use-cases/resolve-report.md)

### 05-search (Tìm kiếm)
- **Directory**: [05-search](../05-search/)
- **Use when (Dùng khi)**: làm search sync, fallback read path, batch reindex
- **Reference (Tài liệu chính)**: [module-map.md](../05-search/module-map.md), [contracts.md](../05-search/contracts.md), [index-published-post.md](../05-search/use-cases/index-published-post.md)

### 06-calendar (Lịch tu học)
- **Directory**: [06-calendar](../06-calendar/)
- **Use when (Dùng khi)**: làm event, lịch âm, lịch tu học cá nhân, daily advisory
- **Reference (Tài liệu chính)**: [module-map.md](../06-calendar/module-map.md), [PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md](../06-calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md)

### 07-notification (Thông báo)
- **Directory**: [07-notification](../07-notification/)
- **Use when (Dùng khi)**: làm push subscriptions, notification jobs, reminder schedules
- **Reference (Tài liệu chính)**: [module-map.md](../07-notification/module-map.md), [contracts.md](../07-notification/contracts.md)

### 08-vows-merit (Nguyện và công đức)
- **Directory**: [08-vows-merit](../08-vows-merit/)
- **Use when (Dùng khi)**: làm vow, tiến độ vow, life release journal
- **Reference (Tài liệu chính)**: [module-map.md](../08-vows-merit/module-map.md), [contracts.md](../08-vows-merit/contracts.md), [log-life-release.md](../08-vows-merit/use-cases/log-life-release.md)

### 09-wisdom-qa (Trí tuệ và hỏi đáp)
- **Directory**: [09-wisdom-qa](../09-wisdom-qa/)
- **Use when (Dùng khi)**: làm bạch thoại, hỏi đáp, authority profile, offline bundle
- **Reference (Tài liệu chính)**: [module-map.md](../09-wisdom-qa/module-map.md), [INGESTION_PLAN.md](../09-wisdom-qa/INGESTION_PLAN.md)

---

## Cross-cutting references (Tài liệu xuyên mô-đun)
- **Base decisions (Quyết định nền tảng)**: [CORE_DECISIONS.md](../CORE_DECISIONS.md)
- **Architecture principles (Nguyên tắc kiến trúc)**: [architecture-principles.md](./architecture-principles.md)
- **Execution & debug maps (Bản đồ thực thi và gỡ lỗi)**: [execution-map.md](./execution-map.md)
- **Inter-module interactions (Tương tác giữa các mô-đun)**: [MODULE_INTERACTIONS.md](../MODULE_INTERACTIONS.md)
- **Policies (Chính sách)**: [AUDIT_POLICY.md](../AUDIT_POLICY.md), [SLA_SLO.md](../SLA_SLO.md), [SECURITY_BASELINE.md](../SECURITY_BASELINE.md)

---

## Rules for future edits (Quy tắc cập nhật về sau)
1. Khi thêm mô-đun mới: tạo thư mục vật lý trước, cập nhật `architecture-principles.md`, rồi mới thêm chỉ mục ngắn ở đây.
2. Không copy logic chi tiết từ canonical source sang file chỉ mục này.
3. Mỗi entry ở đây nên ngắn; nếu cần chi tiết, đưa sang `architecture-principles.md` hoặc `module-map.md` tương ứng.
