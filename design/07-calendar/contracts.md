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

- `GET /api/calendar/events`
- `GET /api/calendar/events/:publicId`
- `GET /api/calendar/events/:publicId/agenda`
- `GET /api/calendar/advisory/daily`
- `GET /api/calendar/personal-practice`

## Admin routes

- `GET /api/admin/calendar/lunar-overrides`
- `GET /api/admin/calendar/lunar-overrides/:publicId`
- `POST /api/admin/calendar/lunar-overrides`
- `PATCH /api/admin/calendar/lunar-overrides/:publicId`
- `DELETE /api/admin/calendar/lunar-overrides/:publicId`
- `GET /api/admin/calendar/status`
- `POST /api/admin/calendar/advisory/preview`
- `GET /api/admin/calendar/personal-practice/inspect`
- `POST /api/admin/calendar/personal-practice/refresh`
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
- nếu event có bài pháp hội / khai thị / wisdom content liên quan, `calendar` chỉ giữ relation refs như `relatedWisdomPublicIds` hoặc `sourceRefs`
- transcript/pháp hội discourse text vẫn thuộc `wisdom-qa`, không được copy full text vào event record
- content chỉ tham chiếu event qua relation như `relatedEvent`
- lunar override chỉ sửa cách lịch được diễn giải/hiển thị, không chuyển ownership sang module khác
- `luc_trai_days` là rule family canonical của calendar; source-backed wording và transcript vẫn thuộc `wisdom-qa`
- personal practice calendar là `derived read model (mô hình dữ liệu đọc)`, không phải canonical owner của event/lunar data
- `daily practice advisory (thông báo hoặc gói hướng dẫn)` là output read-model của calendar, không phải canonical owner của bài gốc hoặc bản dịch gốc
- event publish/update hoặc calendar refresh signal quan trọng nên đi qua `outbox_events` trước khi xuống notification/rebuild downstream
- request payload, refresh job payload và advisory compose input nên có schema runtime rõ
- `GET /api/admin/calendar/lunar-overrides` trả lifecycle list cho admin, không bắt FE đoán từ event list
- `POST /api/admin/calendar/advisory/preview` là read-only preview lane cho admin; route này không mutate canonical data
- `GET /api/admin/calendar/personal-practice/inspect` là inspect lane cho read-model freshness/debug, không phải public member read route
- `GET /api/admin/calendar/status` phải trả freshness + projection health + last refresh summary tối thiểu
- `POST /api/admin/calendar/personal-practice/refresh` là deterministic rebuild lane, không phải patch tay read-model
  - request phải chỉ rõ `scope` như `user`, `date-window`, hoặc `full-member-window`
  - concurrent refresh cùng target phải idempotent theo refresh key hoặc coalesce về một running job/business outcome
  - response nên là `accepted` nếu chỉ trigger downstream rebuild, hoặc `single` nếu refresh sync nhỏ và đã hoàn tất thật
  - response metadata tối thiểu nên có `scope`, `window`, `rowsRebuilt`, `rowsPruned`, `sourceVersion`, `completedAt`, `refreshMode`
  - recovery path chuẩn là replay/recompute cùng input window; không mutate thủ công từng advisory row
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
- Route `GET /api/calendar/personal-practice` có thể ghép thêm preference/vow context, nhưng vẫn phải coi calendar là owner của read composition.
- Route `GET /api/calendar/personal-practice` được phép trả `advisoryCards`, `sourceRefs`, `recitationRules`, nhưng:
  - `sourceRefs` chỉ nên trỏ sang canonical IDs / public refs, không copy full source-backed text
  - `recitationRules` là rule composition cho calendar read-model; `chantItems` và source-backed ritual text vẫn thuộc content/wisdom owners
- user preference/vow context phải được inject như read inputs đã sanitize từ module owner tương ứng; calendar không trở thành owner của user-state chỉ vì nó compose read-model
- Organizational event timeline phải trả dữ liệu có cấu trúc để FE render timeline/card view, không ép parse rich text.
- Nếu event detail muốn hiện phần `Bài liên quan / Khai thị liên quan`, response chỉ nên trả lightweight refs:
  - `publicId`
  - `entryType`
  - `title`
  - `excerpt`
  - `sourceUrl?`
  rồi để FE mở canonical wisdom detail khi cần.
- Nếu refresh/read-model drift xảy ra, recovery path chuẩn là replay signal hoặc recompute window, không patch tay mơ hồ.
- Nếu admin preview `luc_trai_days` advisory, response nên trả `dayRole`, `recommendedActions`, `warningProfile`, `fallbackSuggestions`, và `sourceRefs` thay vì 1 blob text duy nhất.
- Hành động reschedule/cancel phải giữ audit + reason rõ để public FE và notification consumer có context đúng.
