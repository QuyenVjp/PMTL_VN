# Use case: Ingest Baihua audiobook source

## Mục tiêu

Nhập một nguồn `Bạch thoại audiobook` thành:

- `book metadata`
- `chapter text records`
- `audio refs`

để dịch text trước, rồi mới gắn audio tiếng Việt sau.

## Input

- `sourceUrl`
- `bookKind`
- `bookTitleOriginal`
- `chapterList[]`

## Validation

- `sourceUrl` hợp lệ
- `bookKind` thuộc:
  - `baihua_book`
  - `baihua_video_discourse`
  - `radio_lecture`
- chapter numbers không trùng
- chapter title original không rỗng
- body original không rỗng nếu muốn tạo publishable chapter record

## Write path

1. Tạo hoặc update `baihua_books`
2. Với mỗi chapter:
   - tạo hoặc update `wisdom_entries`
   - link vào `baihua_book_entries`
3. Nếu source có audio:
   - tạo hoặc update `baihua_audio_tracks`
4. Đặt `reviewStatus=source_verified` hoặc `translated_draft` theo tình trạng dịch
