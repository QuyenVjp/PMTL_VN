# Source Priority

File này chốt thứ tự ưu tiên khi compile context, đọc docs, scaffold code, hoặc review implementation.

## Priority Order

1. Governance
2. Repo Constitution
3. Platform Baseline
4. Domain Feature Pack
5. Execution Overlay
6. References and Examples

Rule:

- `00-governance` không thay owner policy/content của constitution hoặc baseline, nhưng nó thắng khi câu hỏi là:
  - file nào có quyền thắng file nào
  - status nào được hiểu là implemented hay chưa
  - cách phân loại doc
  - cách giải quyết conflict và naming/layout

## Definitions

### Repo Constitution

Là lớp chốt:

- current direction
- authority rules
- package boundaries
- anti-goals
- product-level laws

### Platform Baseline

Là lớp chốt:

- version matrix
- framework/runtime policy
- security/runtime defaults
- edge/data/deploy/optional-scale rules

### Domain Feature Pack

Là lớp chốt:

- domain boundaries
- module responsibilities
- route groups
- invariants
- write-path behavior

### Execution Overlay

Là lớp chốt:

- cái gì mới là implemented truth
- scaffold order
- coding readiness
- DTO/route/schema mappings

### References and Examples

Là lớp hỗ trợ:

- external docs
- starter references
- sample payloads
- examples

Nó giúp diễn giải, không có quyền override repo rules.

## Hard Rules

- Governance thắng mọi tranh cãi về taxonomy, status semantics, source priority, conflict resolution, và canonical layout.
- Snippet không được đè rule.
- Example không được đè owner doc.
- Overlay thắng mọi giả định về implementation status.
- Nếu design nói có nhưng overlay nói `planned`, phải xử lý như `planned`.
- Nếu official docs mới hơn repo docs và tạo ra drift, phải cập nhật repo docs trước hoặc trong cùng task; không được âm thầm bỏ repo policy.
- Version-matching doc hoặc matrix của repo thắng model memory và thắng “latest by vibe”.

## Practical Reading Order For AI

1. Governance của repo
2. Constitution của repo
3. Baseline của surface đang chạm tới
4. Domain pack liên quan
5. Overlay cho implementation truth
6. References/examples nếu còn thiếu pattern cụ thể

## Anti-Patterns

- đọc ví dụ trước khi đọc luật
- lấy `overview` thay cho owner doc
- lấy starter/template làm source of truth
- giả định `design-ready` nghĩa là `implemented`
