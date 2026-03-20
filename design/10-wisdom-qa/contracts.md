# Wisdom & QA Contracts

## Owner data dự kiến

- `wisdomEntries`
- `baihuaBooks`
- `baihuaBookEntries`
- `baihuaAudioTracks`
- `qaEntries`
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
  - từ khóa alias
  - đoạn trả lời index được
  - link bài gốc
  - source code kiểu `shuohua20140808 08:56` nếu source có
  - question/answer original nếu source có
  - bản dịch Việt song song nếu đã duyệt
  - practice rule extraction nếu đây là bài có rule thực hành cụ thể
- publish/search/offline-bundle refresh signal quan trọng nên đi qua `outbox_events`
- ingest payload, publish payload, search payload, bundle-manifest payload và env/runtime config phải có schema runtime rõ

## Audiobook-specific routes

- `GET /api/wisdom/baihua/books`
- `GET /api/wisdom/baihua/books/:bookSlug`
- `GET /api/wisdom/baihua/books/:bookSlug/chapters/:chapterNumber`
- `POST /api/admin/wisdom/baihua/books/import-source`
- `PATCH /api/admin/wisdom/baihua/chapters/:publicId/translation`
- `POST /api/admin/wisdom/baihua/chapters/:publicId/publish`

## Notes for AI/codegen

- Không để AI tự sinh "câu trả lời Phật pháp".
- Retrieval phải luôn trỏ về nguồn bài gốc hoặc bản dịch được duyệt.
- Search nên xem module này và `01-content` như hai owner tách biệt nhưng một bề mặt đọc thống nhất `Kho Trí Huệ`.
- Format `nguyên văn + bản dịch + link gốc + ảnh nguồn` là format ưu tiên cho bài thực tế cần cộng đồng cùng kiểm duyệt.
- Với web phụng sự viên Việt Nam, chỉ dùng như `community_volunteer_site` hoặc `community_translation` nếu không phải source gốc.
- Nếu search/offline drift xảy ra, recovery path chuẩn là replay signal, reindex hoặc rebuild bundle từ source records đã duyệt.
