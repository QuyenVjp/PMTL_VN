# English-Vietnamese Notation Rules (Quy tắc ghi chú Anh-Việt)

File này chốt cách viết `English (Việt)` trong toàn bộ `design/`.

## Mục tiêu
- giúp người đọc vừa học thuật ngữ kỹ thuật, vừa hiểu nghĩa tiếng Việt ngay tại chỗ
- giữ khả năng map sang code, schema, API contract và tài liệu kỹ thuật bên ngoài
- tránh tình trạng chỗ thì toàn tiếng Anh, chỗ thì toàn tiếng Việt, dẫn tới khó đọc và khó học

## Quy tắc bắt buộc

### 1. Thuật ngữ kỹ thuật quan trọng phải theo mẫu `English (Việt)`

Ví dụ:
- `owner module (mô-đun sở hữu)`
- `canonical record (bản ghi chuẩn gốc)`
- `read model (mô hình dữ liệu đọc)`
- `fallback (đường dự phòng)`
- `async (bất đồng bộ)`

### 2. Đoạn diễn giải dài phải ưu tiên tiếng Việt

Không viết cả đoạn dài toàn tiếng Anh rồi thêm một câu tiếng Việt ngắn phía sau.
Tiếng Anh giữ ở mức:
- tên khái niệm
- tên pattern
- tên runtime component
- tên field/route/identifier

### 3. Tên field, route, enum, code identifier giữ nguyên

Ví dụ:
- `sourceProvenance`
- `reviewStatus`
- `personalPracticeCalendarReadModel`
- `GET /api/posts/search`

Nếu cần, giải thích ngay sau identifier.

### 4. Heading có thể là song ngữ, nhưng không được “dịch máy”

Ưu tiên kiểu:
- `Objectives (Mục tiêu)`
- `Write path (Thứ tự ghi dữ liệu chuẩn)`
- `Current rules (Quy tắc hiện tại)`

Tránh heading nửa Anh nửa Việt khó đọc hoặc dịch cứng.

### 5. DBML note được phép ngắn gọn hơn

Trong `schema.dbml`, `note` có thể:
- giữ tiếng Việt là chính
- chen thuật ngữ tiếng Anh nếu cần

Ví dụ:
- `"Nguồn dữ liệu gốc đáng tin cậy nhất (source of truth)"`
- `"Mô hình đọc được tính ra (derived read model)"`

## Bộ thuật ngữ chuẩn nên dùng lặp lại
- `owner module (mô-đun sở hữu)`
- `canonical (chuẩn gốc)`
- `source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)`
- `read model (mô hình dữ liệu đọc)`
- `derived read model (mô hình đọc được tính ra từ dữ liệu gốc)`
- `contract (hợp đồng dữ liệu/nghiệp vụ)`
- `schema (lược đồ dữ liệu)`
- `service (lớp xử lý nghiệp vụ)`
- `boundary (ranh giới trách nhiệm)`
- `fallback (đường dự phòng)`
- `async (bất đồng bộ)`
- `queue (hàng đợi xử lý)`
- `worker (tiến trình xử lý nền)`
- `control-plane (lớp điều phối hệ thống)`
- `trigger (điểm kích hoạt)`
- `preconditions (điều kiện tiên quyết)`
- `write path (thứ tự ghi dữ liệu chuẩn)`
- `success result (kết quả thành công)`
- `error contract (hợp đồng lỗi)`
- `offline bundle (gói tải ngoại tuyến)`
- `review status (trạng thái kiểm duyệt)`
- `source provenance (nguồn gốc dữ liệu)`

## Scope (Phạm vi áp dụng)
File này áp cho toàn bộ `design/*.md`.

Nó không bắt buộc đổi:
- tên file
- tên enum
- tên table
- code identifier

Nó chỉ chốt cách diễn giải trong tài liệu.
