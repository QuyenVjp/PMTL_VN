# Calendar Contracts

## Owner data

- `events`
- `eventAgendaItems`
- `eventSpeakers`
- `eventCtas`
- `lunarEvents`
- `lunarEventOverrides`
- `personalPracticeCalendarReadModel`

## Public routes

- `GET /api/events`
- `GET /api/events/:publicId`
- `GET /api/events/:publicId/agenda`
- `GET /api/lunar-events`
- `GET /api/practice-calendar`

## Admin routes

- `POST /api/admin/calendar/events`
- `PATCH /api/admin/calendar/events/:publicId`
- `POST /api/admin/calendar/events/:publicId/agenda-items`
- `PATCH /api/admin/calendar/events/:publicId/agenda-items/:agendaItemPublicId`
- `POST /api/admin/calendar/events/:publicId/agenda-items/reorder`
- `POST /api/admin/calendar/events/:publicId/speakers`
- `PATCH /api/admin/calendar/events/:publicId/speakers/:speakerPublicId`
- `POST /api/admin/calendar/events/:publicId/ctas`
- `PATCH /api/admin/calendar/events/:publicId/ctas/:ctaPublicId`
- `POST /api/admin/calendar/events/:publicId/reschedule`
- `POST /api/admin/calendar/events/:publicId/cancel`
- `POST /api/admin/calendar/events/:publicId/publish`

## Canonical rules

- event ownership nằm ở calendar
- `organizational events` vẫn là event records thuộc calendar; agenda/speakers/ctas là child records, không phải owner mới
- content chỉ tham chiếu event qua relation như `relatedEvent`
- lunar override chỉ sửa cách lịch được diễn giải/hiển thị, không chuyển ownership sang module khác
- personal practice calendar là `derived read model (mô hình dữ liệu đọc)`, không phải canonical owner của event/lunar data
- `daily practice advisory (thông báo hoặc gói hướng dẫn)` là output read-model của calendar, không phải canonical owner của bài gốc hoặc bản dịch gốc
- event publish/update hoặc calendar refresh signal quan trọng nên đi qua `outbox_events` trước khi xuống notification/rebuild downstream
- request payload, refresh job payload và advisory compose input nên có schema runtime rõ
- event offline phải có `location`; event online phải có `externalLink` hoặc `embedUrl` phù hợp
- hybrid event phải có cả `location` và `externalLink`/`embedUrl`
- event `type = organizational` phải có ít nhất một agenda item trước khi publish
- reschedule/cancel là explicit lifecycle action; không patch mơ hồ qua field tự do rồi kỳ vọng FE tự suy ra trạng thái

## Error expectations

- `400`
  - dữ liệu lịch không hợp lệ hoặc override conflict rõ ràng
  - agenda item time invalid, CTA URL invalid, missing required location/link
- `401`
  - route write cần auth mà thiếu session
- `403`
  - role không đủ để tạo/cập nhật event
- `404`
  - event hoặc override target không tồn tại
- `409`
  - duplicate event slug/publicId hoặc override conflict
- `500`
  - lỗi mapping, append outbox, refresh projection, hoặc downstream notification

## Notes for AI/codegen

- Calendar không copy ritual script vào event record nếu content đã sở hữu dữ liệu đó.
- Nếu có thông báo nhắc sự kiện, notification chỉ đọc context, không sở hữu event data.
- Route `GET /api/practice-calendar` có thể ghép thêm preference/vow context, nhưng vẫn phải coi calendar là owner của read composition.
- Route `GET /api/practice-calendar` được phép trả `advisoryCards`, `sourceRefs`, `recitationRules`, nhưng:
  - `sourceRefs` chỉ nên trỏ sang canonical IDs / public refs, không copy full source-backed text
  - `recitationRules` là rule composition cho calendar read-model; `chantItems` và source-backed ritual text vẫn thuộc content/wisdom owners
- user preference/vow context phải được inject như read inputs đã sanitize từ module owner tương ứng; calendar không trở thành owner của user-state chỉ vì nó compose read-model
- Organizational event timeline phải trả dữ liệu có cấu trúc để FE render timeline/card view, không ép parse rich text.
- Nếu refresh/read-model drift xảy ra, recovery path chuẩn là replay signal hoặc recompute window, không patch tay mơ hồ.
- Hành động reschedule/cancel phải giữ audit + reason rõ để public FE và notification consumer có context đúng.
