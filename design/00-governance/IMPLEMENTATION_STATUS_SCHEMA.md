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

## Forbidden synonyms

Không dùng các từ sau như status canon:

- `done`
- `ready-ish`
- `mostly-ready`
- `nearly implemented`
- `implemented enough`

Nếu cần nuance, giữ status canon và giải thích thêm ở cột/field note riêng.
