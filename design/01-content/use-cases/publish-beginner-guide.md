# Publish Beginner Guide (Xuất bản Hướng dẫn Sơ học)

## Mục đích (Purpose)
Xuất bản một bài "Hướng dẫn sơ học" hoặc "Giới thiệu pháp môn" để người mới có thể tìm hiểu như một cửa ngõ chính thức của hệ thống.

## Mô-đun sở hữu (Owner module)
- `content` (Nội dung)

## Các đối tượng thực hiện (Actors)
- Quản trị viên (`admin`)
- Quản trị viên cấp cao (`super-admin`)

## Điểm kích hoạt (Trigger)
Quản trị viên lưu một tài liệu hướng dẫn sơ học (`beginnerGuides`) và chuyển trạng thái sang "Đã xuất bản" (`published`).

## Điều kiện tiên quyết (Preconditions)
- Tài liệu có đầy đủ tiêu đề, định danh ID công khai, nội dung chính và khối điều hướng cơ bản.
- Nếu tài liệu đóng vai trò là "hướng dẫn gia nhập" (entry guide), dữ liệu đặc tả (metadata) phải chỉ rõ vị trí điều hướng tương ứng.

## Tập hợp dữ liệu đọc (Read Set)
- Tài liệu hướng dẫn sơ học (`beginnerGuides`).
- Các mối quan hệ với phương tiện/tải về/trang trung tâm (nếu có).

## Thứ tự ghi dữ liệu chuẩn (Write Path)
1. Xác thực gói dữ liệu của hướng dẫn (Validate guide payload).
2. Chuẩn hóa đường dẫn (`slug`), tóm tắt và các trường tìm kiếm nếu có sử dụng.
3. Ghi bản ghi chuẩn gốc (canonical record) vào bộ sưu tập `beginnerGuides`.
4. Thiết lập trạng thái `_status = published` và thời điểm xuất bản (`publishedAt`).
5. Thêm sự kiện nhật ký kiểm toán hành động `guide.publish`.
6. Đưa yêu cầu đồng bộ tìm kiếm và làm mới trang web vào hàng đợi (nếu cần).

## Tác động phụ bất đồng bộ (Async Side-effects)
- Đồng bộ hóa tìm kiếm (Search sync).
- Làm mới trang web (Revalidation).

## Kết quả thành công (Success Result)
- Người mới có thể truy cập và tìm hiểu hướng dẫn như một bề mặt công khai chính thức để bắt đầu tu học.

## Các lỗi có thể xảy ra (Errors)
- `400`: Hướng dẫn thiếu nội dung hoặc dữ liệu điều hướng cần thiết.
- `401`: Chưa đăng nhập.
- `403`: Không đủ quyền thực hiện.
- `404`: Các mối quan hệ tham chiếu không tồn tại.
- `409`: Xung đột đường dẫn ID công khai.
- `500`: Lỗi dịch vụ nghiệp vụ hoặc hệ thống hạ nguồn.

## Ghi chú cho AI/sinh mã (Notes for AI/codegen)
- `beginnerGuides` không phải là một bài viết nhật ký (blog) thông thường.
- Đối với hướng dẫn gia nhập (entry guide), ưu tiên tính rõ ràng (clarity) hơn là phong cách tối ưu hóa tìm kiếm (SEO) hay quảng bá (campaign).
