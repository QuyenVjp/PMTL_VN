# Manage Practice Sheet (Quản lý Bảng công phu)

## Purpose (Mục đích)

- hỗ trợ người dùng quản lý `Practice Sheet (Bảng công phu)` hằng ngày
- giữ flow đơn giản, dễ đọc, phù hợp người lớn tuổi

## owner module (module sở hữu)

- `engagement`

## Actors (Tác nhân)

- `member`

## trigger (điểm kích hoạt)

- user mở màn hình bảng công phu, tạo tờ mới, hoặc cập nhật tờ đang làm

## preconditions (điều kiện tiên quyết)

- user có session hợp lệ
- chant plan / chant item reference đã tồn tại trong Content

## Input contract (Hợp đồng đầu vào)

- payload tối thiểu:
  - `sheetType`
  - `practiceDate`
  - danh sách item
  - `clientEventId` nếu là sync/offline update

## Read set (Tập dữ liệu đọc)

- `sessions`
- chant plan / chant item references
- self-owned `practiceSheets`

## write path (thứ tự ghi dữ liệu chuẩn)

1. Resolve user từ session.
2. Tạo mới hoặc load `practiceSheets` hiện có theo ngày/plan.
3. Upsert item state theo payload.
4. Tính lại `completionPercent`.
5. Nếu đủ điều kiện, chuyển trạng thái sang `completed`.
6. Append audit nhẹ cho create/complete nếu policy yêu cầu.

## async (bất đồng bộ) side-effects

- nếu sau này reminder sync đủ quan trọng, phải append `outbox_events` rồi mới dispatch execution job

## success result (kết quả thành công)

- user thấy đúng bảng công phu đang làm và tiến độ tổng

## Errors (Lỗi dự kiến)

- `400`: payload sai hoặc item reference sai
- `401`: chưa đăng nhập
- `404`: chant item / chant plan không tồn tại
- `409`: conflict do offline sync hoặc duplicate event
- `500`: service/runtime lỗi

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- đây là personal practice sheet, không phải social post
- projection/reminder downstream nếu lệch thì recovery path phải quay về canonical `practiceSheets`
