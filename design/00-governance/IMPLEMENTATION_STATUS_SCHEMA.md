# Implementation Status Schema

File này chốt ngôn ngữ trạng thái để tách bạch:

- đã thiết kế
- đã scaffold
- đã implement
- đã verify

## Canonical Statuses

- `planned`
- `design_ready`
- `scaffolded`
- `partial`
- `implemented`
- `verified`
- `deferred`
- `excluded`

## Practical Interpretation

- `design_ready` != `scaffolded`
- `scaffolded` != `implemented`
- `implemented` != `verified`

## Overlay Requirement

Mọi implementation-truth doc nên ưu tiên biểu diễn trạng thái ở dạng machine-readable hoặc bảng nhất quán.
