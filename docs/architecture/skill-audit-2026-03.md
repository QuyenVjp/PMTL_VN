# Skill Audit 2026-03

## Phạm vi

Audit ban đầu cho taxonomy local ở `.agents/skills` theo mô hình:

- intent
- knowledge
- execution
- verification
- evolution

## Nhận định chính

- Repo đã có taxonomy rõ và một số skill canonical đã có script/references tốt.
- Phần mạnh nhất hiện tại là `knowledge` và `verification` routing.
- Phần thiếu lớn nhất là `evolution`: đa số skill chưa có `gotchas.md` hoặc `changelog.md`.
- Nhiều skill canonical vẫn ở mức "thin guidance" hơn là "operational module" vì thiếu `templates/`, `examples/`, hoặc `verification/`.

## Kết quả audit hiện tại

- Canonical taxonomy audit: `17` skill.
- Skill còn thiếu section bắt buộc: `9`.
- Skill còn thiếu verification asset riêng: `16`.
- Skill còn thiếu `changelog.md`: `16`.
- Skill còn thiếu `gotchas.md`: `16`.

Sau đợt nâng cấp này, nhóm canonical giảm từ `16` skill thiếu section bắt buộc xuống còn `9`.

## Khoảng trống chung cần xử lý dần

1. Chuẩn hóa `SKILL.md` theo cùng bộ section thay vì mỗi skill một kiểu.
2. Bổ sung `verification/` cho skill canonical chưa có pass/fail artifact riêng.
3. Bổ sung `gotchas.md` và `changelog.md` cho các skill canonical còn thiếu.
4. Giữ legacy compatibility skills tách biệt, không nhầm với chuẩn canonical.

## Bổ sung trong đợt này

- Thêm governance skill: `.agents/skills/pmtl-skill-governance/`
- Thêm lệnh audit: `py infra/tools/codex_actions.py skill-audit`
- Thêm shortcut: `just skill-audit`
- Sửa `justfile` sang `pwsh.exe` để recipe `just` chạy được trên môi trường hiện tại
- Thêm playbook kiến trúc cho vòng đời skill: `docs/architecture/skill-system-playbook.md`
- Nâng cấp cấu trúc cho các skill canonical nền:
  - `pmtl-production-baseline`
  - `pmtl-fe-implementation`
  - `pmtl-ui-behavior`
  - `pmtl-ui-style-system`
  - `pmtl-review-web-ui`
  - `pmtl-verify-quality-gate`
  - `pmtl-vn-architecture`

## Đề xuất thứ tự nâng cấp tiếp theo

1. `pmtl-production-baseline`
2. `pmtl-verify-auth-flow`
3. `pmtl-verify-search-sync`
4. `pmtl-scaffold-payload-collection`
5. `pmtl-runbook-docker-dev-recovery`

Lý do: đây là các skill canonical còn thiếu section hoặc asset cốt lõi, nên nâng cấp chúng tiếp sẽ giảm drift rõ nhất cho toàn repo.
