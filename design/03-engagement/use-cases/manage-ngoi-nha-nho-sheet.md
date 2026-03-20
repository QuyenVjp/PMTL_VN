# Manage Ngoi Nha Nho Sheet (Quản lý tờ Ngôi Nhà Nhỏ)

## Purpose (Mục đích)
- hỗ trợ người tu quản lý một tờ `Ngôi Nhà Nhỏ` gần với thao tác trên giấy thật
- vẫn giữ canonical record (bản ghi chuẩn gốc) đủ rõ để theo dõi và phục hồi

## Owner module (Mô-đun sở hữu)
- `engagement`

## Actors (Tác nhân)
- `member`

## Trigger (Điểm kích hoạt)
- user mở màn hình `Ngôi Nhà Nhỏ` và tạo/cập nhật một tờ đang thực hành

## Preconditions (Điều kiện tiên quyết)
- user có session hợp lệ
- template chuẩn và 4 loại kinh tham chiếu từ content/reference chuẩn

## Input contract (Hợp đồng dữ liệu/nghiệp vụ)
- payload phải chứa:
  - template loại tờ
  - 4 bộ đếm tương ứng 4 loại kinh
  - trạng thái tờ

## Read set (Dữ liệu cần đọc)
- auth session
- content references cho bài đọc chuẩn
- self-owned `ngoiNhaNhoSheets` của user

## Write path (Thứ tự ghi dữ liệu chuẩn)
1. Resolve user từ session.
2. Nếu chưa có tờ đang làm, tạo canonical record mới cho `ngoiNhaNhoSheets`.
3. Khi user chấm thêm một vòng, cập nhật counter đúng loại kinh.
4. Khi đủ điều kiện hoàn thành, chuyển trạng thái sang `completed`.
5. Nếu user đánh dấu tự tồn hoặc đã hóa, cập nhật state tương ứng.
6. Append audit nhẹ cho các mốc lớn:
   - tạo tờ
   - hoàn thành tờ
   - chuyển sang đã hóa

## Async side-effects (Tác động phụ bất đồng bộ)
- current scope không bắt buộc side-effect nền
- nếu sau này có reminder hoặc backup sync quan trọng, phải append `outbox_events` rồi mới dispatch execution job

## Success result (Kết quả thành công)
- user nhìn thấy đúng tiến độ từng tờ `Ngôi Nhà Nhỏ`

## Errors (Lỗi dự kiến)
- `400`: payload không hợp lệ hoặc counter vượt rule template
- `401`: chưa đăng nhập
- `404`: template tham chiếu không tồn tại
- `409`: state conflict, ví dụ đã hóa rồi mà vẫn tiếp tục chấm
- `500`: lỗi service (lớp xử lý nghiệp vụ)

## Audit (Dấu vết kiểm tra)
- log các mốc lớn
- không cần audit từng lần chấm nhỏ nếu mật độ quá dày

## Idempotency / anti-spam (Chống lặp/chống spam)
- thao tác chấm phải tránh double-submit nếu user bấm liên tiếp do lag

## Performance target (Mục tiêu hiệu năng)
- thao tác chấm phải phản hồi gần như tức thời

## Notes for AI/codegen (Ghi chú cho AI/codegen)
- UI có thể mô phỏng giấy thật, nhưng canonical record vẫn phải là structured data (dữ liệu có cấu trúc)
- không biến flow này thành game tích điểm
- nếu có derived summary hoặc reminder downstream, recovery path phải là recompute/replay từ canonical sheet state
