# Engagement Contracts (Hợp đồng Mô-đun Tương tác)

## Data ownership (Quyền sở hữu dữ liệu)

- `sutraBookmarks`: personal bookmark state (trạng thái đánh dấu cá nhân)
- `sutraReadingProgress`: reading progress state (trạng thái tiến độ đọc)
- `chantPreferences`: personal practice preferences (cấu hình tu tập cá nhân)
- `practiceLogs`: historical practice log (nhật ký công phu)
- `practiceSheets`: daily practice sheet (bảng công phu hằng ngày)
- `ngoiNhaNhoSheets`: self-owned little-house records (bản ghi Ngôi Nhà Nhỏ cá nhân)

## API / BFF routes (Tuyến đường API)

- `GET/PUT /api/practice-log`
- `GET/POST /api/sutra-bookmarks`
- `GET/POST /api/sutra-progress`
- `GET/POST /api/chanting/preferences`
- `GET/POST /api/practice-sheets`
- `GET/POST /api/ngoi-nha-nho/sheets`

## Auth & permissions (Xác thực & quyền hạn)

- Individual ownership (quyền sở hữu cá nhân): engagement data mặc định là `self-owned`
- Contextual auth (xác thực theo ngữ cảnh): write operation lấy `userId` từ NestJS auth session
- `member`: full read/write trên dữ liệu của chính mình
- `admin`: có thể có support access theo policy, nhưng không trở thành owner của workflow cá nhân

## Canonical write rules (Quy tắc ghi chuẩn gốc)

1. Separation (tách biệt): self-state không được ghi ngược vào content canonical data.
2. References (tham chiếu): engagement chỉ đọc `sutras`, `chantItems`, `chantPlans` qua reference.
3. Immutability (tính bất biến) với một số state:
   - `ngoiNhaNhoSheet` đã `offered` thì không được mở lại progress fields bừa bãi.
4. Idempotency (tính không đổi):
   - `practiceLogs` nên support `clientEventId` hoặc composite key kiểu `user + date + plan`.

## Expected errors (Lỗi dự kiến)

- `400`: field bắt buộc thiếu hoặc schema sai
- `401`: thiếu session hoặc token hết hạn
- `403`: cố đọc/ghi dữ liệu cá nhân của người khác
- `404`: content reference không tồn tại
- `409`: duplicate record hoặc invalid state transition
- `500`: internal service/runtime error

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- No backfilling into content (không được ghi ngược vào content)
- Offline-first sync (đồng bộ ưu tiên offline-first) phải idempotent
- Async side-effects không được chặn canonical self-state write path
