# Content Contracts

File này không thay `docs/api/contracts.md`.
Mục đích của nó là chốt business contract (hợp đồng dữ liệu/nghiệp vụ) của content module để AI biết:

- route nào là public contract (hợp đồng dữ liệu/nghiệp vụ)
- input nào cần validate
- field nào là canonical
- side-effect nào không được làm đồng bộ

## Owner data

- `posts`
- `hubPages`
- `beginnerGuides`
- `downloads`
- `sutras`
- `sutraVolumes`
- `sutraChapters`
- `sutraGlossary`
- `chantItems`
- `chantRitualTemplates`
- `chantPlans`

## Public read contracts

### Posts
- `GET /api/content/posts`
- `GET /api/content/posts/:slugOrPublicId`
- `GET /api/search?q=<query>&limit=<n>`
- `POST /api/posts/:publicId/view`
- `GET /api/posts/:publicId/comments`

Canonical content source:
- `posts` collection trong Postgres

Search-related source fields:
- `contentPlainText`
- `normalizedSearchText`
- `excerptComputed`

### Guides / Downloads / Hub / Sutras / Chanting
- `GET /api/content/beginner-guides`
- `GET /api/content/downloads`
- `GET /api/content/hub-pages/*`
- `GET /api/content/sutras`
- `GET /api/content/guides`
- `GET /api/content/chant-items`
- `GET /api/content/chant-plans`
- `GET /api/content/chanting/environment-rules`
- `GET /api/content/chanting/environment-rules/:groupKey`

### Little House content surface
- `GET /api/content/hub-pages/ngoi-nha-nho`
- `GET /api/content/little-house/groups/:groupKey`
- `GET /api/content/little-house/guide-map`
- `GET /api/content/little-house/guides`
- `GET /api/content/little-house/guides/:slug`
- `GET /api/content/little-house/case-variants`
- `GET /api/content/little-house/faq`
- `GET /api/content/little-house/downloads`

### Daily practice content surface
- `GET /api/content/hub-pages/kinh-bai-tap`
- `GET /api/content/daily-practice/groups/:groupKey`
- `GET /api/content/daily-practice/guide-map`
- `GET /api/content/daily-practice/guides`
- `GET /api/content/daily-practice/guides/:slug`
- `GET /api/content/daily-practice/scenario-presets`
- `GET /api/content/daily-practice/faq`
- `GET /api/content/daily-practice/downloads`

### Self-cultivation scripture content surface
- `GET /api/content/hub-pages/kinh-van-tu-tu`
- `GET /api/content/self-cultivation/groups/:groupKey`
- `GET /api/content/self-cultivation/guide-map`
- `GET /api/content/self-cultivation/guides`
- `GET /api/content/self-cultivation/guides/:slug`
- `GET /api/content/self-cultivation/faq`
- `GET /api/content/self-cultivation/downloads`

### Life release content surface
- `GET /api/content/hub-pages/phong-sanh`
- `GET /api/content/life-release/guide-map`
- `GET /api/content/life-release/guides`
- `GET /api/content/life-release/guides/:slug`
- `GET /api/content/life-release/ritual-variants`
- `GET /api/content/life-release/faq`
- `GET /api/content/life-release/downloads`

### Media library content surface
- `GET /api/content/hub-pages/thu-vien-phap-mon`
- `GET /api/content/media-library/collections`
- `GET /api/content/media-library/collections/:slug`
- `GET /api/content/media-library/featured`
- `GET /api/media-library/tags`

Ghi chú:
- `beginnerGuides` và `hubPages` nên là public surface chính cho:
  - giới thiệu pháp môn
  - sơ học nhập môn
  - đường dẫn bắt đầu tu học
  - hub điều hướng tài nguyên chính thức
- `chanting/environment-rules` là canon tập trung cho `time/place/environment/body-state` rules; các feature surface không được mỗi nơi giữ một bản wording riêng nếu không có source-backed exception
- với `Ngôi Nhà Nhỏ`, FE không tự ghép 13 bài rời; backend content surface phải trả được grouped IA, guide metadata, case variants, FAQ, download panels
- với `Kinh Bài Tập Hằng Ngày`, FE không được chỉ dựa vào `chantItems` rời; backend phải trả được grouped IA, step guides, scenario presets, FAQ và companion downloads
- với `Kinh Văn Tự Tu`, FE không được chỉ render một bài dài generic; backend phải trả được grouped IA, usage/storage guides, FAQ, download panels và boundary summary với `Kinh Bài Tập` / `Ngôi Nhà Nhỏ`
- với `Phóng Sanh`, FE không được chỉ mở một bài dài generic; backend phải trả được guide map, ritual variants, FAQ, warning blocks và companion downloads

## Write contracts

### Editorial authoring
- canonical write đi qua backend owner module
- admin (`Phụng sự viên`) hoặc super-admin là actor chính
- `_status` và `publishedAt` là cặp field quyết định public delivery

### Little House editorial workspace
- `GET /api/admin/content/little-house/overview`
- `POST /api/admin/content/little-house/guides`
- `PATCH /api/admin/content/little-house/guides/:publicId`
- `POST /api/admin/content/little-house/case-variants`
- `PATCH /api/admin/content/little-house/case-variants/:publicId`
- `POST /api/admin/content/little-house/faq`
- `PATCH /api/admin/content/little-house/faq/:publicId`
- `POST /api/admin/content/little-house/publish`

Quy tắc:
- admin workspace này vẫn đi qua content owner module, không tạo owner mới
- `Ngôi Nhà Nhỏ` guide bắt buộc giữ `sourceReference` và `versionNote` khi thay wording nhạy cảm
- bài có `script_block`, `warning_list`, `step_sequence`, `image_compare`, `faq_block` phải validate typed blocks trước khi publish

### Daily practice editorial workspace
- `GET /api/admin/content/daily-practice/overview`
- `POST /api/admin/content/daily-practice/guides`
- `PATCH /api/admin/content/daily-practice/guides/:publicId`
- `POST /api/admin/content/daily-practice/scenario-presets`
- `PATCH /api/admin/content/daily-practice/scenario-presets/:publicId`
- `POST /api/admin/content/daily-practice/faq`
- `PATCH /api/admin/content/daily-practice/faq/:publicId`
- `POST /api/admin/content/daily-practice/publish`

Quy tắc:
- `daily practice` preset không phải user-state
- preset phải giữ `sourceReference`, `warningList`, `timePlaceRules`
- bài `benh-nang`, `nguoi-cao-tuoi`, `hoa-giai-oan-ket` phải có review note rõ trước khi publish
- ritual support flow như `thắp tâm hương` không được nhét thành một `chantItem` đơn lẻ; nó phải đi qua `chantRitualTemplates` rồi mới được tham chiếu vào daily-practice guide/preset khi cần

### Self-cultivation editorial workspace
- `GET /api/admin/content/self-cultivation/overview`
- `POST /api/admin/content/self-cultivation/guides`
- `PATCH /api/admin/content/self-cultivation/guides/:publicId`
- `POST /api/admin/content/self-cultivation/faq`
- `PATCH /api/admin/content/self-cultivation/faq/:publicId`
- `POST /api/admin/content/self-cultivation/publish`

Quy tắc:
- `Kinh Văn Tự Tu` là content-first reference surface, không phải user-state hay tracker module
- guide bắt buộc nói rõ boundary với `Kinh Bài Tập` và `Ngôi Nhà Nhỏ`
- rule nhạy cảm như cách ghi tên, chấm đỏ, bảo quản, giờ giấc phải có `sourceReference`
- printable / mẫu in đi qua `downloads`, không bury trong rich text
- lời khấn trước khi niệm hoặc flow nhiều bước có thể reference `chantRitualTemplates`

### Chanting / ritual editorial workspace
- `GET /api/content/chant-items`
- `GET /api/content/chant-items/:publicIdOrSlug`
- `GET /api/content/chant-plans`
- `GET /api/content/chant-plans/:publicIdOrSlug`
- `GET /api/admin/content/chant-items`
- `POST /api/admin/content/chant-items`
- `PATCH /api/admin/content/chant-items/:publicId`
- `GET /api/admin/content/chant-ritual-templates`
- `POST /api/admin/content/chant-ritual-templates`
- `PATCH /api/admin/content/chant-ritual-templates/:publicId`
- `GET /api/admin/content/chant-plans`
- `POST /api/admin/content/chant-plans`
- `PATCH /api/admin/content/chant-plans/:publicId`
- `POST /api/admin/content/chanting/publish`
- `GET /api/admin/content/chanting/environment-rules`
- `POST /api/admin/content/chanting/environment-rules`
- `PATCH /api/admin/content/chanting/environment-rules/:publicId`

Quy tắc:
- `chantItems` là owner của từng bài niệm/bài chú/bài kinh đơn lẻ.
- `chantRitualTemplates` là owner của flow nhiều bước có `niệm thầm`, `quán tưởng`, `lạy`, `thỉnh an`, hoặc conditional step count.
- `chantPlans` chỉ là ordered composition; không chôn toàn bộ ritual text trực tiếp trong plan row.
- các flow như `thắp tâm hương` phải được quản như ritual template first-class, rồi mới attach vào plan/guide nếu một trải nghiệm cần nó.
- FE `/niem-kinh` và admin `/admin/noi-dung/niem-kinh` không tự hardcode ritual sequence từ component text nếu owner records chưa có.
- `Kinh Văn Tự Tu` có thể reference `chantItems` và `chantRitualTemplates`, nhưng không tạo owner text mới cho từng bài kinh chỉ vì khác surface điều hướng.
- `time/place/environment` rules phải đi qua owner canon tập trung; không để từng feature lưu một blob FAQ riêng rồi drift nhau.

### Life release editorial workspace
- `GET /api/admin/content/life-release/overview`
- `POST /api/admin/content/life-release/guides`
- `PATCH /api/admin/content/life-release/guides/:publicId`
- `POST /api/admin/content/life-release/ritual-variants`
- `PATCH /api/admin/content/life-release/ritual-variants/:publicId`
- `POST /api/admin/content/life-release/faq`
- `PATCH /api/admin/content/life-release/faq/:publicId`
- `POST /api/admin/content/life-release/publish`

Quy tắc:
- ritual variants phải là first-class editorial records
- species-specific counts và wording khấn nhạy cảm phải có `sourceReference` + `reviewNote`
- warning đạo đức và checklist chuẩn bị phải là typed blocks, không bury trong rich text

### Media library editorial workspace
- `GET /api/admin/content/media-library/overview`
- `POST /api/admin/content/media-library/collections`
- `PATCH /api/admin/content/media-library/collections/:publicId`
- `POST /api/admin/content/media-library/collections/:publicId/items`
- `PATCH /api/admin/content/media-library/collections/:publicId/items/:itemPublicId`
- `POST /api/admin/content/media-library/featured`
- `POST /api/admin/content/media-library/publish`

Quy tắc:
- `media library` là curated public surface, không phải raw media asset manager
- album/playlist phải là first-class records
- item nào ref sang `Calendar` hoặc `Wisdom-QA` phải giữ owner ref rõ
- FE library page không tự ghép từ raw `media_assets`

## Media upload / storage contract

Canonical media lifecycle route ở Phase 1:

- `POST /api/content/media/upload`
- `DELETE /api/content/media/:publicId`

`POST /api/content/media/upload` là signed upload/register primitive giữa `content` và `storage`.
Route này không được trả provider-specific payload thô.
Client chỉ nhận `SignedUploadResponseDto` đủ để upload theo policy PMTL rồi finalize theo owner flow.

`SignedUploadResponseDto` tối thiểu gồm:

- `publicId`
- `uploadUrl`
- `uploadMethod`
- `expiresAt`
- `expectedPublicUrl`
- `allowedMimeTypes[]`
- `maxBytes`

Canonical rules:

- `uploadUrl` là signed URL ngắn hạn; không log, không persist vào client cache, không nhúng analytics.
- `uploadMethod` chỉ dùng:
  - `PUT`
  - `POST`
- `expectedPublicUrl` chỉ là projected public path sau finalize; chưa coi asset là public-live cho tới khi finalize thành công.
- `allowedMimeTypes[]` và `maxBytes` phải echo policy server-side để client không tự đoán.
- local storage và R2/S3-like provider chỉ là adapter detail; route contract phải giữ vocabulary PMTL, không rò `bucket internals`, root path thật, hoặc credential hints.
- delete route phải tôn trọng ownership/policy và không được biến thành raw provider delete passthrough từ UI.
- media-library workspace là curated content surface; signed upload route là storage primitive hỗ trợ biên soạn, không biến content module thành generic asset explorer.

Canonical error codes liên quan:

- `media.file_type_not_allowed`
- `media.file_too_large`
- `media.file_missing`
- `media.delete_forbidden`
- `storage.permission_denied`
- `storage.signed_url_expired`
- `storage.signed_url_invalid`
- `storage.upload_finalize_failed`
- `storage.root_unavailable`
- `storage.provider_unavailable`

### Revalidation
- `POST /api/revalidate`
- chỉ là downstream invalidation contract (hợp đồng dữ liệu/nghiệp vụ)
- không thay cho canonical publish state

## Status / workflow contract (hợp đồng dữ liệu/nghiệp vụ)

- Editorial workflow mặc định:
  - `draft`
  - `published`
- Không giả định có approval state nhiều bước nếu code chưa có.

## Error expectations

- `400`
  - dữ liệu biên soạn không hợp lệ
  - thiếu field bắt buộc để publish
- `401`
  - chưa đăng nhập vào admin/web auth
- `403`
  - không có role admin/super-admin phù hợp
- `404`
  - document hoặc relation không tồn tại
- `409`
  - slug/publicId conflict hoặc state conflict khi publish
- `500`
  - lỗi service (lớp xử lý nghiệp vụ)/hook/append outbox event/search dispatch/revalidation webhook

## Notes for AI/codegen

- Public route đọc content đã map DTO, không trả raw persistence document nếu chưa lọc field.
- Search index chỉ là derived document; canonical body vẫn nằm ở content collections.
- Publish thành công không được phụ thuộc vào việc Meilisearch hay push notification hoàn tất ngay.
- `Kinh Bài Tập Hằng Ngày` public delivery phải trả được `guideMap`, `scenarioPresets`, `faq`, `downloads` theo DTO rõ ràng; không ép FE tự đoán từ `chantItems` và `chantPlans`.
- `Kinh Văn Tự Tu` public delivery phải trả được `guideMap`, `faq`, `downloads` và boundary summary với `Kinh Bài Tập` / `Ngôi Nhà Nhỏ`; không ép FE render như một bài dài duy nhất.
- `Ngôi Nhà Nhỏ` public delivery phải ưu tiên DTO/block đã lọc theo group, slug, block type; không trả raw editor payload chưa sanitize cho FE render trực tiếp.
- `Phóng Sanh` public delivery phải trả được `guideMap`, `ritualVariants`, `faq`, `downloads` và `warning blocks`; journal module chỉ nhận refs/context chứ không giữ full ritual script.
- `chanting/environment-rules` public delivery phải phân nhóm rule rõ (`time`, `place`, `food-body`, `posture-hygiene`, `special-location`, `non-interpretive`); không trả một long-form blob duy nhất.
