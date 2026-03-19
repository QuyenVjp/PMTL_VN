# PMTL_VN Domain Map (Bản đồ nghiệp vụ PMTL_VN)

---
markmap:
  colorFreezeLevel: 2
  initialExpandLevel: 3
---

# PMTL_VN

> Ghi chú cho sinh viên:
> File này là `index/reference-only document (tài liệu chỉ mục/tham chiếu)`.
> Nó giúp bạn biết module nào tồn tại, nên đọc file nào trước, và tài liệu chuẩn đang nằm ở đâu.
> File này **không được phép** tự chốt lại owner/responsibility mapping.

## Canonical Source Rule (Quy tắc nguồn chuẩn duy nhất)

- Owner/responsibility mapping chuẩn duy nhất nằm ở [architecture-principles.md](./architecture-principles.md).
- Nếu [domain-map.md](./domain-map.md) và [architecture-principles.md](./architecture-principles.md) có vẻ nói khác nhau, luôn tin [architecture-principles.md](./architecture-principles.md).
- `domain-map.md` chỉ dùng để:
  - định vị module
  - dẫn đường đọc tài liệu
  - tóm tắt purpose bề mặt, không tóm tắt owner logic

## Read Order (Thứ tự đọc)

1. [README.md](../README.md)
2. [CORE_DECISIONS.md](../CORE_DECISIONS.md)
3. [architecture-principles.md](./architecture-principles.md)
4. [execution-map.md](./execution-map.md)
5. module-map và use-cases của module đang làm

## Module Index (Chỉ mục module)

### 00-identity
- Thư mục: [00-identity](../00-identity/)
- Dùng khi làm:
  - đăng ký, đăng nhập, đăng xuất
  - reset mật khẩu
  - Google login
  - role, block state, profile cơ bản
- Đọc trước:
  - [module-map.md](../00-identity/module-map.md)
  - [contracts.md](../00-identity/contracts.md)
  - [PERMISSION_MATRIX.md](../00-identity/PERMISSION_MATRIX.md)

### 01-content
- Thư mục: [01-content](../01-content/)
- Dùng khi làm:
  - bài viết, hub page, hướng dẫn sơ học, tải về
  - chant items, chant plans
  - thư viện kinh văn
- Đọc trước:
  - [module-map.md](../01-content/module-map.md)
  - [contracts.md](../01-content/contracts.md)
  - [practice-support-flows.mmd](../01-content/practice-support-flows.mmd)

### 02-community
- Thư mục: [02-community](../02-community/)
- Dùng khi làm:
  - bình luận bài viết
  - bài viết cộng đồng, bình luận cộng đồng
  - guestbook
- Đọc trước:
  - [module-map.md](../02-community/module-map.md)
  - [contracts.md](../02-community/contracts.md)

### 03-engagement
- Thư mục: [03-engagement](../03-engagement/)
- Dùng khi làm:
  - bookmark, reading progress
  - practice logs, practice sheets
  - Ngôi Nhà Nhỏ
- Đọc trước:
  - [module-map.md](../03-engagement/module-map.md)
  - [contracts.md](../03-engagement/contracts.md)
  - [schema.dbml](../03-engagement/schema.dbml)

### 04-moderation
- Thư mục: [04-moderation](../04-moderation/)
- Dùng khi làm:
  - report vi phạm
  - resolve report
  - guestbook approval path
- Đọc trước:
  - [module-map.md](../04-moderation/module-map.md)
  - [contracts.md](../04-moderation/contracts.md)
  - [resolve-report.md](../04-moderation/use-cases/resolve-report.md)

### 05-search
- Thư mục: [05-search](../05-search/)
- Dùng khi làm:
  - search sync
  - search fallback
  - batch reindex
- Đọc trước:
  - [module-map.md](../05-search/module-map.md)
  - [contracts.md](../05-search/contracts.md)
  - [index-published-post.md](../05-search/use-cases/index-published-post.md)

### 06-calendar
- Thư mục: [06-calendar](../06-calendar/)
- Dùng khi làm:
  - events
  - lunar events
  - personal practice calendar
  - daily advisory
- Đọc trước:
  - [module-map.md](../06-calendar/module-map.md)
  - [PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md](../06-calendar/PERSONAL_PRACTICE_CALENDAR_READ_MODEL.md)
  - [refresh-personal-practice-calendar.md](../06-calendar/use-cases/refresh-personal-practice-calendar.md)

### 07-notification
- Thư mục: [07-notification](../07-notification/)
- Dùng khi làm:
  - push subscriptions
  - push jobs
  - reminder schedules
- Đọc trước:
  - [module-map.md](../07-notification/module-map.md)
  - [contracts.md](../07-notification/contracts.md)
  - [dispatch-push-job.md](../07-notification/use-cases/dispatch-push-job.md)

### 08-vows-merit
- Thư mục: [08-vows-merit](../08-vows-merit/)
- Dùng khi làm:
  - phát nguyện
  - tiến độ nguyện
  - sổ tay phóng sanh
- Đọc trước:
  - [module-map.md](../08-vows-merit/module-map.md)
  - [contracts.md](../08-vows-merit/contracts.md)
  - [log-life-release.md](../08-vows-merit/use-cases/log-life-release.md)

### 09-wisdom-qa
- Thư mục: [09-wisdom-qa](../09-wisdom-qa/)
- Dùng khi làm:
  - Bạch thoại Phật pháp
  - Huyền học vấn đáp / Phật học vấn đáp
  - authority profile
  - offline bundle
- Đọc trước:
  - [module-map.md](../09-wisdom-qa/module-map.md)
  - [INGESTION_PLAN.md](../09-wisdom-qa/INGESTION_PLAN.md)
  - [publish-wisdom-entry.md](../09-wisdom-qa/use-cases/publish-wisdom-entry.md)

## Cross-Cutting References (Tài liệu cắt ngang)

- Quyết định nền tảng: [CORE_DECISIONS.md](../CORE_DECISIONS.md)
- Mapping owner/service chuẩn: [architecture-principles.md](./architecture-principles.md)
- Luồng thực thi và câu hỏi debug: [execution-map.md](./execution-map.md)
- Tương tác giữa module: [MODULE_INTERACTIONS.md](../MODULE_INTERACTIONS.md)
- Chính sách audit: [AUDIT_POLICY.md](../AUDIT_POLICY.md)
- SLA/SLO: [SLA_SLO.md](../SLA_SLO.md)
- Baseline bảo mật: [SECURITY_BASELINE.md](../SECURITY_BASELINE.md)
- Failure matrix: [FAILURE_MODE_MATRIX.md](../FAILURE_MODE_MATRIX.md)
- Quy tắc thuật ngữ: [TERMINOLOGY_RULES.md](../TERMINOLOGY_RULES.md)
- Quy tắc EN/VI: [EN_VI_NOTATION_RULES.md](../EN_VI_NOTATION_RULES.md)

## Rule For Future Edits (Quy tắc sửa về sau)

- Khi thêm module mới:
  - thêm thư mục module thật
  - cập nhật [architecture-principles.md](./architecture-principles.md) trước
  - sau đó mới thêm chỉ mục ngắn vào file này
- Không copy lại:
  - owner collection
  - service responsibility
  - permission boundary
  - delete policy
  - search sync guarantee
- Nếu thấy cần viết dài hơn 5-7 dòng cho một module ở file này, khả năng cao nội dung đó phải nằm ở `architecture-principles.md` hoặc `module-map.md` thay vì ở đây.
