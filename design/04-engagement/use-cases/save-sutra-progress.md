# Save Sutra Reading Progress (Lưu tiến độ đọc kinh)

## Purpose (Mục đích)
- lưu tiến độ đọc kinh cá nhân theo user và target `sutra/chapter`

## Owner module (Mô-đun sở hữu)
- `engagement`

## Actors (Tác nhân)
- `member`

## Trigger (Điểm kích hoạt)
- web gọi route lưu tiến độ đọc kinh

## Preconditions (Điều kiện tiên quyết)
- có session hợp lệ
- target `sutra` hoặc `chapter` tồn tại

## Input contract (Hợp đồng dữ liệu/nghiệp vụ)
- API route nhận target hợp lệ và progress value trong giới hạn policy

## Read set (Dữ liệu cần đọc)
- auth session
- `sutraReadingProgress`
- `sutras`
- `sutraChapters`

## Write path (Thứ tự ghi dữ liệu chuẩn)
1. Resolve user từ session.
2. Resolve target `sutra` hoặc `chapter`.
3. Upsert canonical record trong `sutraReadingProgress`.
4. Update derived summary trên chính record nếu schema dùng.
5. Append audit `sutra-progress.upsert`.

## Async side-effects (Tác động phụ bất đồng bộ)
- current scope không có side-effect bắt buộc

## Success result (Kết quả thành công)
- reader mở lại kinh sẽ thấy đúng vị trí/tiến độ cá nhân của mình

## Errors (Lỗi dự kiến)
- `401`: chưa đăng nhập
- `404`: `sutra` hoặc `chapter` không tồn tại
- `500`: lỗi service/proxy

## Audit (Dấu vết kiểm tra)
- log `sutra-progress.upsert`

## Idempotency / anti-spam (Chống lặp/chống spam)
- upsert theo `user + target` để tránh duplicate progress row

## Performance target (Mục tiêu hiệu năng)
- self-state update `< 500ms`

## Notes for AI/codegen (Ghi chú cho AI/codegen)
- tiến độ đọc là user-state (trạng thái cá nhân); content tree chỉ được đọc tham chiếu
