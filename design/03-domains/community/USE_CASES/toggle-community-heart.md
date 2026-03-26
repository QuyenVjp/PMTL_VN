# Toggle Community Heart (Bật / Tắt Tim Nội dung Cộng đồng)

## Mục đích (Purpose)
Cho phép thành viên bày tỏ sự ủng hộ nhẹ bằng `tim` trên bài cộng đồng hoặc comment đủ điều kiện hiển thị, mà không biến community thành reputation engine.

## Mô-đun sở hữu (Owner module)
- `community` (Cộng đồng)

## Các đối tượng thực hiện (Actors)
- Thành viên (`member`)

## Điểm kích hoạt (Trigger)
- `POST /api/community/posts/:publicId/heart`
- `DELETE /api/community/posts/:publicId/heart`
- `POST /api/community/comments/:publicId/heart`
- `DELETE /api/community/comments/:publicId/heart`

## Điều kiện tiên quyết (Preconditions)
- Actor có session hợp lệ.
- Target tồn tại và đang ở trạng thái hiển thị hợp lệ.
- Actor không bị block hoặc chặn bởi abuse/rate-limit policy.

## Tập hợp dữ liệu đọc (Read Set)
- identity session
- target community entity hoặc comment entity
- existing heart edge / dedupe state nếu có
- request guard / anti-abuse state

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Xác thực actor và target.
2. Kiểm tra policy chống spam / toggle flood.
3. Tạo hoặc gỡ heart edge theo target + actor.
4. Cập nhật `heartCount` summary hoặc queue recompute nếu summary là read model.
5. Ghi audit action `community.heart.toggle` khi policy yêu cầu.

## Kết quả thành công (Success Result)
- Target phản ánh trạng thái `viewerHasHearted`.
- `heartCount` summary được cập nhật hoặc được lên lịch recompute.

## Các lỗi có thể xảy ra (Errors)
- `401`: chưa đăng nhập.
- `403`: actor bị block hoặc target không cho tương tác.
- `404`: target không tồn tại hoặc không còn public-visible.
- `409`: conflict edge bất thường.
- `429`: abuse guard chặn.

## Kiểm toán (Audit)
- Có thể ghi audit nhẹ cho abuse-sensitive targets hoặc moderator diagnostics.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- `Tim` là appreciation signal nhẹ, không phải điểm thưởng hay reputation score.
- Không được sinh leaderboard, badge, hay public ranking từ `heartCount`.
- Heart toggle phải idempotent theo actor + target.
