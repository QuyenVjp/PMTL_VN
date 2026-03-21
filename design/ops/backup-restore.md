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
  - có naming convention + retention policy rõ
- Media backup:
  - phải biết thư mục persistent nào đang chứa binary
  - phải có chính sách backup riêng cho binary assets
  - phải có sample verify để đo missing/orphan rate sau restore
- Secrets:
  - secret không được lẫn vào DB backup theo kiểu ngẫu nhiên
  - phải biết secret nào cần khôi phục riêng

## Backup artifact policy

- DB backup artifact nên dùng format:
  - `pmtl-db-YYYYMMDD-HHMMSS.sql.gz`
- Media backup artifact nên dùng format:
  - `pmtl-media-YYYYMMDD-HHMMSS.tar.zst`
- Restore manifest / verification artifact nên dùng format:
  - `pmtl-restore-check-YYYYMMDD-HHMMSS.json`

### Retention tối thiểu

- local on VPS:
  - giữ `3` bản DB gần nhất
  - giữ `2` bản media snapshot gần nhất nếu media vẫn ở local disk
- off-site:
  - giữ `7` daily DB backups
  - giữ `2` media snapshots gần nhất

Nếu current phase chưa đạt retention trên, phải ghi rõ `chưa đạt retention target`.

## Phase 1 off-site baseline

- Doc này chưa ép cứng provider duy nhất, nhưng Phase 1 bắt buộc phải có:
  - một off-site destination rõ
  - một người/team biết cách truy xuất
  - một bước verify artifact tồn tại sau backup

Ví dụ chấp nhận được:
- object storage bucket riêng
- secondary VPS / NAS / remote encrypted volume

Ví dụ không chấp nhận:
- “máy ai đó giữ tạm”
- “sẽ tải về sau”

## Restore command contract

Runbook phải chỉ ra command hoặc script tương đương cho:

- tạo DB backup
- lấy bản backup gần nhất
- restore DB vào môi trường cô lập
- boot app sau restore
- verify app health sau restore
- verify media presence / missing media rate

Nếu chưa có command/script tương đương cho đủ 6 nhóm trên, restore vẫn chưa được coi là operational.

### Minimum command shape

Runbook hoặc repo scripts phải ít nhất cover được:

```bash
# 1. create DB backup
./scripts/backup-db.sh

# 2. verify newest DB backup exists
./scripts/verify-backup.sh

# 3. restore DB into isolated target
./scripts/restore-db.sh <backup_file>

# 4. boot app after restore
docker compose up -d api web admin

# 5. verify app health
./scripts/verify-restore.sh

# 6. verify media consistency
./scripts/check-media-consistency.sh <manifest_or_sample_source>
```

Nếu chưa có đủ script thật, phải ghi rõ script nào mới là placeholder.

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
- ghi sample size dùng để đo
- ghi naming pattern / backup artifact được dùng để đối chiếu
- nếu mismatch vượt ngưỡng chấp nhận, drill phải fail

### Media consistency checklist tối thiểu

- sample size:
  - tối thiểu `20` records hoặc `5%` tổng media records, lấy số lớn hơn khi dataset còn nhỏ
- phải kiểm:
  - asset có metadata nhưng thiếu binary
  - binary tồn tại nhưng không còn metadata
  - URL/path resolve sai root volume
  - mime/type mismatch nếu có sample manifest
- phải log:
  - missing count
  - orphan count
  - mismatch rate
  - recovery action attempted

### Default thresholds

- `missing rate > 1%` -> fail
- `orphan rate > 2%` -> fail nếu chưa có cleanup/recovery plan rõ
- bất kỳ missing nào trên asset thuộc public canonical content -> require explicit triage note

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
  - log rõ mismatch rate ở mọi restore drill

## Current evidence status

- Nếu `restore-drill-log.md` chưa có bản ghi `pass` thật, current phase chỉ được coi là `restore policy drafted`, chưa được coi là `restore evidence complete`.
