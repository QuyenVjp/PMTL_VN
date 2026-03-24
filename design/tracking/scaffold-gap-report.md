# SCAFFOLD_GAP_REPORT

File này gom các lỗ hổng còn lại sau pass chéo giữa:

- `ui/PAGE_INVENTORY.md`
- `ui/USER_FLOWS.md`
- `tracking/api-route-inventory.md`
- `NN-domain/use-cases/*.md`

Mục tiêu là để chuẩn bị scaffold `apps/api`, `apps/web`, `apps/admin` mà không phải đoán tiếp.

## Đã chuẩn hóa trong pass này

- route canon cho community submit, guestbook submit, comment report, public search, practice-log self upsert, push subscribe, push process, personal-practice refresh
- auth ambiguity lớn giữa `member+` và guest/member cho comment report + comment submit
- identity verification endpoints, admin profile update endpoint, notification preference endpoints, calendar manual routes, offline bundle/member routes, wisdom admin read-model routes
- action routes rõ hơn cho life-release journal correction/void
- use-case owner doc mới cho assisted vow progress

## Còn thiếu cho `apps/api`

- response DTO field-level schemas cho từng route profile đã có owner scaffold baseline ở `tracking/api-dto-shape-plan.md`; khi scaffold controller vẫn phải map sang `packages/shared`
- admin page-to-route-group mapping đã có owner docs riêng (`tracking/admin-page-api-mapping.md`, `tracking/admin-feature-query-plan.md`), nhưng DTO shape thật vẫn phải derive khi bắt đầu scaffold controller/query layer
- search surface vẫn có 2 lớp:
  - `/search` là federated public entrypoint
  - `/qa/search` là specialized wisdom/search path
  Cần giữ rõ ở service boundary để web không gọi sai endpoint
- offline bundle flow mới chỉ chốt route surface; nếu cần worker/build pipeline thì phải bám `10-wisdom-qa/use-cases/download-offline-bundle.md` và optional phase docs
- lane auto-ingest/auto-translate cho wisdom đã có design canon, nhưng runtime vẫn còn thiếu:
  - `duplicate-check` DTO/service
  - `slug-preview` DTO/service
  - import-job persistence + retry contract
  - translation provider profile registry
  - MCP tool server hoặc API wrapper tương ứng

## Còn thiếu cho `apps/web`

- loader contracts cho các public/member grouped pages đã có owner baseline ở `tracking/page-loader-contracts.md`; lúc scaffold RSC chỉ còn việc map sang API aggregates tương ứng
- `/thong-bao` đã có backing route family cơ bản, nhưng UX states cho empty/error/loading và preference conflict cần map thêm sang component states
- `/ngoai-tuyen` đã có route surface cơ bản, nhưng cần explicit pagination/sync badge strategy khi scaffold thật

## Vertical slice recommendation (Khuyến nghị slice đầu tiên)

Slice E2E đầu tiên nên làm là `chanting environment rules`:

- public page `/niem-kinh/luu-y-moi-truong-va-thoi-gian`
- API `GET /content/chanting/environment-rules`
- API `GET /content/chanting/environment-rules/:groupKey`
- admin tab environment rules trong `/admin/noi-dung/niem-kinh`

Không nên lấy `/dashboard` làm slice đầu tiên vì đó là validation surface đa module.
Không nên lấy `/ngoai-tuyen` làm slice đầu vì bundle/delta sync còn complexity riêng.
Không nên lấy `/thong-bao` làm slice đầu nếu chưa muốn chạm auth member + capability phase-gating.

## Còn thiếu cho `apps/admin`

- `tracking/admin-page-api-mapping.md`, `tracking/apps-admin-scaffold-backlog.md`, và `tracking/admin-feature-query-plan.md` đã chốt route group + query key family + invalidation baseline
- moderation comment routes và audit-log detail DTO vẫn chưa đủ canon để scaffold blind
- wisdom, assisted-entry, và identity admin surfaces đã có route canon, nhưng vẫn cần DTO field picks cụ thể trước khi generate table/form layer
- wisdom import workspace giờ đã có duplicate/slug/import-job canon, nhưng vẫn cần:
  - import-job detail DTO
  - provider profile options DTO
  - draft translation review form field picks

## Đã khóa thêm trong pass này

- `tracking/api-dto-shape-plan.md`:
  - field picks baseline cho public/admin DTO profiles
  - giảm blind scaffold ở moderation, audit-log, search-admin, wisdom import
- `tracking/page-loader-contracts.md`:
  - page-level data requirements cho grouped content, wisdom hubs, offline, notifications
- `tracking/outbox-event-taxonomy.md`:
  - công thức `idempotencyKey` theo từng event family để producer không tự random

## Domain-by-domain lỗ hổng cần để mắt khi scaffold

| Domain | Main risk |
|---|---|
| `01-identity` | verify-email, resend-verification, và admin-update-profile phải đi cùng policy/authz thật từ ngày đầu |
| `02-content` | grouped content IA cần query contract rõ để web không lắp sai loaders |
| `03-community` | comment visibility/pending moderation state phải match flow member-only hiện tại |
| `04-engagement` | self-state routes (`practice-logs/self`, sheets, bookmarks, reading-progress`) cần thống nhất idempotency semantics |
| `05-moderation` | admin page auth và backend role narrowing phải chốt trong policy helper, không hardcode rải rác |
| `06-search` | giữ rõ federated search vs specialized wisdom search |
| `07-calendar` | member read model và admin manual refresh/lunar override phải không lẫn với event CRUD |
| `08-notification` | reminder preference routes mới chỉ là baseline; downstream delivery vẫn phase-scoped |
| `09-vows-merit` | assisted-entry, milestone, và life-release correction/void cần transaction + audit từ đầu |
| `10-wisdom-qa` | `/ngoai-tuyen` và admin wisdom workspace cần read-model DTOs đủ chi tiết trước khi scaffold UI table/offline flows |
| `11-contact` | route surface khá rõ; chủ yếu còn page-to-API mapping và response DTO detail |
