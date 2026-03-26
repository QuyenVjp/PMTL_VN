# ADMIN_PAGE_API_MAPPING

File này là canonical mapping giữa admin page route, API route group, query keys, và invalidation rules.
Nó tồn tại để scaffold `apps/admin` mà không phải đoán dependency giữa [PAGE_INVENTORY.md](../web/PAGE_INVENTORY.md), [ADMIN_MODULE_SPECS.md](../../02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md), và [API_ROUTE_INVENTORY.md](../api/API_ROUTE_INVENTORY.md).

> Page route canon: `design/04-execution-overlay/web/PAGE_INVENTORY.md`
> Admin shell/layout: `design/02-platform-baseline/admin-runtime/ADMIN_ARCHITECTURE.md`
> Workspace spec chi tiết: `design/02-platform-baseline/admin-runtime/ADMIN_MODULE_SPECS.md`
> API route canon: `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
> Cache doctrine: `design/02-platform-baseline/data-runtime/CACHE_TOPOLOGY.md`

## Query key rules

- Query key phải dùng array, không hardcode string rời rạc trong component.
- Mỗi workspace có:
  - `list` key
  - `detail` key
  - `aux` key cho filters/options/status/dashboard phụ
- Mutation invalidation mặc định:
  - create: invalidate list + aux liên quan
  - update: invalidate list + detail
  - delete: invalidate list + remove/invalidate detail
  - publish/status change: invalidate list + detail + dashboard/status widgets liên quan
- Nếu mutation ảnh hưởng public surface, ngoài admin query invalidation còn phải đi qua invalidation owner ở `platform/cache`.

## Role narrowing inside admin surfaces

- `PAGE_INVENTORY.md` giữ page gate ở mức shell:
  - `admin+`
  - `super-admin`
- API route canon mới là nơi chốt action narrowing thực tế như:
  - `editor+`
  - `moderator+`
  - `admin+`
  - `super-admin`
- admin page không được suy từ page gate rằng mọi button trên page đều dành cho mọi admin role.
- mọi action button có risk cao như:
  - role change
  - block/unblock
  - feature flag toggle
  - publish/unpublish
  - moderation decision
  - job redrive
  phải đi từ backend policy projection hoặc explicit route note, không hardcode ở component.

### Action narrowing matrix shortcut

| Action family | Minimum backend role expectation |
|---|---|
| moderation decision / hide / restore | `moderator+` hoặc route owner equivalent |
| publish / unpublish editorial content | `editor+` hoặc route owner equivalent |
| role change / feature-flag update / super-sensitive system action | `super-admin` hoặc route owner equivalent |
| block / unblock user | `admin+` hoặc stricter nếu route owner nói vậy |
| job redrive / ops retry | `admin+` hoặc stricter nếu route owner nói vậy |

Nếu route canon cụ thể hẹp hơn bảng trên, route canon thắng.
Nếu page đang ở `admin+` nhưng action route là `super-admin`, workspace phải render disabled/hidden state từ backend policy projection.

## Cross-module invalidation edge rules

- nếu mutation ở admin làm đổi public visibility, phải invalidated cả:
  - admin workspace keys
  - public loader/cache owner liên quan
  - freshness/status widgets nếu chính page đó đang hiển thị chúng
- nếu mutation chỉ đổi metadata nội bộ, không được broad-invalidate toàn bộ dashboard hay toàn bộ admin shell.
- invalidation xuyên module phải bám owner thật:
  - content publish -> content keys + public cache/search freshness
  - moderation decision -> moderation keys + target surface keys
  - calendar refresh/override -> calendar keys + advisory preview keys + downstream notification freshness nếu surfaced
  - notification job redrive -> notification ops keys; không invalidate calendar/content trừ khi page thật sự hiển thị derived candidate từ cùng source
- nếu một workspace đang dùng child tabs hoặc child aggregates, invalidation phải ưu tiên:
  - affected child key
  - parent detail key khi summary đổi
  - list key khi ordering/filter membership đổi

### Dashboard widget dependency shortcut

`/admin/dashboard` chỉ được invalidate khi mutation làm đổi một trong các aggregate panels owner sau:

- `systemSummary`
- `pendingModeration`
- `recentAuditEvents`
- `contentOpsSummary`
- `searchOpsSummary`

Ví dụ:
- content publish/unpublish -> `contentOpsSummary`
- moderation decision -> `pendingModeration`, có thể kéo `recentAuditEvents`
- feature-flag update -> `systemSummary`, có thể kéo `recentAuditEvents`
- search reindex trigger/complete -> `searchOpsSummary`

Không vì một mutation admin bất kỳ mà invalidate root dashboard một cách mặc định.

## Mapping table

| Admin page route | Primary API route group | Primary query keys | Invalidation rules |
|---|---|---|---|
| `/admin/dashboard` | `/api/admin/system/dashboard-stats` | `['admin-dashboard']` | publish, moderation decision, feature-flag update, assisted-entry write, volunteer/contact updates chỉ invalidate root dashboard aggregate khi widget liên quan thật sự bị ảnh hưởng |
| `/admin/noi-dung/bai-viet` | `/api/content/posts`, `/api/content/posts/:publicId`, `/api/content/posts/:publicId/publish` | `['admin-posts', 'list', filters]`, `['admin-posts', 'detail', publicId]` | create/update/publish: invalidate `admin-posts` list + detail + root dashboard aggregate nếu widget content bị ảnh hưởng; publish/unpublish còn trigger public cache invalidation |
| `/admin/noi-dung/huong-dan` | `/api/content/beginner-guides`, `/api/content/beginner-guides/:slug` | `['admin-beginner-guides', 'list', filters]`, `['admin-beginner-guides', 'detail', slugOrId]` | create/update/publish: invalidate list + detail; nếu guide lên public thì invalidate related hub/loaders |
| `/admin/noi-dung/kinh-bai-tap` | `/api/admin/content/daily-practice/*` | `['admin-daily-practice', 'overview']`, `['admin-daily-practice', 'guides']`, `['admin-daily-practice', 'presets']`, `['admin-daily-practice', 'faq']`, `['admin-daily-practice', 'downloads']` | Mọi mutation trong workspace: invalidate `admin-daily-practice`; publish còn invalidate public daily-practice pages + related search/doc freshness nếu enabled |
| `/admin/noi-dung/kinh-van-tu-tu` | `/api/admin/content/self-cultivation/*` | `['admin-self-cultivation', 'overview']`, `['admin-self-cultivation', 'guides']`, `['admin-self-cultivation', 'faq']`, `['admin-self-cultivation', 'downloads']` | Mọi mutation trong workspace: invalidate `admin-self-cultivation`; publish còn invalidate public self-cultivation grouped pages + related download/reference surfaces |
| `/admin/noi-dung/ngoi-nha-nho` | `/api/admin/content/little-house/*` | `['admin-little-house', 'overview']`, `['admin-little-house', 'guides']`, `['admin-little-house', 'case-variants']`, `['admin-little-house', 'faq']`, `['admin-little-house', 'downloads']` | Mọi mutation: invalidate `admin-little-house`; publish còn invalidate public little-house grouped pages |
| `/admin/noi-dung/phong-sanh` | `/api/admin/content/life-release/*` | `['admin-life-release', 'overview']`, `['admin-life-release', 'guides']`, `['admin-life-release', 'variants']`, `['admin-life-release', 'faq']`, `['admin-life-release', 'downloads']` | Mọi mutation: invalidate `admin-life-release`; publish còn invalidate public life-release guide surfaces |
| `/admin/noi-dung/tai-lieu` | `/api/admin/content/downloads*` | `['admin-downloads', 'list', filters]`, `['admin-download', 'detail', publicId]` | create/update/publish: invalidate download list + detail; publish còn invalidate public `/tai-lieu` và các content surfaces đang reference cùng download record |
| `/admin/noi-dung/thu-vien-phap-mon` | `/api/admin/content/media-library/*`, `/api/content/media-library/*` | `['admin-media-library', 'overview']`, `['admin-media-library', 'collections', filters]`, `['admin-media-library', 'collection', publicId]`, `['admin-media-library', 'featured']`, `['admin-media-library', 'tags']` | collection/item/featured/tag mutation: invalidate collection list + detail + featured/tags liên quan; publish còn invalidate public media-library surfaces |
| `/admin/noi-dung/bach-thoai` | `/api/admin/wisdom/entries*`, `/api/admin/wisdom/entries/duplicate-check`, `/api/admin/wisdom/entries/slug-preview`, `/api/admin/wisdom/authority-profiles*`, `/api/admin/wisdom/baihua/*`, `/api/admin/wisdom/offline-bundles*`, `/api/admin/wisdom/import-jobs*` | `['admin-wisdom', 'list', filters]`, `['admin-wisdom', 'detail', publicId]`, `['admin-wisdom', 'duplicate-check', params]`, `['admin-wisdom', 'slug-preview', params]`, `['admin-authority-profiles', 'list', filters]`, `['admin-authority-profile', 'detail', publicId]`, `['admin-wisdom', 'offline-bundles']`, `['admin-wisdom', 'import-jobs']`, `['admin-wisdom', 'import-job', publicId]`, `['admin-baihua-books', 'list', filters]`, `['admin-baihua-chapter', 'detail', publicId]` | current default create flow là manual editor flow: create/update/publish invalidate wisdom list + detail; duplicate-check/slug-preview là aux keys ngay trong create/edit form; ingest/rebuild invalidates import-jobs/detail + offline-bundles khi lane phase-later được bật; baihua translation/publish còn invalidate admin chapter detail + search/offline freshness widgets nếu surfaced |
| `/admin/noi-dung/kinh-sach` | `/api/admin/content/sutras*`, `/api/admin/wisdom/baihua/*` | `['admin-sutras', 'list', filters]`, `['admin-sutra', 'detail', publicId]`, `['admin-baihua-books', 'list', filters]`, `['admin-baihua-chapter', 'detail', publicId]` | sutra create/update/volume/chapter mutation: invalidate sutra list + affected sutra detail; sutra publish còn invalidate public `/kinh-sach` + related reading pages; baihua translation/publish/import: invalidate baihua list/detail + admin wisdom status widgets |
| `/admin/noi-dung/niem-kinh` | `/api/admin/content/chant-items*`, `/api/admin/content/chant-ritual-templates*`, `/api/admin/content/chant-plans*`, `/api/admin/content/chanting/environment-rules*`, plus public support routes `/api/content/chant-items`, `/api/content/chant-plans` when preview needs canonical public payload | `['admin-chant-items', 'list', filters]`, `['admin-chant-item', 'detail', publicId]`, `['admin-chant-ritual-templates', 'list', filters]`, `['admin-chant-ritual-template', 'detail', publicId]`, `['admin-chant-plans', 'list']`, `['admin-chant-plan', 'detail', publicId]`, `['admin-chant-environment-rules', 'list']` | mutation: invalidate admin list + detail keys of affected family; nếu public grouped guides reuse owner record thì invalidate dependent loaders theo route canon |
| `/admin/noi-dung/media` | `/api/content/media/upload`, `/api/content/media/:publicId` (delete only), media-library support routes | `['admin-media', 'assets', filters]` | upload/delete: invalidate asset list + any workspace currently embedding selected asset; không claim dedicated asset-detail query key cho tới khi route canon riêng được mở trong inventory + DTO plan |
| `/admin/cong-dong/bai-dang` | `/api/admin/community/posts`, `/api/admin/community/posts/:publicId`, moderation support routes | `['admin-community-posts', 'list', filters]`, `['admin-community-post', 'detail', publicId]` | create/update/moderation state change: invalidate list + detail + dashboard widgets nếu surfaced |
| `/admin/cong-dong/so-luu-niem` | `/api/admin/community/guestbook`, `/api/admin/community/guestbook/:publicId`, moderation support routes | `['admin-guestbook', 'list', filters]`, `['admin-guestbook', 'detail', publicId]` | approve/reject/update: invalidate list + detail + dashboard widgets nếu surfaced |
| `/admin/kiem-duyet/bao-cao` | `/api/moderation/reports`, `/api/moderation/reports/:publicId/decision` | `['admin-moderation-reports', 'list', filters]`, `['admin-moderation-report', 'detail', publicId]` | decision: invalidate report list + detail + affected target workspace list/detail + root dashboard aggregate nếu moderation summary bị ảnh hưởng |
| `/admin/kiem-duyet/binh-luan` | `/api/admin/moderation/comments`, `/api/admin/moderation/comments/:publicId`, `/api/admin/moderation/comments/:publicId/hide`, `/api/admin/moderation/comments/:publicId/restore` | `['admin-moderated-comments', 'list', filters]`, `['admin-moderated-comment', 'detail', publicId]` | hide/restore action: invalidate comment list + detail + related report list + target content detail |
| `/admin/nguoi-dung` | `/api/admin/users`, `/api/admin/users/:publicId`, `/api/admin/users/:publicId/profile`, `/api/admin/users/:publicId/role`, `/api/admin/users/:publicId/block`, `/api/admin/users/:publicId/unblock`, `/api/admin/users/:publicId/audit-history`, `/api/admin/users/:publicId/practice-stats` | `['admin-users', 'list', filters]`, `['admin-user', 'detail', publicId]`, `['admin-user', 'audit-history', publicId, filters]`, `['admin-user', 'practice-stats', publicId]` | update/block/unblock/role change/profile edit: invalidate user list + detail + audit-history + session/dashboard widgets nếu affected |
| `/admin/nguoi-dung/phien` | `/api/admin/sessions`, `/api/admin/sessions/:sessionId`, `/api/admin/sessions/revoke-bulk`, `/api/admin/users/:publicId/sessions/revoke-all` | `['admin-sessions', 'list', filters]`, `['admin-session', 'detail', sessionId]`, `['admin-sessions', 'by-user', userPublicId]` | revoke/delete session: invalidate sessions list + detail + affected user detail + `by-user` keys |
| `/admin/he-thong` | `— (shell container / redirect only)` | `—` | container route trong admin shell; không có workspace data owner riêng, không tự tạo query keys hay mutation invalidation ở đây |
| `/admin/he-thong/feature-flags` | `/api/admin/feature-flags`, `/api/admin/feature-flags/:key` | `['admin-feature-flags', 'list']`, `['admin-feature-flags', 'detail', key]` | toggle/update: invalidate feature-flag list + detail + any screen directly bound to changed flag; write-path là `super-admin` gate dù page nằm trong admin shell |
| `/admin/he-thong/audit-logs` | `/api/admin/audit-logs`, `/api/admin/audit-logs/:publicIdOrId` | `['admin-audit-logs', 'list', filters]`, `['admin-audit-logs', 'detail', id]` | read-mostly; manual refresh only, no broad invalidation required |
| `/admin/he-thong/lich` | `/api/calendar/events`, `/api/admin/calendar/events`, `/api/admin/calendar/lunar-overrides*`, `/api/admin/calendar/status`, `/api/admin/calendar/advisory/preview`, `/api/admin/calendar/personal-practice/inspect`, `/api/admin/calendar/personal-practice/refresh` | `['admin-events', 'list', filters]`, `['admin-calendar-overrides', 'list', filters]`, `['admin-calendar-override', 'detail', publicId]`, `['admin-calendar', 'status']`, `['admin-calendar', 'advisory-preview', params]`, `['admin-calendar', 'inspect', params]` | create/update/publish/reschedule/cancel/lunar-override/refresh: invalidate event list + event detail + override list/detail + calendar status + inspect keys + dashboard widgets if used; preview keys only invalidate when override/refresh mutation changes advisory inputs; advisory preview key canon phải đủ input cho target type + rule family + surface plan + pre-notify preview, không rút về 1 string blob |
| `/admin/he-thong/lich/[eventId]` | `/api/admin/calendar/events/:publicId*`, agenda/speakers/ctas child routes | `['admin-event', 'detail', eventId]`, `['admin-event', 'agenda', eventId]`, `['admin-event', 'speakers', eventId]`, `['admin-event', 'ctas', eventId]` | child mutation: invalidate affected child key + parent detail; publish/reschedule/cancel also invalidate event list and public event surfaces |
| `/admin/he-thong/tim-kiem` | `/api/admin/search/status`, `/api/admin/search/operational-status`, `/api/admin/search/performance`, `/api/admin/search/indexing-jobs`, `/api/admin/search/indexing-jobs/:publicId`, `/api/admin/search/fallback-events`, `/api/admin/search/reindex`, `/api/admin/search/reindex/:source`, `/api/admin/search/index-settings` | `['admin-search', 'status']`, `['admin-search', 'operational-status']`, `['admin-search', 'performance', filters]`, `['admin-search', 'indexing-jobs', filters]`, `['admin-search', 'indexing-job', publicId]`, `['admin-search', 'fallback-events', filters]`, `['admin-search', 'index-settings']` | reindex trigger: invalidate status + operational-status + indexing-jobs immediately; on completion invalidate performance/fallback summaries if freshness changes; index-settings update invalidates settings + status + operational-status; related content lists only invalidate if admin UI explicitly surfaces freshness-dependent state |
| `/admin/he-thong/thong-bao` | `/api/admin/notifications/push/status`, `/api/admin/notifications/push/jobs*`, `/api/admin/notifications/push/subscription-stats` | `['admin-notifications', 'status']`, `['admin-push-jobs', 'list', filters]`, `['admin-push-job', 'detail', publicId]`, `['admin-notification-subscription-stats']` | create/process/redrive job: invalidate jobs list + detail + status; subscription-stats invalidate only when subscription aggregation freshness changes; nếu job tạo từ calendar advisory thì invalidate thêm advisory preview/status freshness khi UI đang show pre-notify candidate derived từ cùng source |
| `/admin/he-thong/phung-su-vien` | `/api/admin/volunteers*`, `/api/admin/contact-info` nếu page ghép chung | `['admin-volunteers', 'list']`, `['admin-volunteer', 'detail', publicId]`, `['admin-contact-info']` | create/update/delete/sort: invalidate volunteer list + detail; contact-info update: invalidate `admin-contact-info` |
| `/admin/he-thong/health` | `/api/admin/system/health-extended` | `['admin-health', 'summary']`, `['admin-health', 'checks']` | read-mostly; polling refresh, no mutation invalidation in normal flow |
| `/admin/ho-tro/phat-nguyen/nhap-ho` | `/api/admin/vows/assisted-entry/life-release`, `/api/admin/vows/assisted-entry/progress`, `/api/admin/vows/assisted-entry/history`, `/api/admin/vows/assisted-entry/members/search`, `/api/admin/vows/assisted-entry/members/:memberPublicId/vows` | `['admin-assisted-entry', 'history', filters]`, `['admin-assisted-entry', 'member-search', filters]`, `['admin-assisted-entry', 'member-vows', memberPublicId]` | assisted-entry submit: invalidate history + affected vow/member detail + root dashboard aggregate nếu support widget được surface |

## Mutation-to-invalidation quick rules

| Mutation family | Minimum invalidation |
|---|---|
| content publish/unpublish | admin list + admin detail + dashboard widgets + public cache invalidation owner |
| moderation decision | report list + report detail + affected target query keys |
| event agenda/speaker/CTA edit | event child key + event detail |
| feature flag update | flag list + flag detail + directly bound admin screens |
| assisted-entry write | assisted-entry history + affected vow/member detail |
| push job process/redrive | push job list + job detail + notification status |

## Notes for scaffold

- File này chốt query key family ở mức design. Khi scaffold thật, nên biến chúng thành query key factory ở `apps/admin/src/features/*/queries.ts`.
- Root dashboard query key canon là `['admin-dashboard']`; không suy từ workspace khác.
- ownership invalidate dashboard nằm ở mutation handler / query owner, không nằm ở component page.
- Nếu một page dùng nhiều tabs trong cùng workspace, ưu tiên key family chung cho workspace rồi tách sub-key theo tab.
- Đừng invalidate toàn bộ admin cache sau mỗi mutation. Chỉ invalidate workspace bị ảnh hưởng và dashboard/status widgets có dependency thật.
- Nếu API route group chưa tồn tại đủ chi tiết, đây là dấu hiệu phải quay lại `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` hoặc use-case owner doc trước khi scaffold UI.
- `/admin/he-thong` là container route trong shell, không phải feature folder riêng; scaffold page này như redirect/index page thay vì workspace data module.
- `/admin/he-thong/queue-ops` hiện chỉ tồn tại ở Phase 2+ architecture notes; chưa đủ canon trong inventory/mapping hiện hành nên không scaffold ở Wave 0-3.
