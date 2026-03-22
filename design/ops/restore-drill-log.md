# RESTORE_DRILL_LOG

File này dùng để ghi evidence cho restore drill thật.
Không được ghi "pass" nếu chưa chạy thật.

## Current status

- Chưa có drill record `pass` nào được ghi trong file này.
- Cho tới khi có ít nhất một bản ghi thật, hệ không được gọi là `production-safe`.

## Template

### Drill record

- Date:
- Operator:
- Environment:
- Backup source:
- Backup timestamp:
- Restore start:
- Restore end:
- Duration:
- Scope:
  - DB
  - media
  - app boot
- Result:
  - `pass`
  - `fail`

### Verification

- `/health/live`:
- `/health/ready`:
- `/health/startup`:
- sample canonical read:
- auth smoke check:
- media sample check:
- migration state check:
- wisdom sample check:
- offline bundle delta check:

### Wisdom / offline verification checklist

- published wisdom sample size:
- QA sample size:
- verified fields checked:
  - `sourceUrl`
  - `sourceProvenance`
  - `reviewStatus`
  - `publishedAt`
- offline bundle checked:
  - `yes`
  - `no`
- offline bundle version before/after restore:
- offline delta route result:
  - `pass`
  - `fail`
- manifest vs DB entry count match:
  - `yes`
  - `no`
- deleted/tombstone sample checked:
  - `yes`
  - `no`

### Media consistency checklist

- media backup artifact used:
- media sample size:
- missing asset count:
- orphan asset count:
- mismatch rate:
- naming/path root verified:
- recovery action attempted:
- threshold exceeded:
  - `yes`
  - `no`

### Issues found

- issue 1:
- issue 2:

Mỗi issue phải ghi rõ:
- artifact hoặc sample liên quan
- `missing` hay `orphan`
- số lượng / tỷ lệ
- recovery path đã thử

### Fixes applied

- fix 1:
- fix 2:

### Follow-up items

- item 1:
- item 2:

## Minimum rule

- Ít nhất phải có `1` drill record thật trước first public launch.
- Nếu record gần nhất là `fail`, hệ không được gọi là `production-safe`.
- Nếu media consistency checklist vượt ngưỡng fail mà vẫn ghi `pass`, record đó không hợp lệ.
- Nếu wisdom/offline verification bị bỏ trống trong khi module này đã public, record đó không được coi là full restore evidence.
