# PAGE_LOADER_CONTRACTS

File này chốt `page-level data requirements` cho các route public/member dễ bị over-fetch hoặc tự chế loader.

Mục tiêu:

- scaffold RSC loaders cho `apps/web` mà không đoán
- giữ page data shape ổn định giữa `PAGE_INVENTORY`, `USER_FLOWS`, và API layer
- chặn việc một page tự gọi quá nhiều endpoints không có owner

> Route canon: `ui/PAGE_INVENTORY.md`
> User journeys: `ui/USER_FLOWS.md`
> API routes: `tracking/api-route-inventory.md`

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

## Special notes

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
- nếu API chưa có aggregate route riêng, composition tạm thời vẫn không được vượt `3` calls.
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

## Scaffold rule

Khi scaffold `apps/web`:

1. tạo page loader theo contract ở file này
2. map mỗi loader sang 1-3 API calls tối đa
3. nếu vượt quá, quay lại bổ sung aggregate route trước khi code tiếp
