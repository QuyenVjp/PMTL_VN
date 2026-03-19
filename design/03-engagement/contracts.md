# Engagement Contracts

## Owner data

- `sutraBookmarks`
- `sutraReadingProgress`
- `chantPreferences`
- `practiceLogs`
- `practiceSheets`
- `ngoiNhaNhoSheets`

## BFF routes đang có

- `GET /api/practice-log`
- `PUT /api/practice-log`
- `GET /api/sutra-bookmarks`
- `POST /api/sutra-bookmarks`
- `GET /api/sutra-progress`
- `POST /api/sutra-progress`
- `GET /api/chanting/preferences`
- `POST /api/chanting/preferences`
- `GET /api/practice-sheets`
- `POST /api/practice-sheets`
- `GET /api/ngoi-nha-nho/sheets`
- `POST /api/ngoi-nha-nho/sheets`

## Auth contract (hợp đồng dữ liệu/nghiệp vụ)

- engagement là self-owned state
- mọi write contract (hợp đồng dữ liệu/nghiệp vụ) mặc định gắn với user từ Payload auth session
- client không được tự chỉ định owner user khác

## Permission baseline

- `member`
  - được ghi self-state của chính mình
- `admin`
  - chỉ nên có support access có kiểm soát, không trở thành owner flow thường

## Canonical write rules

- practice log canonical record (bản ghi chuẩn gốc) nằm ở `practiceLogs`
- practice sheet canonical record (bản ghi chuẩn gốc) nằm ở `practiceSheets`
- `Ngôi Nhà Nhỏ` canonical record (bản ghi chuẩn gốc) nằm ở `ngoiNhaNhoSheets`
- bookmark canonical record (bản ghi chuẩn gốc) nằm ở `sutraBookmarks`
- reading progress canonical record (bản ghi chuẩn gốc) nằm ở `sutraReadingProgress`
- chant preference canonical record (bản ghi chuẩn gốc) nằm ở `chantPreferences`
- content module chỉ được tham chiếu để lấy `sutra`, `chapter`, `chantItem`, `chantPlan`

## Error expectations

- `400`
  - thiếu `date`, `planSlug`, target chapter, hoặc body fail schema (lược đồ dữ liệu)
- `401`
  - không có auth token/session
- `403`
  - cố ghi self-state cho user khác
- `404`
  - sutra/chapter/plan/item tham chiếu không tồn tại
- `409`
  - state conflict hiếm, ví dụ duplicate record không merge được
- `500`
  - lỗi proxy/CMS/service (lớp xử lý nghiệp vụ)

## Notes for AI/codegen

- Self-state không được ghi ngược vào content canonical collections.
- Upsert practice log có thể dùng semantics `user + practiceDate + plan`.
- `practiceSheets` nên ưu tiên offline-first idempotent sync bằng `clientEventId`.
- `ngoiNhaNhoSheets` nên khóa write khi status đã là `offered`.
- Engagement không được block bởi search sync hay notification dispatch.

