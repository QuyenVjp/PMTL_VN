# BACKUP_RESTORE_RUNBOOK

Runbook này chốt mức tối thiểu để PMTL_VN được gọi là có khả năng backup/restore thật sự.
Mục tiêu không phải đẹp tài liệu, mà là trả lời được câu:

- backup đang ở đâu
- restore làm bằng gì
- pass/fail được tính thế nào

## Scope current phase

- Canonical DB: `Postgres`
- Media runtime: local disk storage adapter
- App surfaces:
  - `apps/web`
  - `apps/api`
  - `apps/admin`

## RPO / RTO target hiện tại

- RPO target:
  - `24 giờ` cho DB backup định kỳ tối thiểu
- RTO target:
  - `60 phút` để restore DB gần nhất lên môi trường sạch và boot lại app ở mức tối thiểu

Nếu team chưa đạt được các mục tiêu này, phải ghi chú rõ là `chưa đạt target`, không được giả vờ đã production-safe.

## Backup minimum contract

- DB backup:
  - có lịch chạy rõ
  - có nơi lưu off-site rõ
  - có kiểm tra file backup tạo thành công
- Media backup:
  - phải biết thư mục persistent nào đang chứa binary
  - phải có chính sách backup riêng cho binary assets
- Secrets:
  - secret không được lẫn vào DB backup theo kiểu ngẫu nhiên
  - phải biết secret nào cần khôi phục riêng

## Restore command contract

Runbook phải chỉ ra command hoặc script tương đương cho:

- tạo DB backup
- lấy bản backup gần nhất
- restore DB vào môi trường cô lập
- boot app sau restore
- verify app health sau restore
- verify media presence / missing media rate

Nếu chưa có command/script tương đương cho đủ 6 nhóm trên, restore vẫn chưa được coi là operational.

## Restore drill cadence

- tối thiểu `1 lần / tháng` với current phase
- mỗi lần drill phải ghi:
  - ngày giờ
  - người chạy
  - backup được dùng
  - thời gian restore
  - lỗi phát sinh
  - cách xử lý
  - kết luận pass/fail

## Restore procedure tối thiểu

### 1. Stop doing damage first

- dừng thay đổi mới nếu đang xử lý incident thật
- không chạy migration mới giữa lúc chưa rõ backup/restore state

### 2. Xác định backup point

- chọn backup gần nhất còn dùng được
- ghi rõ timestamp backup

### 3. Restore DB vào môi trường sạch hoặc cô lập

- không restore đè production khi chưa verify được bản restore
- ưu tiên môi trường cô lập hoặc database thay thế trước

### 4. Boot app với bản restore

- boot `apps/api`
- kiểm tra app boot được
- kiểm tra migration state khớp version app

### 5. Verify health

- `/health/live`
- `/health/ready`
- `/health/startup`
- sample canonical read pass
- auth surface cơ bản pass

### 6. Verify media consistency

- chọn sample media records
- xác minh binary còn tồn tại
- ghi tỷ lệ missing/orphan nếu có

### 7. Close drill

- đánh dấu `pass` hoặc `fail`
- nếu fail phải có follow-up item rõ, không được đóng qua loa

## Pass criteria

Một restore drill chỉ được tính `pass` khi:

- DB restore thành công
- app boot thành công
- health endpoints pass
- sample canonical reads pass
- migration state đúng
- sample media verification pass hoặc đã ghi rõ mismatch rate chấp nhận được

## Fail criteria

Drill phải bị coi là `fail` nếu:

- không restore được DB
- app không boot được sau restore
- migration state lệch
- media mismatch nghiêm trọng mà không có recovery step rõ
- không có log/note đầy đủ về quá trình drill

## Current phase caveat

- local storage không có consistency model đẹp như object storage + durable snapshots
- DB backup và media backup có thể lệch nhau
- vì vậy phải có policy:
  - phát hiện missing media
  - phát hiện orphan metadata
  - degrade UI rõ khi binary mất
