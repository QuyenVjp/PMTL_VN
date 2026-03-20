# Vows & Merit Contracts

## Owner data dự kiến

- `vows`
- `vowProgressEntries`
- `lifeReleaseJournal`

## Self routes

- `GET /api/vows`
- `POST /api/vows`
- `POST /api/vows/:publicId/milestones`
- `GET /api/life-release-journal`
- `POST /api/life-release-journal`
- `GET /api/life-release-journal/:publicId`
- `PATCH /api/life-release-journal/:publicId`

## Permission baseline

- `member`
  - tạo và cập nhật record của chính mình
- `admin`
  - xem hoặc hỗ trợ khi có workflow support rõ ràng
  - được tạo/sửa record thay cho `member` nếu flow là assisted-entry rõ ràng
  - bắt buộc audit đủ `actor` và `owner` cho mọi cross-user action
- `super-admin`
  - chỉ dùng cho audit/support sâu khi thật sự cần

## contract (hợp đồng dữ liệu/nghiệp vụ) rules

- phát nguyện phải có:
  - loại nguyện
  - nội dung rõ
  - thời điểm bắt đầu
  - target hoặc điều kiện hoàn thành nếu là nguyện đo được
- phóng sanh journal phải có:
  - ngày
  - loại vật
  - số lượng hoặc quy mô
  - địa điểm hoặc ghi chú địa điểm
  - source-linked ritual note nếu app gợi ý bài niệm hoặc khai thị liên quan
  - optional `guideContextRef`
  - optional `ritualVariantRef`
  - optional `advisoryContextRef`
  - nếu là assisted entry:
    - `ownerUserId`
    - `actorUserId`
    - lý do hỗ trợ nếu policy yêu cầu
- với các rule thực hành cụ thể như:
  - sau khi phóng sanh niệm `Thánh Vô Lượng Thọ Quyết Định Quang Minh Vương Đà La Ni` `37` biến trong ngày hôm đó
  - app nên lưu ở dạng:
    - `practice rule`
    - `source URL`
    - `source quote original`
    - `bản dịch tiếng Việt`
    - `review status (trạng thái kiểm duyệt)`
  - không hardcode mù nếu chưa có source mapping rõ
- create/update/void record quan trọng và reminder signal liên quan nên đi qua `outbox_events`
- request payload, assisted-entry payload và downstream reminder payload phải có schema runtime rõ

## Admin assisted-entry routes

- `POST /api/admin/vows/assisted-entry/life-release`
- `POST /api/admin/vows/assisted-entry/progress`
- `GET /api/admin/vows/assisted-entry/history`

Quy tắc:
- admin chỉ được tạo assisted entry theo doc `assisted-entry-workflow.md`
- admin không được sửa đè record assisted entry cũ; correction phải tạo entry mới hoặc member tự sửa
- mọi assisted-entry route phải append audit cùng transaction

## Public/private boundary (ranh giới trách nhiệm)

- đây chủ yếu là self-owned state
- chỉ chia sẻ ra community khi user chủ động tạo post riêng
- correction được phép nhưng phải giữ lịch sử audit
- void được phép nhưng không được hard delete âm thầm nếu đã từng tạo vow progress downstream

## Error expectations

- `400`: lời nguyện hoặc journal không hợp lệ
- `401`: chưa đăng nhập
- `409`: conflict ở active vow cùng loại nếu policy không cho duplicate
- `500`: lỗi service (lớp xử lý nghiệp vụ)/notification scheduling
- `500`: lỗi service, append outbox, hoặc reminder scheduling/recompute
- `403`: unauthorized assisted-entry hoặc cố gắng dùng assisted-entry để ghi đè record không hợp lệ

## Notes for AI/codegen

- Đừng biến vow tracking thành todo list thường.
- Đừng biến life release journal thành social feed canonical.
- Đừng nhét full ritual script vào journal; chỉ giữ refs/context cần cho UX.
- Admin scope ở đây nghĩa là `Phụng sự viên`, không tách thêm role vận hành riêng ở current scope.
- Assisted entry là support workflow có kiểm soát, không phải quyền cross-user viết bừa.
- Nếu reminder/progress downstream bị lệch, recovery path phải là replay signal hoặc recompute summary, không sửa tay âm thầm.
- Admin support UI chỉ là operational surface cho `assisted entry`; canonical owner vẫn là module `vows-merit`.

- `403`: Forbidden (Unauthorized attempt at cross-user writes).
- `409`: Conflict (e.g., duplicate active vow of the same type if disallowed).
- `500`: Dispatcher/Queue failure or re-calculation error.

---

## Notes for AI/codegen (Ghi chú cho AI & Sinh mã)

- **Not a Todo List**: Vows are spiritual commitments with lifecycle states; do not treat them as simple tasks.
- **Assisted Entry**: This is a strictly audited support workflow, not a blanket permission to write data across users.
- **Recovery Path**: If progress summaries drift, the canonical fix is to recalculate from the source logs, never to manually patch the summary fields in isolation.
- **Social vs. Private**: Ensure the life release journal remains a private spiritual record unless explicitly shared as a community post.
