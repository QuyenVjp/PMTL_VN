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
- `chantPlans`

## Public read contracts

### Posts
- `GET /api/posts`
- `GET /api/posts/:slugOrPublicId`
- `GET /api/posts/search?q=<query>&limit=<n>`
- `POST /api/posts/:publicId/view`
- `GET /api/posts/:publicId/comments`

Canonical content source:
- `posts` collection trong Postgres

Search-related source fields:
- `contentPlainText`
- `normalizedSearchText`
- `excerptComputed`

### Guides / Downloads / Hub / Sutras / Chanting
- `GET /api/guides`
- `GET /api/downloads`
- `GET /api/hub-pages`
- `GET /api/sutras`
- `GET /api/chant-items`
- `GET /api/chant-plans`

### Little House content surface
- `GET /api/hub-pages/ngoi-nha-nho`
- `GET /api/little-house/guide-map`
- `GET /api/little-house/guides`
- `GET /api/little-house/guides/:slug`
- `GET /api/little-house/case-variants`
- `GET /api/little-house/faq`
- `GET /api/little-house/downloads`

### Daily practice content surface
- `GET /api/hub-pages/kinh-bai-tap`
- `GET /api/daily-practice/guide-map`
- `GET /api/daily-practice/guides`
- `GET /api/daily-practice/guides/:slug`
- `GET /api/daily-practice/scenario-presets`
- `GET /api/daily-practice/faq`
- `GET /api/daily-practice/downloads`

### Life release content surface
- `GET /api/hub-pages/phong-sanh`
- `GET /api/life-release/guide-map`
- `GET /api/life-release/guides`
- `GET /api/life-release/guides/:slug`
- `GET /api/life-release/ritual-variants`
- `GET /api/life-release/faq`
- `GET /api/life-release/downloads`

### Media library content surface
- `GET /api/hub-pages/thu-vien-phap-mon`
- `GET /api/media-library/collections`
- `GET /api/media-library/collections/:slug`
- `GET /api/media-library/featured`
- `GET /api/media-library/tags`

Ghi chú:
- `beginnerGuides` và `hubPages` nên là public surface chính cho:
  - giới thiệu pháp môn
  - sơ học nhập môn
  - đường dẫn bắt đầu tu học
  - hub điều hướng tài nguyên chính thức
- với `Ngôi Nhà Nhỏ`, FE không tự ghép 13 bài rời; backend content surface phải trả được grouped IA, guide metadata, case variants, FAQ, download panels
- với `Kinh Bài Tập Hằng Ngày`, FE không được chỉ dựa vào `chantItems` rời; backend phải trả được grouped IA, step guides, scenario presets, FAQ và companion downloads
- với `Phóng Sanh`, FE không được chỉ mở một bài dài generic; backend phải trả được guide map, ritual variants, FAQ, warning blocks và companion downloads

## Write contracts

### Editorial authoring
- canonical write đi qua backend owner module
- admin (`Phụng sự viên`) hoặc super-admin là actor chính
- `_status` và `publishedAt` là cặp field quyết định public delivery

### Little House editorial workspace
- `GET /api/admin/content/little-house/overview`
- `POST /api/admin/content/little-house/guides`
- `PATCH /api/admin/content/little-house/guides/:id`
- `POST /api/admin/content/little-house/case-variants`
- `PATCH /api/admin/content/little-house/case-variants/:id`
- `POST /api/admin/content/little-house/faq`
- `PATCH /api/admin/content/little-house/faq/:id`
- `POST /api/admin/content/little-house/publish`

Quy tắc:
- admin workspace này vẫn đi qua content owner module, không tạo owner mới
- `Ngôi Nhà Nhỏ` guide bắt buộc giữ `sourceReference` và `versionNote` khi thay wording nhạy cảm
- bài có `script_block`, `warning_list`, `step_sequence`, `image_compare`, `faq_block` phải validate typed blocks trước khi publish

### Daily practice editorial workspace
- `GET /api/admin/content/daily-practice/overview`
- `POST /api/admin/content/daily-practice/guides`
- `PATCH /api/admin/content/daily-practice/guides/:id`
- `POST /api/admin/content/daily-practice/scenario-presets`
- `PATCH /api/admin/content/daily-practice/scenario-presets/:id`
- `POST /api/admin/content/daily-practice/faq`
- `PATCH /api/admin/content/daily-practice/faq/:id`
- `POST /api/admin/content/daily-practice/publish`

Quy tắc:
- `daily practice` preset không phải user-state
- preset phải giữ `sourceReference`, `warningList`, `timePlaceRules`
- bài `benh-nang`, `nguoi-cao-tuoi`, `hoa-giai-oan-ket` phải có review note rõ trước khi publish

### Life release editorial workspace
- `GET /api/admin/content/life-release/overview`
- `POST /api/admin/content/life-release/guides`
- `PATCH /api/admin/content/life-release/guides/:id`
- `POST /api/admin/content/life-release/ritual-variants`
- `PATCH /api/admin/content/life-release/ritual-variants/:id`
- `POST /api/admin/content/life-release/faq`
- `PATCH /api/admin/content/life-release/faq/:id`
- `POST /api/admin/content/life-release/publish`

Quy tắc:
- ritual variants phải là first-class editorial records
- species-specific counts và wording khấn nhạy cảm phải có `sourceReference` + `reviewNote`
- warning đạo đức và checklist chuẩn bị phải là typed blocks, không bury trong rich text

### Media library editorial workspace
- `GET /api/admin/content/media-library/overview`
- `POST /api/admin/content/media-library/collections`
- `PATCH /api/admin/content/media-library/collections/:id`
- `POST /api/admin/content/media-library/collections/:id/items`
- `PATCH /api/admin/content/media-library/collections/:id/items/:itemId`
- `POST /api/admin/content/media-library/featured`
- `POST /api/admin/content/media-library/publish`

Quy tắc:
- `media library` là curated public surface, không phải raw media asset manager
- album/playlist phải là first-class records
- item nào ref sang `Calendar` hoặc `Wisdom-QA` phải giữ owner ref rõ
- FE library page không tự ghép từ raw `media_assets`

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
- `Ngôi Nhà Nhỏ` public delivery phải ưu tiên DTO/block đã lọc theo group, slug, block type; không trả raw editor payload chưa sanitize cho FE render trực tiếp.
- `Phóng Sanh` public delivery phải trả được `guideMap`, `ritualVariants`, `faq`, `downloads` và `warning blocks`; journal module chỉ nhận refs/context chứ không giữ full ritual script.
