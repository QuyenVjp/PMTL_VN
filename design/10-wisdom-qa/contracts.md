# Wisdom & QA Contracts

## Owner data dự kiến

- `wisdomEntries`
- `baihuaBooks`
- `baihuaBookEntries`
- `baihuaAudioTracks`
- `qaEntries`
- `authorityProfiles`
- `offlineBundles`
- `audioTalkEntries`
- `videoTalkEntries`

## Permission baseline

- `guest`
  - được đọc content public đã publish
- `member`
  - được tải offline bundle (gói tải ngoại tuyến) cá nhân nếu feature bật
- `admin`
  - được tạo/cập nhật/publish entry nội dung đã dịch hoặc curated
  - được quản lý source mapping, media refs
- `super-admin`
  - giữ quyền vận hành sâu và audit khi cần

## contract (hợp đồng dữ liệu/nghiệp vụ) rules

- mỗi entry cần có:
  - source URL chính thức
  - source provenance (tầng nguồn gốc dữ liệu) / tầng nguồn
    - `official_origin`
    - `official_mirror`
    - `community_volunteer_site`
    - `community_translation`
    - `community_annotation`
  - source type
  - source code / timestamp nếu có
  - title gốc
  - title dịch nếu có
  - tags chuẩn hóa
  - language
  - original text hoặc excerpt gốc
  - translated text nếu đã dịch
  - source screenshot/image nếu workflow cần peer review
  - review status (trạng thái kiểm duyệt):
    - `source_verified`
    - `translated_draft`
    - `translated_reviewed`
    - `human_review_required`
- `wisdomEntries` nên hỗ trợ nhóm:
  - `Bạch thoại Phật pháp`
  - `khai thị`
  - `Phật ngôn Phật ngữ`
  - `bài pháp hội`
- `Bạch thoại audiobook` phải support:
  - book selector
  - chapter ordering
  - full-book audio ref
  - chapter-level original text + translated text
- QA entry nên có:
  - vấn đề chính
  - source family: `wenda` | `mail_qa`
  - từ khóa alias
  - đoạn trả lời index được
  - link bài gốc
  - source code kiểu `shuohua20140808 08:56` nếu source có
  - question/answer original nếu source có
  - bản dịch Việt song song nếu đã duyệt
  - practice rule extraction nếu đây là bài có rule thực hành cụ thể
- `qaEntries` và `wisdomEntries` không được publish lại như `posts` để làm canonical public record
  - `posts` chỉ được dùng làm editorial layer, bài dẫn nhập, bài giải thích, hoặc bài tổng hợp có link ngược về canonical source-backed entry
  - nếu một nội dung có `sourceCode/timestamp`, `question/answer`, hoặc transcript nguồn rõ thì owner chuẩn phải là `qaEntries` hoặc `wisdomEntries`, không phải `posts`
- `authorityProfiles` là profile authority/source context, không phải `post`, không phải `wisdomEntry`, và chưa là public route canon riêng nếu `PAGE_INVENTORY` chưa mở route
  - search public không được tự expose `authorityProfiles` như result card nếu chưa có route canon riêng
  - event page hoặc wisdom entry chỉ được reference `authorityProfile`, không được copy/merge mọi profile claim vào body text
- `bài pháp hội` hoặc `event discourse` vẫn là `wisdomEntries`
  - `Calendar` có thể deep-link hoặc giữ `relatedWisdomPublicIds`
  - `Calendar` không được trở thành owner của transcript/discourse text
- publish/search/offline-bundle refresh signal quan trọng nên đi qua `outbox_events`
- ingest payload, publish payload, search payload, bundle-manifest payload và env/runtime config phải có schema runtime rõ

## Audiobook-specific routes

- `GET /api/wisdom/baihua/books`
- `GET /api/wisdom/baihua/books/:bookSlug`
- `GET /api/wisdom/baihua/books/:bookSlug/chapters/:chapterNumber`
- `GET /api/admin/wisdom/baihua/books`
- `GET /api/admin/wisdom/baihua/chapters/:publicId`
- `POST /api/admin/wisdom/baihua/books/import-source`
- `PATCH /api/admin/wisdom/baihua/chapters/:publicId/translation`
- `POST /api/admin/wisdom/baihua/chapters/:publicId/publish`

## Admin workspace routes

- `GET /api/admin/wisdom/entries`
- `GET /api/admin/wisdom/entries/:publicId`
- `POST /api/admin/wisdom/entries`
- `PATCH /api/admin/wisdom/entries/:publicId`
- `POST /api/admin/wisdom/entries/:publicId/publish`
- `POST /api/admin/wisdom/entries/ingestion-jobs`
- `GET /api/admin/wisdom/offline-bundles`
- `POST /api/admin/wisdom/offline-bundles/rebuild`
- `GET /api/admin/wisdom/import-jobs`

## Notes for AI/codegen

- Không để AI tự sinh "câu trả lời Phật pháp".
- Retrieval phải luôn trỏ về nguồn bài gốc hoặc bản dịch được duyệt.
- Search nên xem module này và `01-content` như hai owner tách biệt nhưng một bề mặt đọc thống nhất `Kho Trí Huệ`.
- Format `nguyên văn + bản dịch + link gốc + ảnh nguồn` là format ưu tiên cho bài thực tế cần cộng đồng cùng kiểm duyệt.
- Với web phụng sự viên Việt Nam, chỉ dùng như `community_volunteer_site` hoặc `community_translation` nếu không phải source gốc.
- Nếu search/offline drift xảy ra, recovery path chuẩn là replay signal, reindex hoặc rebuild bundle từ source records đã duyệt.
