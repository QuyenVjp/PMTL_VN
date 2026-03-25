# DESIGN_DOC_RESIDUAL_BACKLOG

File này giữ các gap còn lại sau authority audit diện rộng của `design/`.

Mục tiêu:

- không để các việc `nên làm thêm` bị thất lạc trong chat history
- tách rõ `non-blocking cleanup` khỏi `authority drift` và khỏi `implementation truth`
- cho team biết cái nào đáng làm sau, nhưng chưa phải lý do để tự đoán khi code

## Status rule

- Các mục ở file này là `non-blocking unless promoted`.
- Không mục nào ở đây tự động đổi owner doc hay đổi readiness status.
- Khi một mục được làm thật, phải promote nội dung sang owner file tương ứng rồi mới xóa backlog row.
- Nếu trong lúc audit phát hiện `authority conflict`, `route canon mismatch`, hoặc `page/API gap` khiến dev phải tự đoán, mục đó **không được** park vào backlog này; phải sửa ngay ở owner doc trong cùng task.

## Promoted items

Các mục dưới đây **không còn là backlog mở**.
Chúng đã được promote vào owner docs tương ứng để chặn implementation phải tự đoán:

| ID | Topic | Promoted to | Kết luận |
|---|---|---|---|
| `RB-01` | Acceptance criteria cho `implementation-mapping` | `tracking/implementation-mapping.md` | đã có `Family-level acceptance criteria` + rule chống nửa chuỗi artifact |
| `RB-02` | DTO projection safety rules | `tracking/api-dto-shape-plan.md` | đã có `Projection safety baseline` và safe/unsafe projection rules |
| `RB-03` | Pagination contract | `tracking/api-dto-shape-plan.md` | đã có `Pagination / filter / facet baseline`, offset/cursor shape |
| `RB-04` | Filter/facet contract | `tracking/api-dto-shape-plan.md`, `tracking/page-loader-contracts.md` | đã có facet vocabulary + aggregate ownership cho page/search hubs |
| `RB-05` | Admin role narrowing matrix | `tracking/admin-page-api-mapping.md`, `ui/PAGE_INVENTORY.md` | page gate và action narrowing đã được tách rõ |
| `RB-06` | Cross-module invalidation edge cases | `tracking/admin-page-api-mapping.md` | đã có `Cross-module invalidation edge rules` ở owner doc |

## Active backlog items

| ID | Topic | Current gap | Recommended owner | Why backlog, not blocker |
|---|---|---|---|---|
| `RB-07` | Wording refresh khi Phase 1 chuyển sang runtime thật | Một số từ như `safe scaffold window` sẽ cũ khi repo đi vào code/runtime thật | `tracking/implementation-mapping.md`, `tracking/coding-readiness.md` | Việc đổi wording chỉ hợp lý khi trạng thái repo thay đổi |

## Explicitly not included here

- authority conflicts giữa owner docs
- route canon mismatch
- page/API mapping gap buộc dev phải đoán
- implementation truth mismatch với runtime

Các lỗi loại đó không được đẩy sang backlog này; phải sửa ngay trong owner docs.
