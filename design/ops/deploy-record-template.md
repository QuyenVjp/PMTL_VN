# DEPLOY_RECORD_TEMPLATE

File này là owner cho `post-deploy evidence record`.
Mục tiêu là chốt chỗ operator ghi lại artifact chain và smoke evidence sau mỗi production deploy.

> Procedure owner: `ops/deploy-runbook.md`
> Gate owner: `baseline/cicd-deploy-gates.md`
> Restore evidence: `ops/restore-drill-log.md`

---

## Rules

- Mỗi production deploy phải có đúng `1` deploy record canon.
- Deploy record không thay deploy runbook; nó là output evidence sau khi chạy runbook.
- Nếu thiếu `commit SHA`, `release artifact`, `migration revision`, hoặc `backup artifact`, record không được coi là rollback-proof.
- Nếu smoke/result bị ghi "pass" nhưng không có timestamp hoặc operator, record không hợp lệ.
- Không ghi secret, raw token, hay SSH command chứa secret vào deploy record.

## Canonical location

- Phase 1 canonical path:
  - `ops/deploy-records/YYYY-MM-DD_HHmmss.md`
- Nếu chưa có automation tạo file, operator vẫn phải tạo record theo template này.
- Sau này CI/CD scaffold có thể serialize cùng shape này sang artifact hoặc issue comment, nhưng file markdown này vẫn là human-readable owner form.

## Template

### Header

- Date:
- Operator:
- Environment:
- Deploy mode:
  - `manual`
  - `pipeline-approved`
- Corresponding incident/change ticket:

### Artifact chain

- Commit SHA:
- Release artifact/image tag:
- Release artifact registry/location:
- Migration revision expected:
- Migration revision applied:
- Backup artifact id:
- Backup artifact timestamp:
- Backup verification result:
  - `pass`
  - `fail`

### Pre-deploy checks

- CI run reference:
- Human gate approver:
- Destructive migration reviewed:
  - `yes`
  - `no`
- Rollback target artifact identified:
- Config/secret change included:
  - `yes`
  - `no`

### Deploy execution

- Deploy start:
- Deploy end:
- App version observed after deploy:
- Services restarted:
- Manual deviations from runbook:

### Smoke evidence

- `/health/live`:
  - `pass`
  - `fail`
- `/health/ready`:
  - `pass`
  - `fail`
- `/health/startup`:
  - `pass`
  - `fail`
- Public homepage load:
  - `pass`
  - `fail`
- Admin homepage load:
  - `pass`
  - `fail`
- Auth-adjacent protected check:
  - `pass`
  - `fail`
- Canonical business read:
  - `pass`
  - `fail`
- Search status / fallback mode:
- Notes:

### Rollback proof status

- Rollback artifact pinned:
  - `yes`
  - `no`
- Rollback command/runbook path verified:
- Rollback rehearsal reference:
- Strong rollback proof:
  - `yes`
  - `no`

### Follow-up

- Issues found:
- Immediate mitigation:
- Next action owner:
- Linked restore drill record:

## Scaffold notes

Khi scaffold CI/CD hoặc release tooling:

1. pipeline outputs phải map thẳng vào `Artifact chain`
2. smoke job outputs phải map vào `Smoke evidence`
3. rollback metadata phải link được sang `restore-drill-log.md`
4. không được tạo một deploy summary khác với field names khác rồi bỏ trôi file này
