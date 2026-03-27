# ADR Template — Architecture Decision Records

File này là mẫu ngắn nhất để ghi lại một quyết định kiến trúc trong PMTL_VN.

**Rule**: Mỗi quyết định quan trọng (tech choice, boundary change, explicit exclusion) phải có ADR.
Owner của full ADR list là `design/01-repo-constitution/DECISIONS.md`.
File này chỉ là template để viết nhanh — không thay DECISIONS.md.

---

## Template (copy và điền)

```markdown
# ADR-NNN: [Tiêu đề ngắn gọn]

**Date**: YYYY-MM-DD
**Status**: proposed | accepted | superseded | rejected
**Supersedes**: ADR-XXX (nếu có)

## Context

[1-3 câu: tại sao cần quyết định này ngay bây giờ]

## Decision

[1-2 câu: quyết định là gì]

## Consequences

**Good**: [bullet 1-3 điểm lợi]
**Bad**: [bullet 1-3 điểm hại / trade-off]

## Trigger to reconsider

[Khi nào thì review lại quyết định này — phải đo được]
```

---

## Ví dụ thật trong PMTL_VN

### ADR-001: Dùng Postgres app-layer rate limit thay Valkey cho Phase 1

**Date**: 2026-03-01
**Status**: accepted

**Context**: Phase 1 cần rate limit ngay cho auth/search/upload. Valkey chưa được activated.

**Decision**: Dùng bảng `rate_limit_records` Postgres + app-layer guard. Không activate Valkey Phase 1.

**Consequences**
- Good: không thêm infra dependency sớm, đơn giản hơn, zero config
- Bad: p95 latency sẽ tăng nếu query rate_limit_records dưới load cao

**Trigger to reconsider**: rate_limit_records query p95 > 100ms sustained 15 phút, hoặc lock waits lặp lại.

---

### ADR-002: Meilisearch là search engine mặc định (Search-first launch)

**Date**: 2026-03-21
**Status**: accepted

**Context**: PMTL chọn Search-first launch. SQL fallback phức tạp và chậm cho full-text tiếng Việt.

**Decision**: `SEARCH_ENGINE=meilisearch` là default launch profile. SQL fallback chỉ là contingency.

**Consequences**
- Good: full-text tiếng Việt tốt hơn SQL, UX tìm kiếm lời dạy nhanh hơn
- Bad: thêm 1 container trong Docker Compose, cần search sync discipline

**Trigger to reconsider**: Meilisearch downtime > 5% trong 30 ngày liên tiếp.

---

### ADR-003: pgvector là explicit exclusion (không phải deferred)

**Date**: 2026-03-01
**Status**: accepted

**Context**: Nhiều AI tools gợi ý pgvector cho semantic search. PMTL không cần ngay.

**Decision**: pgvector bị loại khỏi Phase 1 VÀ Phase 2 cho đến khi trigger cụ thể được đáp ứng.

**Consequences**
- Good: giữ schema sạch, không bị kéo sang embedding workflow phức tạp sớm
- Bad: semantic search không có nếu cần trong tương lai gần

**Trigger to reconsider**: Meilisearch stable ≥ 3 tháng AND có use-case semantic search đo được cụ thể.

---

## Cách thêm ADR mới

1. Copy template phía trên vào file này hoặc tạo file riêng `ADR-NNN-title.md` trong cùng folder
2. Ghi `Status: proposed` → review → `accepted` hoặc `rejected`
3. Nếu decision ảnh hưởng launch scope: update `design/01-repo-constitution/DECISIONS.md` trước hoặc trong cùng task
4. Nếu supersede ADR cũ: mark cái cũ là `superseded by ADR-NNN`
