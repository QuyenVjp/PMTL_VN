# English-Vietnamese Notation Rules

File này chốt cách giữ `tiếng Anh chuyên ngành + giải thích tiếng Việt` trong `design/`.

Mục tiêu:

- anh đọc tài liệu hiểu cặn kẽ hơn
- vẫn giữ được tiếng Anh để sau này map sang code, docs kỹ thuật, và schema (lược đồ dữ liệu)
- tránh kiểu tài liệu chỗ thì toàn Anh, chỗ thì toàn Việt

## Nguyên tắc viết

### 1. Nếu là thuật ngữ kỹ thuật quan trọng, viết theo mẫu:

- `owner module (module sở hữu)`
- `canonical record (bản ghi chuẩn gốc)`
- `read model (mô hình dữ liệu đọc)`
- `fallback (đường dự phòng)`
- `async (bất đồng bộ)`

### 2. Nếu là tên field hoặc code identifier

Giữ nguyên identifier, giải thích ở sau nếu cần:

- `sourceProvenance` = tầng nguồn
- `reviewStatus` = trạng thái kiểm duyệt
- `personalPracticeCalendarReadModel` = mô hình đọc lịch tu học cá nhân

### 3. Nếu là heading thuần Việt đã rõ nghĩa

Không cần nhồi tiếng Anh vào mọi chỗ.

Ví dụ:

- `Quy tắc đặc biệt cho bài thực hành ngày đặc biệt`

### 4. Ưu tiên tiếng Việt ở câu diễn giải

Không viết cả đoạn văn dài toàn tiếng Anh nếu có thể diễn đạt rõ bằng tiếng Việt.

## Bộ thuật ngữ chuẩn nên dùng lặp lại

- `owner module (module sở hữu)`
- `canonical (chuẩn gốc)`
- `source of truth (nguồn dữ liệu gốc đáng tin cậy nhất)`
- `read model (mô hình dữ liệu đọc)`
- `derived read model (mô hình đọc được tính ra từ dữ liệu gốc)`
- `contract (hợp đồng dữ liệu hoặc hợp đồng nghiệp vụ)`
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
- `error expectations (kỳ vọng lỗi)`
- `offline bundle (gói tải ngoại tuyến)`
- `review status (trạng thái kiểm duyệt)`
- `source provenance (tầng nguồn gốc dữ liệu)`

## Scope

File này áp cho toàn bộ `design/*.md`.

Nó không bắt buộc sửa tên file, tên enum, hay code identifier.
Nó chỉ chốt cách viết diễn giải trong tài liệu.

