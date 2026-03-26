# Report Community Target (Báo cáo Nội dung Cộng đồng)

## Mục đích (Purpose)
Cho phép thành viên báo cáo bài cộng đồng, comment, hoặc guestbook entry công khai để moderation module tiếp nhận và quyết định xử lý.

## Mô-đun sở hữu (Owner module)
- `moderation` là owner canonical của report lifecycle
- `community` chỉ là module khởi tạo signal/report request

## Các đối tượng thực hiện (Actors)
- Thành viên (`member`)

## Điểm kích hoạt (Trigger)
- `POST /api/community/posts/:publicId/report`
- `POST /api/community/comments/:publicId/report`
- `POST /api/guestbook/:publicId/report`

## Điều kiện tiên quyết (Preconditions)
- Actor có session hợp lệ.
- Target tồn tại và đang hiển thị hoặc có thể truy vết được trong moderation path.
- Payload reason tuân thủ schema report canon.

## Tập hợp dữ liệu đọc (Read Set)
- identity session
- target entity ở community surface
- existing moderation reports để chống duplicate rõ ràng
- abuse / rate-limit state

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Xác thực actor và target.
2. Validate payload lý do báo cáo.
3. Ghi canonical report vào `moderationReports`.
4. Cập nhật summary fields trên target như `reportCount`, `lastReportReason`, `isHidden` nếu threshold/risk policy yêu cầu.
5. Nếu vượt ngưỡng, target có thể bị auto-hide tạm thời.
6. Phát signal admin/moderator notification theo phase-appropriate delivery path.

## Kết quả thành công (Success Result)
- Report được ghi vào moderation module.
- Public target có thể đổi summary visibility nếu threshold bị vượt.

## Các lỗi có thể xảy ra (Errors)
- `400`: payload không hợp lệ.
- `401`: chưa đăng nhập.
- `404`: target không tồn tại.
- `409`: duplicate report.
- `429`: rate-limit / abuse guard.
- `500`: lỗi moderation intake hoặc downstream signal.

## Kiểm toán (Audit)
- Ghi audit action `moderation.report.submit` hoặc equivalent owner action.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- Community không được tự giữ canonical report record.
- Auto-hide là protective state tạm thời, không phải final moderation verdict.
- Summary trên target phải recompute được từ `moderationReports`.
