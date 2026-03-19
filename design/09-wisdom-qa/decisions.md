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
