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
- `PATCH /api/admin/calendar/events/:id`
- `POST /api/admin/calendar/events/:id/agenda-items`
- `PATCH /api/admin/calendar/events/:id/agenda-items/:agendaItemId`
- `POST /api/admin/calendar/events/:id/agenda-items/reorder`
- `POST /api/admin/calendar/events/:id/speakers`
- `PATCH /api/admin/calendar/events/:id/speakers/:speakerId`
- `POST /api/admin/calendar/events/:id/ctas`
- `PATCH /api/admin/calendar/events/:id/ctas/:ctaId`
- `POST /api/admin/calendar/events/:id/reschedule`
- `POST /api/admin/calendar/events/:id/cancel`
- `POST /api/admin/calendar/events/:id/publish`

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
- Route `GET /api/practice-calendar` được phép trả `advisoryCards`, `sourceRefs`, `recitationRules`, nhưng các source-backed text gốc vẫn do `09-wisdom-qa` sở hữu.
- Organizational event timeline phải trả dữ liệu có cấu trúc để FE render timeline/card view, không ép parse rich text.
- Nếu refresh/read-model drift xảy ra, recovery path chuẩn là replay signal hoặc recompute window, không patch tay mơ hồ.
- Hành động reschedule/cancel phải giữ audit + reason rõ để public FE và notification consumer có context đúng.

- `409`: Conflict (Duplicate slug/PublicID or override collision).
- `500`: Projection refresh failure or outbox dispatch error.

---

## Notes for AI/codegen (Ghi chú for AI & Sinh mã)

- **Referential Integrity**: Do not duplicate ritual scripts into event records; link to the Content module via ID.
- **Consumer Role**: Use the Notification module only for delivery; it should consume calendar context, not own it.
- **Read Model Composition**: The `GET /api/practice-calendar` endpoint aggregates `advisoryCards`, `sourceRefs` (from Wisdom), and `recitationRules`, but it must remain the authoritative service for this combined result.
- **Recovery Path**: If the Read Model drifts from source data, the standard fix is to **Recalculate the Window** or **Replay the Signal**, never manual point-edits to the read model.
- **Instructional Accuracy**: Any teaching snippets in the advisory must correspond to an approved source in the Wisdom module (`09-wisdom-qa`).
