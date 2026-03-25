# Source Priority

File này chốt thứ tự ưu tiên khi compile context, đọc docs, scaffold code, hoặc review implementation.

## Priority Order

1. Repo Constitution
2. Platform Baseline
3. Domain Feature Pack
4. Execution Overlay
5. References and Examples

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

- Snippet không được đè rule.
- Example không được đè owner doc.
- Overlay thắng mọi giả định về implementation status.
- Nếu design nói có nhưng overlay nói `planned`, phải xử lý như `planned`.
- Nếu official docs mới hơn repo docs và tạo ra drift, phải cập nhật repo docs trước hoặc trong cùng task; không được âm thầm bỏ repo policy.

## Practical Reading Order For AI

1. Constitution của repo
2. Baseline của surface đang chạm tới
3. Domain pack liên quan
4. Overlay cho implementation truth
5. References/examples nếu còn thiếu pattern cụ thể

## Anti-Patterns

- đọc ví dụ trước khi đọc luật
- lấy `overview` thay cho owner doc
- lấy starter/template làm source of truth
- giả định `design-ready` nghĩa là `implemented`
