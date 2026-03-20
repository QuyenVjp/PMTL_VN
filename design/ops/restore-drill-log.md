# RESTORE_DRILL_LOG

File này dùng để ghi evidence cho restore drill thật.
Không được ghi "pass" nếu chưa chạy thật.

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

### Issues found

- issue 1:
- issue 2:

### Fixes applied

- fix 1:
- fix 2:

### Follow-up items

- item 1:
- item 2:

## Minimum rule

- Ít nhất phải có `1` drill record thật trước first public launch.
- Nếu record gần nhất là `fail`, hệ không được gọi là `production-safe`.
