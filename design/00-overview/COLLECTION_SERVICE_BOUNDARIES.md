# Collection & service (lớp xử lý nghiệp vụ) Boundaries

File này là lớp bridge giữa design và code implementation.
Nó trả lời:

- module nào nên có collection nào
- collection nào là canonical owner
- service (lớp xử lý nghiệp vụ) nào nên ôm business logic

## Quy tắc chung

- collection owner giữ canonical record (bản ghi chuẩn gốc)
- service (lớp xử lý nghiệp vụ) owner giữ business write-path
- hook chỉ orchestration mỏng
- route chỉ validate, gọi service (lớp xử lý nghiệp vụ), map response

## Module by module

### 01-content

Collections hiện có:
- `Posts`
- `BeginnerGuides`
- `Downloads`
- `ChantItems`
- `ChantPlans`
- `Sutras`
- `SutraVolumes`
- `SutraChapters`
- `SutraGlossary`

service (lớp xử lý nghiệp vụ) responsibilities:
- slug/publicId/source field normalization
- publish eligibility
- DTO mapping
- content-to-search projection source fields

### 02-community

Collections hiện có:
- `PostComments`
- `CommunityPosts`
- `CommunityComments`
- `GuestbookEntries`

service (lớp xử lý nghiệp vụ) responsibilities:
- submit validation orchestration
- anti-spam / request guard coordination
- author snapshot rules
- summary counter updates

### 03-engagement

Collections hiện có:
- `SutraBookmarks`
- `SutraReadingProgress`
- `ChantPreferences`
- `PracticeLogs`

Collections nên bổ sung:
- `PracticeSheets` hoặc `NgoiNhaNhoSheets`
- `PracticeSheetEntries` hoặc embedded counters theo tờ

service (lớp xử lý nghiệp vụ) responsibilities:
- self-owned upsert
- `Ngôi Nhà Nhỏ` counting rules
- practice session state transitions
- compose content refs into usable practice read model (mô hình dữ liệu đọc)

### 04-moderation

Collections hiện có:
- `ModerationReports`

service (lớp xử lý nghiệp vụ) responsibilities:
- report submit
- duplicate report prevention
- target summary sync
- decision apply

### 05-search

Collections hiện có:
- không cần collection canonical riêng nếu search là index/control-plane (lớp điều phối hệ thống)

service (lớp xử lý nghiệp vụ) responsibilities:
- index document build
- engine query
- fallback (đường dự phòng) read
- batch reindex orchestration

### 06-calendar

Collections hiện có:
- `Events`
- `LunarEvents`
- `LunarEventOverrides`

Collections/read models nên bổ sung khi cần:
- `PracticeCalendarRules` nếu rule layer lớn hơn current event/lunar shape
- hoặc generate read model (mô hình dữ liệu đọc) mà không thêm collection nếu đủ đơn giản

service (lớp xử lý nghiệp vụ) responsibilities:
- lunar resolution
- important practice day tagging
- reminder candidate generation

### 07-notification

Collections hiện có:
- `PushSubscriptions`
- `PushJobs`

service (lớp xử lý nghiệp vụ) responsibilities:
- subscription upsert
- job create
- recipient resolution
- chunk dispatch
- reminder schedule dedupe

### 08-vows-merit

Collections nên bổ sung:
- `Vows`
- `VowProgressEntries`
- `LifeReleaseJournal`
- `LifeReleaseChecklistSnapshots` hoặc embedded checklist snapshot

service (lớp xử lý nghiệp vụ) responsibilities:
- vow lifecycle
- milestone calculation
- fulfillment checks
- life release journal create/update
- merge with calendar reminder context

### 09-wisdom-qa

Collections nên bổ sung:
- `WisdomEntries`
- `QaEntries`
- `OfflineBundles`
- `MediaAssets` chỉ nếu content/media hiện tại chưa đủ diễn đạt offline pack

service (lớp xử lý nghiệp vụ) responsibilities:
- source ingestion (nhập dữ liệu) metadata
- tag normalization
- retrieval ranking
- offline bundle (gói tải ngoại tuyến) build
- bilingual/translation mapping

## Khuyến nghị placement trong repo

### CMS
- `apps/cms/src/collections/<Collection>/`
- `apps/cms/src/services/`
- `apps/cms/src/integrations/`

### Web
- `apps/web/src/features/<domain>/`
- `apps/web/src/lib/api/`

### Shared
- `packages/shared/src/schemas/`
- `packages/shared/src/types/`
- `packages/shared/src/constants/`

## Notes for AI/codegen

- Nếu phải tạo collection mới, tạo theo owner module (module sở hữu) thay vì nhét vào collection cũ cho tiện.
- Nếu một service (lớp xử lý nghiệp vụ) cần chạm nhiều module, tách orchestration ở owner service (lớp xử lý nghiệp vụ) trước khi nghĩ đến shared abstraction.

