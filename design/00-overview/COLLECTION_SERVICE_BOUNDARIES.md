# Collection & Service Boundaries

File này là lớp bridge giữa design và code implementation.
Nó trả lời:

- module nào nên có collection nào
- collection nào là canonical owner
- service nào nên ôm business logic

## Quy tắc chung

- collection owner giữ canonical record
- service owner giữ business write-path
- hook chỉ orchestration mỏng
- route chỉ validate, gọi service, map response

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

Service responsibilities:
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

Service responsibilities:
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

Service responsibilities:
- self-owned upsert
- `Ngôi Nhà Nhỏ` counting rules
- practice session state transitions
- compose content refs into usable practice read model

### 04-moderation

Collections hiện có:
- `ModerationReports`

Service responsibilities:
- report submit
- duplicate report prevention
- target summary sync
- decision apply

### 05-search

Collections hiện có:
- không cần collection canonical riêng nếu search là index/control-plane

Service responsibilities:
- index document build
- engine query
- fallback read
- batch reindex orchestration

### 06-calendar

Collections hiện có:
- `Events`
- `LunarEvents`
- `LunarEventOverrides`

Collections/read models nên bổ sung khi cần:
- `PracticeCalendarRules` nếu rule layer lớn hơn current event/lunar shape
- hoặc generate read model mà không thêm collection nếu đủ đơn giản

Service responsibilities:
- lunar resolution
- important practice day tagging
- reminder candidate generation

### 07-notification

Collections hiện có:
- `PushSubscriptions`
- `PushJobs`

Service responsibilities:
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

Service responsibilities:
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

Service responsibilities:
- source ingestion metadata
- tag normalization
- retrieval ranking
- offline bundle build
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

- Nếu phải tạo collection mới, tạo theo owner module thay vì nhét vào collection cũ cho tiện.
- Nếu một service cần chạm nhiều module, tách orchestration ở owner service trước khi nghĩ đến shared abstraction.
