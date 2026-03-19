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
  - 1 file use-case chính
  - 1 file state diagram `.mmd`
  - 1 file contracts nếu cần

## Cấu trúc chuẩn

```md
# <Tên use-case>

## Purpose
- Chức năng này giải quyết việc gì.

## Owner module
- Module sở hữu canonical write-path.

## Actors
- Ai được phép gọi.

## Trigger
- Bấm nút gì, route nào, job nào, hoặc hook nào khởi chạy.

## Preconditions
- Điều kiện phải đúng trước khi xử lý.

## Input contract
- Zod schema, route params, auth/session requirement.

## Read set
- Những collection/table/service nào được đọc.

## Write path
1. Bước ghi canonical record đầu tiên.
2. Bước cập nhật summary field nếu có.
3. Bước enqueue async work nếu có.

## Async side-effects
- Search sync, notification, email, revalidation, worker jobs.

## Success result
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

## Viết phần `Write path` như thế nào

- Bước 1 luôn nói rõ canonical record nằm ở module nào.
- Nếu có summary field, phải nói rõ đó là summary, không phải source of truth.
- Nếu có queue/job, phải nói rõ sync path chỉ enqueue hay thực sự gửi ngay.
- Nếu có fallback, phải nói rõ fallback được phép ở lớp nào.

## Viết phần `Errors` như thế nào

- Chỉ nêu lỗi có ý nghĩa thật với repo hiện tại.
- Ưu tiên các lỗi nghiệp vụ dễ bị AI làm sai:
  - thiếu quyền
  - entity không tồn tại
  - document chưa publish
  - duplicate submit/report
  - queue unavailable nhưng request vẫn tiếp tục

## Viết phần `Notes for AI/codegen` như thế nào

- Chốt rõ:
  - collection owner
  - field canonical
  - field summary
  - route publicId hay slug
  - side-effect nào async-only

## Không nên làm

- Không mô tả kiểu "thường sẽ", "có thể là", "đại khái".
- Không gọi Redis, queue, search index là source of truth.
- Không để UI text hoặc DTO public lẫn với raw Payload document nếu chưa map contract.
