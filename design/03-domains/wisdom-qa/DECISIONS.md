# Wisdom & QA Decisions

## Decision 1. Hỏi đáp phải dựa vào nguồn đã index, không dùng AI sinh nội dung

### Decision

- `Huyền học vấn đáp` là retrieval-first
- kết quả trả về là đoạn/bài đã được index từ nguồn chính thức
- AI chỉ hỗ trợ tìm đúng bài, không tự bịa lời khai thị

## Decision 2. Bạch thoại Phật pháp là learning surface riêng, không chìm trong content chung

### Decision

- tạo module đọc/nghe riêng cho `Bạch thoại Phật pháp`
- content gốc vẫn có thể nằm ở content library, nhưng reading model và UX thuộc module này

## Decision 3. Offline-first là bắt buộc với nội dung học tập trọng yếu

### Decision

- cho phép tải text/audio trọng yếu để xem/nghe offline
- ưu tiên:
  - `Bạch thoại Phật pháp`
  - bài đọc căn bản
  - các bài hỏi đáp hay tra cứu

## Decision 4. Publish/search/offline signal quan trọng đi qua outbox và phải rebuild được từ source đã duyệt

### Decision

- Canonical publish/update của `wisdomEntries`, `qaEntries`, `offlineBundles` commit trước.
- Search sync và offline bundle refresh signal quan trọng đi qua `outbox_events`.
- Search index, bundle manifest, và derived extraction phải rebuild/replay được từ source records đã duyệt.

## Decision 4. Transactional Updates & Rebuildable Projections (Cập nhật qua Outbox & Có thể Tái thiết)

### Decision (Quyết định):

- Writes for Wisdom, QA, and Offline-bundle records must occur first.
- Search indexing, bundle refresh, and publishing signals MUST be dispatched via `outbox_events`.
- Derived data (Search index, bundle manifests, snippets) must be rebuildable from reviewed source records in the case of system failure or drift.

### Rationale (Lý do):

- Maintains the reliability of the system's "Unified Wisdom Repository" and provides a clear audit trail for administrative changes.
