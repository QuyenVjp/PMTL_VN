# Publish Post (Xuất bản Bài viết)

## Mục đích (Purpose)
Xuất bản một bài viết biên tập (editorial post) để trang web công khai có thể hiển thị, bộ nhớ đệm (cache) được làm mới chính xác và dữ liệu tìm kiếm (search) được cập nhật theo cơ chế đang được kích hoạt ở phase hiện tại.

## Mô-đun sở hữu (Owner module)
- `content` (Nội dung)

## Các đối tượng thực hiện (Actors)
- Quản trị viên (`admin`)
- Quản trị viên cấp cao (`super-admin`)

## Điểm kích hoạt (Trigger)
Quản trị viên chuyển trạng thái (`status`) của bài viết (`posts`) sang "Đã xuất bản" (`published`) thông qua giao diện quản trị hoặc API.

## Điều kiện tiên quyết (Preconditions)
- Đối tượng thực hiện có vai trò biên soạn hợp lệ.
- Tài liệu bài viết (`posts`) tồn tại trong hệ thống.
- Tài liệu có đầy đủ các trường dữ liệu bắt buộc để xuất bản.
- Các định danh công khai như ID công khai (`publicId`) và đường dẫn thân thiện (`slug`) có thể giải quyết (resolve) hợp lệ.

## Hợp đồng dữ liệu đầu vào (Input Contract)
- Lệnh ghi dữ liệu từ mô-đun chủ sở hữu ở backend cho bộ sưu tập `posts`.
- Các quy tắc nghiệp vụ và kiểm tra dữ liệu đi qua hàm `preparePostData()` và `ensurePostCanPublish()` trong dịch vụ bài viết (`post service`).

## Tập hợp dữ liệu đọc (Read Set)
- Tài liệu bài viết (`posts`).
- Các mối quan hệ phân loại (nếu có danh mục/thẻ).
- Các mối quan hệ phương tiện (nếu có ảnh bìa/thư viện ảnh).
- Mối quan hệ sự kiện (nếu có sự kiện liên quan - `relatedEvent`).

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Chuẩn hóa `slug`, tóm tắt tự động (`excerptComputed`), văn bản thô (`contentPlainText`) và văn bản tìm kiếm (`normalizedSearchText`).
2. Xác thực tài liệu đủ điều kiện để xuất bản.
3. Ghi bản ghi chuẩn gốc (canonical record) vào bộ sưu tập `posts` với trạng thái `_status = published`.
4. Thiết lập thời điểm xuất bản (`publishedAt`) nếu chưa có.
5. Thêm sự kiện nhật ký kiểm toán (audit event) cho hành động `post.publish`.
6. **Phase 1**: gọi search sync/revalidation theo đường sync hoặc best-effort có log intent + log outcome + recovery path rõ; không giả định `outbox_events` đã bật.
7. **Phase 2+**: nếu `outbox`/dispatcher đã được activate cho search, revalidation, hoặc notification, append `outbox_events` trong cùng canonical transaction rồi để dispatcher xử lý downstream work.

## Tác động phụ bất đồng bộ (Async Side-effects)
- **Phase 1**: search sync/revalidation có thể chạy sync hoặc best-effort với log + manual recovery path.
- **Phase 2+**: search sync, revalidation, và notification quan trọng đi qua `outbox_events`.
- Quy trình phục hồi chuẩn:
  - **Phase 1**: re-run revalidation hoặc reindex từ canonical `posts`.
  - **Phase 2+**: replay outbox hoặc full reindex từ canonical `posts`.

## Kết quả thành công (Success Result)
- Tài liệu trở thành nội dung công khai hợp lệ.
- Đường dẫn web có thể ánh xạ tài liệu sang đối tượng dữ liệu công khai (public DTO).
- Chỉ mục tìm kiếm sẽ được cập nhật theo cơ chế nhất quán sau cùng (eventual consistency).

## Các lỗi có thể xảy ra (Errors)
- `400`: Thiếu trường bắt buộc hoặc dữ liệu không hợp lệ để xuất bản.
- `401`: Chưa đăng nhập.
- `403`: Không có quyền biên tập bài viết.
- `404`: Tài liệu hoặc các mối quan hệ quan trọng không tồn tại.
- `409`: Xung đột đường dẫn (`slug`)/ID công khai hoặc trạng thái xuất bản không hợp lệ.
- `500`: Lỗi dịch vụ nghiệp vụ, lỗi sync/revalidation ở phase 1, hoặc lỗi append outbox/điều phối hạ nguồn ở phase 2+.

## Kiểm toán (Audit)
- Bắt buộc ghi nhật ký hành động `post.publish`.
- Thông tin tối thiểu: Người thực hiện, ID bài viết, ID công khai, đường dẫn, các trường thay đổi, mã tương quan (`correlationId`).

## Tính không đổi / Chống spam (Idempotency / Anti-spam)
- Việc xuất bản lại một tài liệu đã ở trạng thái `published` không được tạo thêm bản ghi chuẩn gốc trùng lặp.
- Quy trình đồng bộ tìm kiếm hạ nguồn phải chấp nhận việc thực hiện lại (retry) dựa trên tài liệu hiện tại.

## Mục tiêu hiệu năng (Performance Target)
- Yêu cầu xuất bản không phải chờ quy trình lập chỉ mục tìm kiếm hoàn tất.
- Phản hồi nên hoàn tất trong vòng dưới 800ms cho canonical write và trigger downstream tối thiểu của phase hiện tại.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- `posts` mới là chủ sở hữu chuẩn gốc; chỉ mục tìm kiếm không phải là nguồn dữ liệu gốc.
- `publishedAt` là mốc thời gian chuẩn phục vụ việc phân phối công khai.
- Tuyệt đối không nhét việc gửi thông báo đẩy (push) hoặc email đồng bộ vào luồng xuất bản chính.
