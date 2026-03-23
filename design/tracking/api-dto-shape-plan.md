# API_DTO_SHAPE_PLAN

File này chốt `field picks` mức scaffold cho DTO response/request ở các surface dễ bị code tay theo cảm tính.

Mục tiêu:

- giảm guesswork khi scaffold `apps/api`
- buộc controller/query layer không tự bịa `select` shape
- làm cầu nối giữa `contracts.md`, `api-route-inventory.md`, và admin/page specs

> Route canon: `tracking/api-route-inventory.md`
> Admin mapping: `tracking/admin-page-api-mapping.md`
> Query plan: `tracking/admin-feature-query-plan.md`

---

## Rules

- DTO ở file này là `scaffold-level picks`, không thay domain contracts.
- `public list`, `public detail`, `admin list`, `admin detail` phải tách riêng.
- Không trả raw DB columns không có nghĩa ở client.
- `internal ids`, checksum thô, secret flags, moderation internals không được lộ vào public DTO.
- Nếu route chưa có row ở file này, controller không được tự chọn field theo cảm tính; phải bổ sung owner row trước.

## Route family picks

| Route family | DTO profile | Required fields | Notes |
|---|---|---|---|
| public editorial list | `PublicContentListItemDto` | `publicId`, `slug`, `title`, `excerpt`, `thumbnail`, `publishedAt`, `tags[]`, `categoryLabel`, `readingTimeMinutes` | dùng cho `/content/posts`, `/bai-viet` |
| public editorial detail | `PublicContentDetailDto` | list item fields + `bodyHtml`, `seoTitle`, `seoDescription`, `breadcrumbs[]`, `relatedItems[]` | không leak moderation/editor notes |
| grouped content landing | `GroupedContentLandingDto` | `groupKey`, `title`, `intro`, `summaryBlocks[]`, `guideCards[]`, `faqHighlights[]`, `downloads[]`, `primaryCta` | dùng cho `Little House`, `Daily Practice`, `Life Release` group pages |
| grouped content guide detail | `GroupedContentGuideDetailDto` | `publicId`, `slug`, `groupKey`, `title`, `summaryBox`, `toc[]`, `contentBlocks[]`, `warnings[]`, `faq[]`, `downloads[]`, `prevNext` | block anatomy phải ổn định cho RSC |
| public search result item | `SearchResultItemDto` | `publicId`, `docType`, `entryType?`, `sourceFamily?`, `title`, `excerpt`, `href`, `publishedAt?`, `highlight?` | shared shape cho `/search`, `/tim-kiem`, wisdom-aware search cards |
| public search results page | `SearchResultsPageDto` | `query`, `appliedFilters`, `items[]`, `pagination`, `tabCounts`, `filterFacets`, `engine`, `suggestedQueries[]` | owner cho `/tim-kiem`; không để client tự đếm/tabulate từ raw list |
| wisdom list | `WisdomListItemDto` | `publicId`, `slug`, `entryType`, `sourceFamily`, `titleVietnamese`, `summaryVietnamese`, `sourceCode`, `publishedAt`, `hasAudio` | không đưa full original text vào list |
| wisdom hub page | `WisdomHubDto` | `items[]`, `pagination`, `activeTab`, `tabCounts`, `filterFacets`, `featuredEntries[]`, `searchScope`, `engine` | owner cho `/bach-thoai` và `/hoi-dap` |
| wisdom detail | `WisdomDetailDto` | list item fields + `titleOriginal`, `translatedText`, `rawOriginalText?`, `sourceUrl`, `sourceAttribution`, `keywordAliases[]`, `relatedEntries[]` | `question/answer` pair chỉ hiện khi `entryType = qa` |
| member dashboard page | `MemberDashboardDto` | `todayLunar`, `advisorySummary`, `quickActions[]`, `practiceSummary`, `activeVowsSummary`, `onboardingState`, `notificationSummary` | owner cho `/dashboard`; không để web tự fan-out mù qua 4 module |
| auth session state | `AuthSessionStateDto` | `user`, `session`, `permissions`, `mustRefreshBefore`, `requiresEmailVerification`, `securityFlags[]` | owner cho `/auth/me` và auth bootstrap surfaces; không trả raw refresh token |
| signed upload response | `SignedUploadResponseDto` | `publicId`, `uploadUrl`, `uploadMethod`, `expiresAt`, `expectedPublicUrl`, `allowedMimeTypes[]`, `maxBytes` | owner cho signed upload/register flow; `uploadUrl` short-TTL, không cache ở client |
| offline bundle list | `OfflineBundleListItemDto` | `publicId`, `bundleType`, `scope`, `version`, `freshnessStatus`, `lastRebuiltAt`, `downloadSize`, `syncStatus` | cho `/ngoai-tuyen` |
| offline bundle list page | `OfflineBundleListPageDto` | `items[]`, `pagination`, `syncSummary`, `pendingDeltaBadge`, `hasMore` | page aggregate cho `/ngoai-tuyen` |
| offline bundle delta response | `OfflineBundleDeltaResponseDto` | `bundleId`, `bundleName`, `fromVersion`, `toVersion`, `isFullSync`, `added[]`, `updated[]`, `deletedIds[]`, `totalEntries`, `generatedAt` | owner cho `/offline-bundles/:publicId/delta` |
| member notification preferences page | `NotificationPreferencesPageDto` | `capability`, `subscriptionState`, `categoryPreferences[]`, `practiceReminder`, `eventReminder`, `conflicts[]`, `lastEvaluatedAt` | owner cho `/thong-bao`; page settings surface, không phải inbox |
| personal practice calendar page | `PersonalPracticeCalendarPageDto` | `todayLunar`, `advisorySummary`, `calendarDays[]`, `upcomingEvents[]`, `reminderSummary`, `activeVowReminders[]` | owner cho `/lich-ca-nhan`; không nhét full event detail vào page aggregate |
| admin table common | `AdminTableRowDto` | `publicId`, `status`, `createdAt`, `updatedAt`, `lastModifiedBy?` | base shape cho tables |
| admin search status | `AdminSearchStatusDto` | `requestedEngine`, `actualEngine`, `indexFreshnessSeconds`, `documentCount`, `pendingJobs`, `lastSuccessfulReindexAt`, `meiliHealth`, `sqlFallbackAvailable`, `bootstrapFallbackActive` | owner cho `/admin/search/status` và `operational-status` |
| admin search indexing job | `AdminSearchIndexingJobDto` | `publicId`, `source`, `triggerType`, `status`, `startedAt`, `finishedAt`, `durationMs`, `rowsIndexed`, `rowsDeleted`, `actorUserId?`, `requestId?`, `errorSummary?` | không nhét raw logs vào DTO detail |
| admin search fallback event | `AdminSearchFallbackEventDto` | `occurredAt`, `requestedEngine`, `actualEngine`, `reason`, `route`, `queryHash`, `durationMs`, `userAgentClass`, `requestId` | không expose raw query text |
| admin push subscription stats | `AdminPushSubscriptionStatsDto` | `activeCount`, `inactiveCount`, `newSubscriptionsLast30d[]`, `browserBreakdown[]`, `lastAggregatedAt`, `deliveryHealthSummary` | aggregate-only cho tab subscriptions của admin notifications |
| admin dashboard page | `AdminDashboardPageDto` | `systemSummary`, `pendingModeration`, `recentAuditEvents[]`, `contentOpsSummary`, `searchOpsSummary?` | owner cho `/admin/dashboard`; không để admin home tự ghép nhiều panel vô chủ |
| admin notification ops page | `AdminNotificationOpsPageDto` | `pushStatus`, `subscriptionStats`, `jobQueueSummary`, `recentJobs[]`, `deliveryHealthSummary` | owner cho `/admin/he-thong/thong-bao`; jobs/subscription stats phải cùng vocabulary |
| admin system health extended | `AdminSystemHealthExtendedDto` | `uptime`, `memoryUsageMb`, `cpuUsagePercent`, `diskUsagePercent`, `dbConnectionCount`, `featureFlagsCount`, `recentErrors[]` | owner cho `/admin/system/health-extended`; `recentErrors[]` chỉ là safe projection |
| admin moderation report detail | `AdminModerationReportDetailDto` | `publicId`, `status`, `reasonCode`, `reporterSummary`, `targetType`, `targetPreview`, `createdAt`, `decisionHistory[]`, `currentDecisionOptions[]` | giảm blind scaffold ở moderation |
| admin audit-log detail | `AdminAuditLogDetailDto` | `publicId`, `actorSummary`, `action`, `resourceType`, `resourcePublicId`, `occurredAt`, `metadata`, `correlationId`, `requestId` | `metadata` phải qua safe projection |
| admin wisdom import job detail | `AdminWisdomImportJobDetailDto` | `publicId`, `jobType`, `providerProfile`, `sourceFamily`, `status`, `candidateSlug`, `dedupeStatus`, `resultEntryPublicId?`, `errorSummary?`, `createdAt`, `updatedAt` | lấp gap import workspace |

## Projection notes

### `AdminModerationReportDetailDto`

- `reporterSummary` chỉ gồm field an toàn:
  - `publicId`
  - `displayNameMasked`
  - `role`
- `targetPreview` là rendered summary, không phải raw storage row.
- `decisionHistory[]` tối thiểu gồm:
  - `decisionAt`
  - `decisionBy`
  - `decisionType`
  - `reasonCode`
  - `noteSafe`
- `currentDecisionOptions[]` phải là explicit action ids, không để UI tự bịa button matrix.

### `AdminModeratedCommentDetailDto`

Dùng khi route canon moderation comment detail được scaffold:

- `publicId`
- `parentType`
- `parentPublicId`
- `authorSummary`
- `bodyRendered`
- `visibilityStatus`
- `reportCount`
- `latestReportReasonCode`
- `moderationSummary`
- `createdAt`
- `updatedAt`
- `availableActions[]`

**Rules**:
- không trả raw HTML chưa sanitize
- không trả IP/raw abuse internals vào comment detail
- action availability phải đến từ backend policy projection

### `AdminAuditLogDetailDto`

- `metadata` phải đi qua allowlist/projection theo action family.
- không trả nguyên record nếu chứa field nhạy cảm như token/session/ip thô.
- `actorSummary` tối thiểu:
  - `publicId`
  - `displayNameMasked`
  - `role`
- `metadata` allowlist gợi ý:
  - moderation: `reasonCode`, `decisionType`, `targetType`, `targetPublicId`
  - search: `requestedEngine`, `actualEngine`, `reason`
  - deploy/control-plane: `artifactId`, `commitSha`, `migrationRevision`

### `AdminSearchStatusDto`

- `requestedEngine` và `actualEngine` là bắt buộc để admin không hiểu sai.
- `actualEngine` có thể là:
  - `sql`
  - `meilisearch`
  - `sql-fallback`

### `AdminDashboardPageDto`

- `systemSummary` tối thiểu:
  - `healthStatus`
  - `pendingAlertsCount`
  - `openIncidentsCount?`
- `pendingModeration` chỉ là summary cards hoặc mini-list, không trả full report detail
- `recentAuditEvents[]` dùng safe mini projection:
  - `occurredAt`
  - `action`
  - `resourceType`
  - `actorSummary`
- `contentOpsSummary` và `searchOpsSummary?` là aggregate panels, không phải raw ops tables

### `AdminNotificationOpsPageDto`

- `pushStatus` tối thiểu:
  - `pushEnabled`
  - `deliveryHealth`
  - `workerState`
- `subscriptionStats` dùng `AdminPushSubscriptionStatsDto`
- `jobQueueSummary` tối thiểu:
  - `pendingCount`
  - `processingCount`
  - `failedCount`
- `recentJobs[]` là mini-list hoặc snippet; detail route mới được trả full job detail
- không trả raw payload của notification delivery job trong page aggregate

### `SearchResultItemDto`

- `docType` canonical values tối thiểu:
  - `post`
  - `wisdom_entry`
  - `qa_entry`
  - `guide`
  - `sutra`
  - `chant_item`
- `highlight?` chỉ là safe rendered snippet; không trả raw engine payload.
- `href` phải là canonical public route; client không tự ráp từ `docType`.

### `SearchResultsPageDto`

- `query` tối thiểu:
  - `q`
  - `normalizedQ`
- `appliedFilters` tối thiểu:
  - `type?`
  - `entryType?`
  - `sourceFamily?`
- `pagination` tối thiểu:
  - `limit`
  - `offset`
  - `hasMore`
  - `totalApproximate?`
- `tabCounts` là projected counts theo result family, không để client tự đếm:
  - `all`
  - `content`
  - `wisdom`
  - `qa`
- `filterFacets` là safe projections:
  - `entryTypes[]`
  - `sourceFamilies[]`
  - `docTypes[]`
- `engine` canonical values:
  - `sql`
  - `meilisearch`
  - `sql-fallback`
- `suggestedQueries[]` là optional UX helper; không block page.

### `NotificationPreferencesPageDto`

- `capability` tối thiểu:
  - `pushSupported`
  - `permissionState`
  - `serviceWorkerReady`
  - `deliveryHealth`
- `subscriptionState` tối thiểu:
  - `isSubscribed`
  - `subscriptionPublicId?`
  - `subscribedAt?`
  - `lastConfirmedAt?`
- `categoryPreferences[]` tối thiểu:
  - `categoryKey`
  - `label`
  - `enabled`
  - `channel`
  - `lockedReason?`
- `practiceReminder` và `eventReminder` tối thiểu:
  - `enabled`
  - `scheduleSummary`
  - `timezone`
  - `degradedReason?`
- `conflicts[]` là projected conflict codes, không phải raw worker/internal errors.
- `deliveryHealth` canonical values:
  - `healthy`
  - `degraded`
  - `disabled`
  - `unsupported`
- `permissionState` canonical values:
  - `granted`
  - `denied`
  - `default`
  - `unsupported`

### `AuthSessionStateDto`

- `user` tối thiểu:
  - `publicId`
  - `emailMasked`
  - `displayName`
  - `role`
- `session` tối thiểu:
  - `sessionPublicId`
  - `expiresAt`
  - `lastRotatedAt?`
- `permissions` là safe projection:
  - `canAccessMemberRoutes`
  - `canAccessAdminRoutes`
  - `canUploadMedia`
- `securityFlags[]` canonical values:
  - `email_unverified`
  - `password_reset_required`
  - `session_refresh_due`
- không bao giờ trả refresh token, session secret, hoặc internal device fingerprint.

### `SignedUploadResponseDto`

- `uploadUrl` là signed URL ngắn hạn; không log, không persist vào client cache, không nhúng vào analytics.
- `uploadMethod` canonical values:
  - `PUT`
  - `POST`
- `expectedPublicUrl` chỉ là projected public path sau finalize; chưa coi asset là public-live cho tới khi finalize thành công.
- `allowedMimeTypes[]` và `maxBytes` phải echo policy server-side để client không tự đoán.
- error companion tối thiểu:
  - `storage.signed_url_expired`
  - `storage.signed_url_invalid`
  - `storage.upload_finalize_failed`
  - `storage.root_unavailable`

### `MemberDashboardDto`

- `todayLunar` tối thiểu:
  - `lunarLabel`
  - `specialDayBadge?`
- `advisorySummary` tối thiểu:
  - `headline`
  - `recommendedSequence[]`
  - `sourceRefs[]`
- `quickActions[]` là explicit actions:
  - `start_practice`
  - `open_calendar`
  - `open_vows`
  - `open_notifications`
- `practiceSummary` tối thiểu:
  - `lastPracticeAt?`
  - `todayCompletionState`
  - `streakSummary?`
- `activeVowsSummary` tối thiểu:
  - `activeCount`
  - `nextMilestoneLabel?`
- `onboardingState` tối thiểu:
  - `isFirstVisit`
  - `showOnboardingBanner`
  - `nextRecommendedRoute`
- `notificationSummary` chỉ là aggregate state:
  - `pushCapability`
  - `practiceReminderEnabled`
  - `eventReminderEnabled`

### `AdminSystemHealthExtendedDto`

- `recentErrors[]` chỉ gồm:
  - `occurredAt`
  - `module`
  - `action`
  - `errorCode`
  - `requestId`
- không trả raw stack trace, token, cookie, hoặc payload metadata chưa sanitize.
- `dbConnectionCount`, `pendingOutboxCount?`, `queueDepths?` là operational counters; không dùng field name mơ hồ kiểu `healthData`.

### `WisdomHubDto`

- `items[]` dùng `WisdomListItemDto`, không trả full detail body.
- `activeTab` canonical values:
  - `btpp`
  - `qa`
  - `khai-thi`
  - `sach-noi`
- `tabCounts` không được derive ở client.
- `filterFacets` tối thiểu:
  - `entryTypes[]`
  - `sourceFamilies[]`
  - `tags[]`
- `featuredEntries[]` chỉ là mini cards, không duplicate full list payload.
- `searchScope` canonical values:
  - `wisdom_hub`
  - `qa_hub`
- `engine` phải echo actual retrieval engine để hub/search UI không đoán.

### `OfflineBundleListPageDto`

- `syncSummary` tối thiểu:
  - `upToDateCount`
  - `outdatedCount`
  - `downloadingCount`
- `pendingDeltaBadge` tối thiểu:
  - `hasPendingUpdates`
  - `pendingBundleCount`
- không trả full bundle manifest của từng item trong list page.
- `pagination` canonical shape tối thiểu:
  - `cursor?`
  - `nextCursor?`
  - `pageSize`
  - `hasMore`
- member list page ưu tiên cursor semantics; không mặc định offset nếu chưa có measured need.

### `OfflineBundleDeltaResponseDto`

- `added[]` và `updated[]` dùng cùng một stable `OfflineEntryDto`:
  - `publicId`
  - `entryType`
  - `entryVersion`
  - `title`
  - `translatedText`
  - `tags[]`
  - `sourceUrl?`
  - `audioUrl?`
- `deletedIds[]` chỉ chứa canonical entry `publicId`.
- nếu server buộc full sync thay vì incremental delta, response vẫn giữ shape này với `isFullSync: true`.
- route error companion codes tối thiểu:
  - `wisdom.offline.version_stale`
  - `wisdom.offline.bundle_not_found`
  - `wisdom.offline.device_fingerprint_required`

### `PersonalPracticeCalendarPageDto`

- `calendarDays[]` chỉ chứa page-cell projection:
  - `date`
  - `lunarLabel`
  - `hasAdvisory`
  - `hasReminder`
  - `hasEvent`
- `upcomingEvents[]` là snippet:
  - `publicId`
  - `slug`
  - `title`
  - `startsAt`
  - `ctaLabel?`
- `activeVowReminders[]` là summary:
  - `vowPublicId`
  - `label`
  - `dueHint`

## Readiness note

File này không thay Zod schema runtime.
Khi scaffold thật:

1. `packages/shared` tạo schema theo profile này
2. controller/service dùng `select`/projection bám profile
3. admin/web query layer không tự mở rộng field ngoài owner row

## Contract closure requirements

Ba route family sau là `P0 anti-invention surface`.
Không được coi là đủ để scaffold nếu mới chỉ có tên DTO mà chưa đóng đủ `request + response + error + projection owner`.

| Route family | Required request contract | Required response contract | Required error companion | Projection owner note |
|---|---|---|---|---|
| member dashboard aggregate | query params chỉ được gồm `tz?`, `today?`, `includeOnboarding?`; default: `tz = user setting hoặc server fallback`, `today = server current date`, `includeOnboarding = false` | `MemberDashboardDto` với section-level ownership rõ cho `todayLunar`, `advisorySummary`, `practiceSummary`, `activeVowsSummary`, `notificationSummary` | `identity.unauthorized`, `dashboard.aggregate_unavailable`, `calendar.advisory_unavailable` | `apps/api` phải có 1 aggregate read owner; web không được tự compose mù từ nhiều module |
| notification preferences aggregate | body/query không được tách capability check thành route riêng cho page bootstrap | `NotificationPreferencesPageDto` + `capability`, `subscriptionState`, `categoryPreferences[]`, `practiceReminder`, `eventReminder`, `conflicts[]` | `identity.unauthorized`, `notification.push_not_supported`, `notification.preferences_degraded`, `notification.subscription_missing` | projection owner là notification module; không cho web tự merge prefs + capability + reminder health |
| search results aggregate | query params tối thiểu: `q`, `tab?`, `docType?`, `entryType?`, `sourceFamily?`, `cursor?`, `limit?`; default: `tab = all`, `limit = route default`, không tự thêm hidden filter | `SearchResultsPageDto` + stable `SearchResultItemDto[]`, `tabCounts`, `filterFacets`, `engine`, `pagination` | `search.query_invalid`, `search.query_too_short`, `search.engine_unavailable`, `search.cursor_invalid` | search module phải trả canonical `href`, `engine`, `tabCounts`; client không được derive |
| offline bundle list page | query params tối thiểu: `cursor?`, `pageSize?`, `freshnessStatus?`; default: first page nếu thiếu `cursor`, canonical page size từ route owner, `freshnessStatus = all` | `OfflineBundleListPageDto` + `items[]`, `pagination`, `syncSummary`, `pendingDeltaBadge`, `hasMore` | `identity.unauthorized`, `offline.bundle_list_unavailable`, `offline.sync_degraded` | owner là offline bundle aggregate read; page không loop qua từng bundle detail để tự tính badge |
| personal practice calendar page | query params tối thiểu: `month`, `tz?`; `month` là bắt buộc, `tz` default theo user setting hoặc server fallback | `PersonalPracticeCalendarPageDto` + `calendarDays[]`, `upcomingEvents[]`, `reminderSummary`, `activeVowReminders[]` | `identity.unauthorized`, `calendar.month_invalid`, `calendar.aggregate_unavailable` | calendar module là owner của month grid projection; không preload advisory detail cho từng ngày |

### Route inventory dependency

Các row `P0 anti-invention surface` ở trên không được đứng riêng.
Mỗi row phải map được sang route canon hiện có trong `tracking/api-route-inventory.md` hoặc phải chặn scaffold cho tới khi inventory được bổ sung:

- member dashboard aggregate -> cần route owner row rõ trong inventory trước khi scaffold rộng
- notification preferences aggregate -> hiện map vào `GET /notifications/preferences`
- search results aggregate -> hiện map vào `GET /search`
- offline bundle list page -> hiện map vào `GET /offline-bundles`
- personal practice calendar page -> hiện map vào `GET /calendar/personal-practice`

Nếu route inventory hiện có chưa đủ semantics aggregate cho DTO row tương ứng, phải cập nhật `api-route-inventory.md` trước; không được để controller hoặc web tự suy luận từ tên gần giống.

## DTO envelope rules

Các profile trong file này mặc định là `payload DTO`, nhưng P0 route family phải chốt thêm envelope semantics để FE/BE không đoán khác nhau:

- `GET page aggregate`:
  - response envelope tối thiểu: `data`, `meta.requestId`, `meta.generatedAt`
  - `meta` có thể thêm `engine`, `degraded`, `partialDataWarnings[]` nếu route family cần
- `list/search response`:
  - `pagination` phải nằm trong `data`, không nằm rải rác ở top-level tuỳ controller
  - nếu dùng cursor thì field canonical là `cursor`, `nextCursor`, `hasMore`
- `detail response`:
  - chỉ dùng `related*` mini-list hoặc summary card; không nhúng full sibling detail DTO
- `error response`:
  - phải dùng error envelope chuẩn của repo, và mỗi route family ở trên phải có error code canon riêng
  - page bootstrap route không được trả raw infra exception text

## Request-shape freeze rule

Khi một route family đã có row trong file này:

- không được tự thêm query param mới ở controller nếu chưa bổ sung row owner hoặc section tương ứng
- không được đổi pagination semantics từ `offset` sang `cursor` hoặc ngược lại mà không cập nhật file này
- không được để admin và web dùng cùng tên route nhưng shape filter khác nhau nếu chưa có note tách owner rõ ràng
- nếu route aggregate cần `include*` flag để phase-gate, phải ghi rõ default value và allowed values tại đây trước khi scaffold
