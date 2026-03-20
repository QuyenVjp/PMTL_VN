# USE_CASE_TEMPLATE

Mẫu này dùng cho mọi file trong `design/*/use-cases/`.
Mục tiêu là để AI, dev mới, hoặc người review nhìn vào là biết write-path chuẩn của chức năng mà không phải suy đoán.

## Quy tắc viết

- Mỗi file chỉ mô tả một hành vi nghiệp vụ rõ ràng.
- Dùng tên file theo động từ + đối tượng, ví dụ:
  - `publish-post.md`
  - `report-comment.md`
  - `save-sutra-progress.md`
- Không trộn nhiều biến thể khác nhau vào cùng một file nếu write-path khác nhau.
- Nếu một flow có nhiều nhánh lớn, tách thành:
  - 1 file use-case (kịch bản sử dụng) chính
  - 1 file state diagram `.mmd`
  - 1 file contracts nếu cần

## Cấu trúc chuẩn

```md
# <Tên use-case (kịch bản sử dụng)>

## Purpose
- Chức năng này giải quyết việc gì.

## owner module (module sở hữu)
- Module sở hữu canonical write-path.

## Actors
- Ai được phép gọi.

## trigger (điểm kích hoạt)
- Bấm nút gì, route nào, job nào, hoặc hook nào khởi chạy.

## preconditions (điều kiện tiên quyết)
- Điều kiện phải đúng trước khi xử lý.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- Zod schema (lược đồ dữ liệu), route params, auth/session requirement, env/runtime dependency nếu có.

## Read set
- Những collection/table/service (lớp xử lý nghiệp vụ) nào được đọc.

## write path (thứ tự ghi dữ liệu chuẩn)
1. Bước ghi canonical record (bản ghi chuẩn gốc) đầu tiên.
2. Bước cập nhật summary field nếu có.
3. Bước append `outbox_events` nếu có side effect quan trọng.
4. Bước dispatcher/execution queue nếu có.

## async (bất đồng bộ) side-effects
- Search sync, notification, email, revalidation, worker (tiến trình xử lý nền) jobs.
- Nếu side effect quan trọng, ghi rõ có đi qua `outbox_events` hay không.

## success result (kết quả thành công)
- API trả gì, UI thấy gì, entity đổi trạng thái gì.

## Errors
- 400: khi nào
- 401: khi nào
- 403: khi nào
- 404: khi nào
- 409: khi nào
- 500: khi nào

## Audit
- Hành động nào phải append audit log.
- Context tối thiểu phải log.

## Idempotency / anti-spam
- Cách chống submit trùng, report trùng, click spam, retry job.

## Performance target
- SLA/SLO liên quan nếu có.

## Notes for AI/codegen
- Những điều tuyệt đối không được đoán sai.
```

## Viết phần `write path (thứ tự ghi dữ liệu chuẩn)` như thế nào

- Bước 1 luôn nói rõ canonical record (bản ghi chuẩn gốc) nằm ở module nào.
- Nếu có summary field, phải nói rõ đó là summary, không phải source of truth (nguồn dữ liệu gốc đáng tin cậy nhất).
- Nếu có queue (hàng đợi xử lý)/job, phải tách rõ:
  - request path chỉ append `outbox_events`
  - dispatcher mới phát execution job
  - worker mới thực thi side effect
- Nếu có outbox, phải nói rõ:
  - event type
  - idempotency key
  - dispatcher/execution step
- Nếu có fallback (đường dự phòng), phải nói rõ fallback (đường dự phòng) được phép ở lớp nào.

## Viết phần `Errors` như thế nào

- Chỉ nêu lỗi có ý nghĩa thật với repo hiện tại.
- Ưu tiên các lỗi nghiệp vụ dễ bị AI làm sai:
  - thiếu quyền
  - entity không tồn tại
  - document chưa publish
  - duplicate submit/report
  - execution queue unavailable nhưng request vẫn tiếp tục nhờ outbox còn pending

## Viết phần `Notes for AI/codegen` như thế nào

- Chốt rõ:
  - collection owner
  - field canonical
  - field summary
  - route publicId hay slug
  - side-effect nào là async-only (chỉ chạy ngầm, bất đồng bộ)
  - recovery path là replay outbox, recompute projection, hay rebuild read model

## Không nên làm

- Không mô tả kiểu "thường sẽ", "có thể là", "đại khái".
- Không gọi Redis, queue (hàng đợi xử lý), search index là source of truth (nguồn dữ liệu gốc đáng tin cậy nhất).
- Không coi event là "đã giao" nếu mới chỉ append outbox hoặc mới chỉ dispatch execution job.
- Không để UI text hoặc DTO public lẫn với raw persistence document nếu chưa map contract (hợp đồng dữ liệu/nghiệp vụ).

