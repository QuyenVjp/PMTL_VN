# Bạch Thoại Audiobook — Text-First Architecture

> Tài liệu này chốt cách đưa nguồn kiểu `xinlingfamen.info/audiobook` vào PMTL_VN theo hướng `text trước, audio sau`.

---

## 1. Thực tế đã xác nhận từ source

Ngày `20/03/2026`, đối chiếu trực tiếp trang:

- `https://xinlingfamen.info/audiobook/?book=1.+白话佛法一&chapter=1`

Pattern thực tế của source:

- có `book selector`
- có nhiều nhóm sách:
  - `白话佛法一` đến `白话佛法十二`
  - `白话佛法视频开示一` đến `四`
  - `广播讲座一`
  - `广播讲座二`
  - `白话佛法广播讲座`
- mỗi sách có danh sách chapter rõ ràng theo thứ tự số
- source cung cấp `full-book MP3`
- chapter mở ra có `title + body text` rất dài, không chỉ audio player

### Kết luận

Đây không phải chỉ là `audio asset library`.
Nó là một `book/chapter learning surface` có:

- metadata cấp sách
- chapter text gốc
- audio đi kèm hoặc track full-book
- trật tự đọc/nghe rất rõ

Vì vậy PMTL_VN phải ingest theo `book -> chapter text -> translation -> audio attachment`, không làm ngược.

---

## 2. Product direction

### P0

- ingest `book metadata`
- ingest `chapter text original`
- dịch `title` và `body` sang tiếng Việt
- publish surface đọc song ngữ hoặc text-first
- audio chỉ là metadata ref đi kèm

### P1

- cắt chapter audio riêng nếu source có
- thuê voice Việt đọc lại sau
- gắn `audioViRef`

---

## 3. Owner split

### `10-wisdom-qa` owns

- `Bạch thoại audiobook books`
- chapter ordering
- chapter text gốc
- bản dịch Việt
- translation review state
- audio refs gắn với chapter hoặc book

### `02-content` may reference

- hub giới thiệu hoặc landing curated

---

## 4. Canonical model

### Book level

- `bookKey`
- `bookKind`
- `titleOriginal`
- `titleVietnamese`
- `sourceUrl`
- `sourceSiteLabel`
- `sourceProvenance`
- `coverImageRef`
- `fullBookAudioUrl`

### Chapter level

- `chapterNumber`
- `titleOriginal`
- `titleVietnamese`
- `bodyOriginal`
- `bodyVietnamese`
- `summaryVietnamese`
- `reviewStatus`
- `sourceUrl`
- optional `audioRef`

### Quan trọng

`wisdom_entries` vẫn là canonical chapter records.
Book/chapter grouping là lớp tổ chức thêm cho `Bạch thoại audiobook`.

---

## 5. Data design decision

Nên thêm 3 bảng:

- `baihua_books`
- `baihua_book_entries`
- `baihua_audio_tracks`

---

## 6. Public routes

- `/bai-hoa/sach-noi`
- `/bai-hoa/sach-noi/[bookSlug]`
- `/bai-hoa/sach-noi/[bookSlug]/chuong/[chapterNumber]`

---

## 7. Text-first translation workflow

1. ingest `bodyOriginal` nguyên văn từ source
2. tạo `bodyVietnamese` draft
3. human review
4. publish text surface
5. sau này mới gắn `audioViRef`

---

## 8. Search and translation guardrails

- search phải index cả:
  - `titleOriginal`
  - `titleVietnamese`
  - `bodyOriginal`
  - `bodyVietnamese`
- alias cho `白话佛法一` và `Bạch thoại Phật pháp 1` phải map về cùng book
- không để AI tự viết lại nội dung doctrinal; translation là draft cần review
