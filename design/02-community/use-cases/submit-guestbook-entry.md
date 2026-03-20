# Submit Guestbook Entry (Gửi Tin nhắn Sổ lưu niệm)

## Mục đích (Purpose)
Ghi lại một lời nhắn lưu bút hoặc một câu hỏi từ cộng đồng vào bộ sưu tập `guestbookEntries` với sự phân định ranh giới trách nhiệm (boundary) về phê duyệt và kiểm duyệt một cách rõ ràng.

## Mô-đun sở hữu (Owner module)
- `community` (Cộng đồng)

## Các đối tượng thực hiện (Actors)
- Khách (`guest`)
- Thành viên (`member`)

## Điểm kích hoạt (Trigger)
Trang web gọi yêu cầu đến `POST /api/guestbook/submit`.

## Điều kiện tiên quyết (Preconditions)
- Thân yêu cầu (body) JSON hợp lệ.
- Vượt qua kiểm tra cấu trúc dữ liệu `guestbookSubmitSchema`.
- Chốt chặn yêu cầu (request guard) và chính sách nội dung không chặn hành động này.

## Hợp đồng dữ liệu đầu vào (Input Contract)
- `guestbookSubmitSchema` (Cấu trúc gửi tin nhắn sổ lưu niệm).
- Dữ liệu proxy tuyến đường phải chuyển tiếp mã tương quan (`correlationId`) và dữ liệu đặc tả truy cập (IP forwarding metadata) theo chính sách hiện hành.
- Nếu có tín hiệu xem xét hạ nguồn, gói dữ liệu outbox phải có cấu trúc dữ liệu thực thi (runtime schema) rõ ràng.

## Tập hợp dữ liệu đọc (Read Set)
- Hệ thống chốt chặn yêu cầu (request guard).
- Bộ sưu tập tệp tin lưu niệm (`guestbookEntries`).

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Phân tích nội dung JSON của thân yêu cầu.
2. Xác thực cấu trúc dữ liệu (validate schema).
3. Ghi bản ghi tin nhắn chuẩn gốc (canonical entry) vào bộ sưu tập `guestbookEntries`.
4. Gán tóm tắt trạng thái phê duyệt/kiểm duyệt theo chính sách hiện hành.
5. Thêm sự kiện nhật ký kiểm toán hành động `guestbook.submit`.
6. Nếu cần phê duyệt hoặc có sự chú ý nội bộ, nạp thêm sự kiện outbox để tạo thông báo cho quản trị viên hoặc cấp cao.

## Tác động phụ bất đồng bộ (Async Side-effects)
- Gửi thông báo kiểm duyệt nội bộ.

## Kết quả thành công (Success Result)
- Bản ghi sổ lưu niệm được tạo thành công.
- Tin nhắn hiển thị ngay lập tức hoặc chờ phê duyệt tùy theo chính sách hiện hành.

## Các lỗi có thể xảy ra (Errors)
- `400`: Nội dung JSON hoặc thân yêu cầu không hợp lệ.
- `429`: Bị chặn bởi chốt chặn yêu cầu.
- `500`: Lỗi proxy, API hoặc dịch vụ nghiệp vụ.

## Kiểm toán (Audit)
- Ghi nhật ký hành động `guestbook.submit`.

## Tính không đổi / Chống thư rác (Idempotency / Anti-spam)
- Chốt chặn yêu cầu là lớp bảo vệ chính chống lại thư rác.
- Mã băm địa chỉ IP (hashed IP) hoặc dấu vân tay định danh (fingerprint) chỉ là dữ liệu đặc tả chống lạm dụng, không phải là dữ liệu công khai.
- Việc phát lại hàng đợi outbox không được phép tạo ra các tín hiệu xem xét trùng lặp cho cùng một tin nhắn.

## Mục tiêu hiệu năng (Performance Target)
- Yêu cầu gửi nội dung nên được phản hồi nhanh chóng, không phải chờ quy trình gửi thông báo hoàn tất.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- Tóm tắt phê duyệt sổ lưu niệm (Guestbook approval summary) không thay thế bản ghi kiểm duyệt gốc (moderation source record) nếu tin nhắn đó bị báo cáo vi phạm sau này.
