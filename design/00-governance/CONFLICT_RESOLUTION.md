# Conflict Resolution

File này chốt cách xử lý khi docs mâu thuẫn nhau.

## Resolution Order

1. Higher source priority wins.
2. Governance wins for taxonomy, status semantics, source priority, and conflict mechanics.
3. `required` beats `advisory`.
4. `active` beats `draft`.
5. Phase-matching doc beats generic `all` doc when both are valid.
6. Execution Overlay wins for implementation/runtime truth.
7. Canonical owner beats summary/reference file.
8. References/examples never beat repo rules.

## Canonical Questions

### Nếu `README` khác `DECISIONS`?

- `DECISIONS` thắng

### Nếu `overview/*` khác `tracking/*`?

- `tracking/*` thắng cho implementation truth
- owner doc domain thắng cho policy domain

### Nếu sample/example khác contracts?

- contracts thắng

### Nếu official docs mới hơn baseline repo?

- repo phải được cập nhật rồi mới cho phép implementation bám theo

## Mandatory Escalation Cases

Phải dừng và sửa docs trước khi scaffold nếu gặp:

- owner doc mâu thuẫn trực tiếp với `DECISIONS`
- overlay nói `planned` nhưng scaffold backlog đã coi như `implemented`
- route inventory không khớp page contracts hoặc admin mapping
- Prisma schema plan không khớp domain schema owners
- optional-scale doc bị dùng như phase_1 default

## Prohibited Shortcuts

- lấy file mới sửa gần đây nhất làm đúng hơn
- lấy file dài hơn làm authoritative hơn
- lấy external reference làm cớ override repo direction
- suy ra implementation từ architecture prose
- suy `installed truth` từ design pin khi repo package/runtime artifact chưa tồn tại
