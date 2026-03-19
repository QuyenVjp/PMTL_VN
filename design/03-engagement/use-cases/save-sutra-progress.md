# Save Sutra Reading Progress

## Purpose
- Lưu tiến độ đọc kinh cá nhân theo user và chapter/sutra target.

## owner module (module sở hữu)
- `engagement`

## Actors
- `member`

## trigger (điểm kích hoạt)
- Web gọi route tiến độ đọc kinh.

## preconditions (điều kiện tiên quyết)
- Có session hợp lệ.
- Target sutra/chapter tồn tại.

## Input contract (hợp đồng dữ liệu/nghiệp vụ)
- BFF/CMS route tiến độ đọc kinh hiện có.
- Body phải chứa target hợp lệ và progress value trong giới hạn policy.

## Read set
- auth session
- `sutraReadingProgress`
- `sutras`
- `sutraChapters`

## write path (thứ tự ghi dữ liệu chuẩn)
1. Resolve user từ session.
2. Resolve target `sutra` hoặc `chapter`.
3. Upsert canonical record (bản ghi chuẩn gốc) trong `sutraReadingProgress`.
4. Update derived summary trên chính record progress nếu collection dùng.
5. Append audit `sutra-progress.upsert`.

## async (bất đồng bộ) side-effects
- không có side-effect bắt buộc ở current scope

## success result (kết quả thành công)
- Reader mở lại kinh sẽ thấy đúng vị trí/tiến độ cá nhân của mình.

## Errors
- `401`: chưa đăng nhập.
- `404`: sutra hoặc chapter không tồn tại.
- `500`: lỗi service (lớp xử lý nghiệp vụ)/proxy.

## Audit
- log `sutra-progress.upsert`

## Idempotency / anti-spam
- Upsert theo user + target để tránh duplicate progress row.

## Performance target
- self-state update `< 500ms`.

## Notes for AI/codegen
- Tiến độ đọc là user-state; content tree chỉ được đọc tham chiếu.

