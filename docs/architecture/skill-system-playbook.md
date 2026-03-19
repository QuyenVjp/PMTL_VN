# Skill System Playbook

## Mục tiêu

Tài liệu này chuẩn hóa cách PMTL_VN xây skill như một tài sản vận hành thay vì ghi chú prompt rời rạc.

## Vòng lặp chuẩn

`scope -> skill -> execute -> verify -> evolve`

- `scope`: chốt tác vụ, đầu ra, ranh giới.
- `skill`: chọn hoặc tạo module đúng taxonomy.
- `execute`: dùng references, scripts, templates, workflow.
- `verify`: kiểm tra bằng command, checklist, test, hoặc probe.
- `evolve`: ghi lại gotcha, edge case, và thay đổi hành vi.

## 5 lớp tối thiểu

### 1. Intent

- Skill làm đúng một việc.
- `SKILL.md` phải nêu rõ purpose, use when, expected output.

### 2. Knowledge

- Tham chiếu repo docs, references, examples, conventions.
- Không lặp nguyên xi toàn bộ baseline ở mọi skill; link tới skill nền khi phù hợp.

### 3. Execution

- Ưu tiên `scripts/`, `templates/`, `examples/`, deterministic commands.
- Nếu workflow lặp lại trong repo, cân nhắc đưa vào `infra/tools/codex_actions.py`.

### 4. Verification

- Mọi skill canonical phải có ít nhất một cách kiểm tra pass/fail.
- Verification nên gần với runtime thật nhất có thể.

### 5. Evolution

- Dùng `gotchas.md` để lưu lỗi lặp lại, edge cases, anti-patterns.
- Dùng `changelog.md` để ghi lại khi skill thay đổi hành vi hoặc phạm vi.

## Khi nào tạo skill mới

Chỉ tạo skill mới khi:

- tác vụ lặp lại nhiều lần,
- đầu ra có tiêu chuẩn rõ,
- việc làm sai gây tốn thời gian hoặc rủi ro,
- và skill hiện có không bao phủ rõ ràng.

Nếu chưa đạt các điều kiện trên, ưu tiên mở rộng skill hiện có.

## Cấu trúc folder khuyến nghị

```text
.agents/skills/<skill-name>/
  SKILL.md
  references/
  scripts/
  templates/
  examples/
  verification/
  gotchas.md
  changelog.md
```

Không phải skill nào cũng cần mọi folder, nhưng canonical skill nên có ít nhất:

- `SKILL.md`
- một cơ chế verification
- một cơ chế evolution

## Entry point

- Audit skill: `py infra/tools/codex_actions.py skill-audit`
- Shortcut: `just skill-audit`
- Governance skill: `.agents/skills/pmtl-skill-governance/SKILL.md`
