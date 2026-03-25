# PAGE_LOADER_CONTRACTS

File này chốt page-level data requirements cho các route public/member dễ bị over-fetch hoặc tự chế loader.
Nó là loader owner ở mức page aggregate; không thay route canon, UI journey, hay domain contracts.

> Route canon: `design/04-execution-overlay/web/PAGE_INVENTORY.md`
> User journeys: `design/04-execution-overlay/web/USER_FLOWS.md`
> API routes: `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`

---

## Rules

- Mỗi page loader phải có:
  - `required data`
  - `nice-to-have data`
  - `blocking dependencies`
  - `fallback state`
- Không fetch full detail DTO nếu page chỉ cần card/list shape.
- Grouped pages ưu tiên `1 primary aggregate loader + 0-2 auxiliary loaders`, không fan-out tự do.

## Public grouped routes

| Route pattern | Primary loader contract | Auxiliary loaders | Notes |
|---|---|---|---|
| `/niem-kinh` | `ChantHubPageDto` | `memberPracticeContext` nếu signed-in, `dailyGuideRefs` nếu chưa nằm trong aggregate | support hub, không chỉ chant library list |
| `/niem-kinh/luu-y-moi-truong-va-thoi-gian` | `ChantEnvironmentRulesPageDto` | `memberPracticeContext` nếu signed-in, `relatedGuideMiniList` | rule canon surface; không để page tự ráp từ FAQ/component demo |
| `/niem-kinh/[slug]` | `ChantItemDetailDto` | `practiceLogState` nếu signed-in, `relatedPlanMiniList` | item detail không được nhét full ritual flow |
| `/niem-kinh/nghi-thuc/[slug]` | `ChantRitualTemplateDetailDto` | `relatedPlanMiniList`, `trackerCtaState` nếu signed-in | ritual detail phải render stepper/card flow, không phải long-form article |
| `/niem-kinh/ke-hoach/[slug]` | `ChantPlanDetailDto` | `progressState` nếu signed-in, `relatedGuideMiniList` | plan detail là ordered composition surface |
| `/ngoi-nha-nho/[group]` | `GroupedContentLandingDto` | `relatedFaqHighlights`, `downloadPanel` nếu chưa nằm trong aggregate | không gọi full guide detail cho từng card |
| `/ngoi-nha-nho/[group]/[slug]` | `GroupedContentGuideDetailDto` | `trackerCtaState` nếu signed-in, `relatedGuidesMiniList` | summary/TOC/blocks phải đến từ 1 detail aggregate |
| `/kinh-bai-tap/[group]` | `GroupedContentLandingDto` | `scenarioPresetHighlights`, `downloadPanel` | không fetch toàn bộ preset content nếu chỉ cần highlights |
| `/kinh-bai-tap/[group]/[slug]` | `GroupedContentGuideDetailDto` | `scenarioPresetCard`, `trackerCtaState` | CTA thực hành là aux nhẹ, không block detail |
| `/huong-dan/phong-sanh/[slug]` | `GroupedContentGuideDetailDto` | `journalCtaState`, `relatedVariantsMiniList` | warnings/script blocks là primary payload |
| `/tim-kiem` | `SearchResultsPageDto` | `recentSearches` nếu signed-in, `suggestedQueries` nếu chưa nằm trong aggregate | engine, tabCounts, filterFacets phải đến từ primary payload |
| `/bach-thoai` | `WisdomHubDto` | `featuredEntries`, `filterFacets`, `tabCounts` | tab/filter state không được tự suy từ raw list |
| `/hoi-dap` | `WisdomHubDto` với `entryType=qa` | `filterFacets`, `tabCounts` | route riêng, không chung loader với `/bach-thoai` nếu semantics khác |
| `/bach-thoai/[slug]` | `WisdomDetailDto` | `audioCompanion`, `relatedEntriesMiniList` | Q&A không đi route này |
| `/hoi-dap/[slug]` | `WisdomDetailDto` specialized QA | `sourceScreenshotMeta`, `relatedEntriesMiniList` | phải hiện `sourceCode/timestamp` |

## Member routes

| Route pattern | Primary loader contract | Auxiliary loaders | Notes |
|---|---|---|---|
| `/dashboard` | `MemberDashboardDto` | `advisorySummary` nếu chưa nằm trong aggregate, `recentPracticeState` nếu đang phase-gated tách route | không để page tự gọi rời calendar + engagement + vows + notifications rồi ghép trong component |
| `/ngoai-tuyen` | `OfflineBundleListPageDto` | `syncSummary`, `pendingDeltaBadge` | page cần pagination + sync badge strategy rõ |
| `/thong-bao` | `NotificationPreferencesPageDto` | `pushCapabilityStatus`, `eventReminderState` nếu chưa nằm trong aggregate | empty/error/loading states phải map từ loader result |
| `/lich-ca-nhan` | `PersonalPracticeCalendarPageDto` | `advisoryCards`, `reminderSummary` | advisory summary là primary, event snippets là aux |

## Admin operational routes

| Route pattern | Primary loader contract | Auxiliary loaders | Notes |
|---|---|---|---|
| `/admin/dashboard` | `AdminDashboardPageDto` | `recentAuditMiniList`, `pendingModerationMiniList` nếu chưa nằm trong aggregate | không để admin home tự fan-out 4 panel không owner |
| `/he-thong/health` | `AdminSystemHealthExtendedDto` | `liveHealthStatus`, `metricsSummary` nếu phase-gated tách route | health admin page là operational aggregate, không log tail viewer |
| `/admin/he-thong/thong-bao` | `AdminNotificationOpsPageDto` | `deliveryHealthSummary`, `jobQueueMiniStats` nếu chưa nằm trong aggregate | queue health và subscription stats phải có owner aggregate rõ |

## Special notes

### `/niem-kinh`

`ChantHubPageDto` tối thiểu phải có:
- `entryCards[]`
- `ritualTemplates[]`
- `chantItems[]`
- `chantPlans[]`
- `faqHighlights[]`
- `guideRefs[]`

Rules:
- route này là support hub, không phải chỉ data dump của chant items.
- user mới phải nhìn thấy đường đi `guide -> nghi thức -> thực hành`, không phải tự mò từ library.
- nếu signed-in mới có personalized context thì phần đó là aux non-blocking.

### `/niem-kinh/nghi-thuc/[slug]`

`ChantRitualTemplateDetailDto` tối thiểu phải có:
- `summary`
- `preparationChecklist[]`
- `steps[]`
- `conditionalRules[]`
- `relatedChantItems[]`
- `nextRoutes[]`

Rules:
- FE phải render được stepper và step cards chỉ từ aggregate payload.
- không parse từ raw markdown/article body để tự suy ra step types.
- `thắp tâm hương` phải hiển thị rõ `quán tưởng`, `niệm thầm`, `lạy`, `số biến`.

### `/niem-kinh/luu-y-moi-truong-va-thoi-gian`

`ChantEnvironmentRulesPageDto` tối thiểu phải có:
- `intro`
- `groupCards[]`
- `groups[]`
- `quickChecklist`
- `specialLocationHighlights[]`
- `referenceOnlyCautions[]`
- `relatedGuideRefs[]`

Rules:
- page này là canon rule surface, không phải một bài FAQ dài.
- FE không tự merge content từ `DailyRecitationQA.tsx`, `ChantingNotesSection.tsx`, hay note rời.
- `referenceOnlyCautions[]` không được biến thành calculator/auto-interpretation UX.
- tracker và grouped guides chỉ được reuse snippets/cards từ aggregate này hoặc group route tương ứng.

### `/niem-kinh/ke-hoach/[slug]`

`ChantPlanDetailDto` tối thiểu phải có:
- `estimatedDurationMinutes`
- `entryRequirements[]`
- `orderedSections[]`
- `relatedRitualTemplate?`
- `nextActions[]`

Rules:
- nếu plan có ritual mở đầu, page chỉ ref ritual template card/detail owner, không duplicate toàn bộ flow.
- CTA sang tracker hoặc guide phải mang context, không link trần.

### `/dashboard`

`MemberDashboardDto` tối thiểu phải có:
- `todayLunar`
- `advisorySummary`
- `quickActions[]`
- `practiceSummary`
- `activeVowsSummary`
- `onboardingState`
- `notificationSummary`

Rules:
- page này phải dùng aggregate read profile rõ; không cho RSC tự ghép mù từ nhiều modules không có owner.
- bootstrap owner route là `GET /dashboard`; auxiliary loader chỉ tồn tại cho section phase-gated đã được canon hóa riêng.
- onboarding banner state phải nằm trong aggregate hoặc aux owner rõ; không hardcode ở client.

### `/ngoai-tuyen`

`OfflineBundleListPageDto` tối thiểu phải có:
- `items[]`
- `pagination`
- `syncSummary`
- `hasMore`

Mỗi item:
- `publicId`
- `bundleType`
- `version`
- `freshnessStatus`
- `syncBadge`
- `downloadSize`
- `lastUpdatedAt`

Rules:
- list page không được fetch full manifest của mọi bundle.
- `pendingDeltaBadge` phải là aggregate page signal, không bắt client loop qua từng bundle status để tự đếm.

### `/thong-bao`

`NotificationPreferencesPageDto` tối thiểu phải có:
- `capability`
- `subscriptionState`
- `categoryPreferences[]`
- `practiceReminder`
- `eventReminder`
- `conflicts[]`
- `lastEvaluatedAt`

Rules:
- page chỉ có `1 primary aggregate loader`; không tách riêng 4 request chỉ để lấy capability, prefs, practice, event.
- nếu push chưa support hoặc permission bị deny, aggregate vẫn phải trả state đầy đủ để UI render warning + CTA phù hợp.
- `conflicts[]` chỉ chứa projected codes:
  - `push_flag_disabled`
  - `worker_inactive`
  - `permission_denied`
  - `subscription_missing`
  - `delivery_degraded`
- member page không gọi job history hoặc per-delivery log.
- auxiliary loader chỉ được dùng khi event reminder state bị phase-gated tách route; nếu không thì phải gộp vào aggregate.

### `/bach-thoai` và `/hoi-dap`

- hub page cần `tabCounts` và `filterFacets` riêng
- không để client tự quét toàn bộ list rồi đếm
- response aggregate phải echo `engine` đang dùng để UI/search badge không đoán
- phase hiện tại dùng `offset pagination` cho 2 hub này; nếu đổi sang cursor phải cập nhật cùng lúc:
  - [API_DTO_SHAPE_PLAN.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md)
  - file này
  - route owner trong [API_ROUTE_INVENTORY.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/04-execution-overlay/api/API_ROUTE_INVENTORY.md)

### `/tim-kiem`

`SearchResultsPageDto` tối thiểu phải có:
- `query`
- `appliedFilters`
- `items[]`
- `pagination`
- `tabCounts`
- `filterFacets`
- `engine`

Rules:
- page này dùng `1 primary aggregate loader`; không tách `search results`, `tab counts`, `filter facets`, `engine status` thành nhiều request tự ghép.
- query guard reject state phải map từ aggregate/API error code, không để client tự suy từ URL input.
- nếu signed-in mới có `recentSearches`, đó là aux không-blocking.

### `/lich-ca-nhan`

`PersonalPracticeCalendarPageDto` tối thiểu phải có:
- `todayLunar`
- `advisorySummary`
- `calendarDays[]`
- `upcomingEvents[]`
- `reminderSummary`
- `activeVowReminders[]`

Rules:
- page aggregate không được nhét full event detail hay full vow detail.
- month grid cell chỉ dùng lightweight day projection, không preload advisory detail cho mọi ngày.

### Member auth freshness rule

- các page `member+` phải xác nhận auth state còn hợp lệ trước khi compose aggregate dữ liệu nhạy cảm
- nếu session hết hạn hoặc permission state stale trước bootstrap, page phải fail về auth path chuẩn thay vì render cached partial member state
- member page không được render aggregate cũ rồi chờ aux request mới phát hiện `401`
- auth authority vẫn nằm ở `apps/api`; page loader không tự xác minh session bằng heuristic riêng ở web tier
- loader chỉ được làm 2 việc:
  - gọi aggregate route với auth context chuẩn
  - map `401/403` về redirect hoặc auth state UI canon
- không cho page component tự cài silent-refresh logic riêng ngoài auth layer owner

### `/he-thong/health`

`AdminSystemHealthExtendedDto` tối thiểu phải có:
- `uptime`
- `memoryUsageMb`
- `cpuUsagePercent`
- `diskUsagePercent`
- `dbConnectionCount`
- `featureFlagsCount`
- `recentErrors[]`

Rules:
- page này không phải raw log explorer; `recentErrors[]` chỉ là safe projection
- degraded panel phải map từ payload aggregate, không gọi thêm raw log endpoint để tự diễn giải lỗi
- nếu health aggregate fail, page hiển thị operational failure state; không fallback sang từng probe request riêng lẻ

## Scaffold rule

Khi scaffold `apps/web`:

1. tạo page loader theo contract ở file này
2. map mỗi loader sang 1-3 API calls tối đa
3. nếu vượt quá, quay lại bổ sung aggregate route trước khi code tiếp

## Loader execution matrix

Bảng này chốt thêm `execution contract` cho các page P0 để web không tự phát minh fetch policy.

| Route pattern | Max API calls ở page bootstrap | Auth mode | Cache / revalidation expectation | Error-state owner |
|---|---|---|---|---|
| `/dashboard` | `1 primary + tối đa 2 aux` | required member session | primary aggregate phải là `no-store` hoặc equivalent member-private fetch; aux chỉ cho phần phase-gated | aggregate loader map `unauthorized`, `degraded`, `empty-first-visit` |
| `/ngoai-tuyen` | `1 primary + tối đa 1 aux` | required member session | primary list dùng member-private fetch; delta/pending badge không được polling vô hạn khi chưa có explicit sync action | aggregate loader map `unauthorized`, `sync-degraded`, `empty-library` |
| `/thong-bao` | `1 primary`, aux chỉ khi phase-gated | required member session | capability + prefs + reminders phải bootstrap cùng lúc; không split thành nhiều request song song trong page | aggregate loader map `unsupported`, `permission-denied`, `degraded`, `empty-preferences` |
| `/lich-ca-nhan` | `1 primary + tối đa 2 aux` | required member session | month aggregate phải ổn định theo `month` param; chuyển tháng mới được phép refetch | aggregate loader map `month-invalid`, `degraded`, `empty-calendar` |
| `/tim-kiem` | `1 primary + tối đa 1 aux` | public, signed-in optional | primary search aggregate là source of truth cho `items`, `tabCounts`, `filterFacets`, `engine`; aux `recentSearches` phải non-blocking | aggregate loader map `query-invalid`, `too-short`, `engine-fallback`, `empty-results` |
| `/bach-thoai` | `1 primary + tối đa 2 aux` | public | primary hub aggregate owns tab/filter counts; aux chỉ cho featured cards hoặc decorations không-blocking | aggregate loader map `empty-hub`, `filter-invalid`, `engine-fallback` |
| `/hoi-dap` | `1 primary + tối đa 2 aux` | public | không dùng chung bootstrap loader với `/bach-thoai` nếu route semantics khác; filter/tab state phải đến từ QA aggregate | aggregate loader map `empty-hub`, `filter-invalid`, `engine-fallback` |

`Auth mode` trong bảng trên phải map thẳng về auth scope canon của `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`:

- `required member session` = `member+`
- `public, signed-in optional` = primary route `public`, optional personalization aux vẫn phải tôn trọng scope owner riêng
- nếu một page cần `browser session` hoặc `admin+`, phải ghi đúng literal đó thay vì mô tả tự do

## Loader composition freeze rules

- Không page nào trong file này được gọi trực tiếp quá `3` API surfaces ở bootstrap nếu chưa mở row aggregate mới ở `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`.
- Nếu page cần signed-in personalization nhưng route vẫn public, phần personalization phải là aux non-blocking và không được làm thay đổi shape primary payload.
- Loader không được vừa fetch aggregate DTO vừa fetch lại detail/list cùng owner chỉ để client tự merge.
- Query keys ở web phải đi theo `primary payload sections`, không đi theo từng component con tự nghĩ.
- Một page có `degraded` state phải render được từ payload aggregate mà không cần request bổ sung để hiểu lỗi.

## Error-state ownership principle

- Primary aggregate API route phải trả đủ state để page render `loading -> success`, `empty`, `unauthorized`, `invalid-input`, `degraded`.
- Page loader chỉ map từ aggregate payload/error envelope sang render state; không được gọi thêm request bonus để "hiểu lỗi".
- Page component chỉ render theo state mà loader đã chuẩn hóa; component không là nơi tự diễn giải `401`, `429`, `engine-fallback`, hay `permission-denied`.
- Nếu một warning/degraded state chỉ ảnh hưởng 1 section, aggregate payload vẫn phải trả phần còn lại đủ để page render partial success.
- Nếu page chưa render được chỉ bằng aggregate payload + canonical error envelope, contract hiện tại bị coi là chưa đóng.
- admin operational pages cũng theo rule này; không dùng extra debug call để tự bù contract còn thiếu.

## Query-key ownership principle

- Primary aggregate payload sở hữu root query key theo route, ví dụ: `['dashboard']`, `['notifications-preferences']`, `['search', normalizedQuery]`.
- Auxiliary loader chỉ được có query key riêng khi nó thực sự là route độc lập và không nằm trong primary payload.
- Nếu section đã nằm trong primary DTO, không tạo aux query key chỉ để phục vụ component con.
- Invalidation ưu tiên root key của aggregate trước; aux key chỉ invalidate riêng khi aux route tồn tại độc lập trong inventory.

## E2E page acceptance checklist

Trước khi coi một page contract là đủ để vào implementation:

1. có `route row` canon ở `design/04-execution-overlay/web/PAGE_INVENTORY.md`
2. có `primary loader contract` trong file này
3. có `DTO owner row` trong `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`
4. có `API route owner` trong `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
5. có `error-state mapping` đủ cho loading, empty, unauthorized, degraded, invalid-input
6. nếu là member/admin page, đã chốt auth expectation và cache mode

Nếu thiếu bất kỳ item `2-4`, page bị coi là `blocked at design level`.
Không được bỏ qua checklist để code tiếp; phải bổ sung owner row hoặc mở doc task trước.

Tối thiểu phải chốt được `error code -> render strategy` cho page P0, ví dụ:

- route nào trả error code đó
- page fail toàn phần hay chỉ degrade 1 section
- banner/empty state/redirect/retry CTA nào là canonical
