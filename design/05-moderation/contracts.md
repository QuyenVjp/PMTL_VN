# Moderation Contracts (Hợp đồng Mô-đun Kiểm duyệt)

Tài liệu này chốt data contract (hợp đồng dữ liệu) và business contract (hợp đồng nghiệp vụ) cho Moderation module (mô-đun Kiểm duyệt).

## Data ownership (Quyền sở hữu dữ liệu)

- `moderationReports`: primary source of truth (nguồn dữ liệu gốc chính) cho report lifecycle và resolution

## Input schemas (Lược đồ đầu vào)

- `commentReportSchema`: lược đồ báo cáo comment
- admin decision payload phải dùng explicit enum cho resolution action

## Public & admin routes (Tuyến đường public & admin)

- `POST /api/comments/:publicId/report`: report editorial comment
- `POST /api/community/posts/:publicId/report`: report community thread
- `POST /api/community/comments/:publicId/report`: report community reply
- `GET /api/moderation/reports`: list moderation reports cho admin
- `POST /api/moderation/reports/:publicId/decision`: submit resolution cho admin

## Canonical write rules (Quy tắc ghi chuẩn gốc)

1. Source of truth (nguồn chuẩn gốc):
   - full lifecycle của violation/report chỉ nằm ở `moderationReports`
2. Target summaries (tóm tắt trên đối tượng đích):
   - article/post/comment chỉ giữ read-only summary fields như:
     - `reportCount`
     - `lastReportReason`
     - `moderationStatus`
     - `approvalStatus`
     - `isHidden`
3. Async alerts (cảnh báo bất đồng bộ):
   - **Phase 2+**: admin alert hoặc user outcome notification quan trọng phải đi qua `outbox_events`. **Phase 1**: sync hoặc fire-and-forget có log.
4. Validation (kiểm tra đầu vào):
   - decision payload và reporter metadata phải có runtime schema rõ

## Decision contract (Hợp đồng ra quyết định)

### Actors (Tác nhân)

- `admin`
- `super-admin`

### Expected statuses (Trạng thái mong đợi)

- `approved`: content an toàn
- `rejected`: report không hợp lệ hoặc bị bỏ qua
- `flagged`: content bị đánh dấu theo dõi
- `hidden`: content bị ẩn khỏi public view

## Expected errors (Lỗi dự kiến)

- `400`: report reason hoặc decision enum không hợp lệ
- `401`: không có session
- `403`: role không đủ
- `404`: report hoặc target entity không tồn tại
- `409`: duplicate pending report hoặc invalid state transition
- `500`: sync error, outbox dispatch fail, hoặc notification error

## Notes for AI/codegen (Ghi chú cho AI và sinh mã)

- `moderationReports` là source of truth duy nhất; target flags chỉ là derived read model
- không expose moderation note nội bộ hoặc reporter identity nhạy cảm ra community/public route
- outcome notification là downstream side-effect, không phải primary decision record
- khi summary bị drift, recovery path chuẩn là recompute từ `moderationReports`
