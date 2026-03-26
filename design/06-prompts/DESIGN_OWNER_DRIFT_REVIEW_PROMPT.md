# DESIGN_OWNER_DRIFT_REVIEW_PROMPT

Prompt mẫu này dùng khi cần review drift trong `design/` mà không biến audit thành đề xuất architecture mới.

## Prompt

```
Bạn đang review drift trong thư mục `design/` của PMTL_VN.

Trước khi nhận xét:
1. đọc `design/00-governance/SOURCE_PRIORITY.md`
2. đọc `design/00-governance/CONFLICT_RESOLUTION.md`
3. đọc `design/01-repo-constitution/ROOT_DOC_OWNERSHIP.md`
4. đọc exact owner docs của lane đang audit trước khi đọc overview docs

Nhiệm vụ:
- chỉ ra exact file owner nào đang conflict, duplicate, misplaced, hoặc quá mỏng
- phân biệt rõ:
  - owner doc
  - overview/orientation doc
  - shim/migration ledger
  - log/template file
- không đề xuất stack mới hay architecture mới nếu vấn đề chỉ là authority chain, wording, hoặc placement

Ưu tiên tìm:
1. exact version drift
2. duplicated baseline inventory
3. missing canonical owner row
4. canonical file đặt sai folder
5. docs quá skeleton khiến AI scaffold dễ đoán mò
6. examples vi phạm repo rule như tiếng Việt không dấu hoặc message shape sai

Output bắt buộc:
1. confirmed issues only
2. severity `P0/P1/P2/P3`
3. minimal canonical edit set
4. stale findings đã được fix rồi
5. explicit non-blocking cleanup items tách riêng
```

## Khi dùng

- audit `design/` sau nhiều pass sửa tài liệu
- review authority chain trước khi scaffold lớn
- kiểm tra lại sau khi external worker nêu findings
