# API_DTO_SHAPE_PLAN

File này chốt DTO field picks mức scaffold cho các route family dễ bị code tay theo cảm tính.
Nó là cầu nối giữa domain contracts, route canon, và page/admin mapping; không thay domain contract detail.

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

## Projection safety baseline

### Safe projection (projection an toàn) mặc định được phép

- canonical public identity:
  - `publicId`
  - `slug`
- human-readable labels:
  - `title`
  - `summary`
  - `statusLabel`
- public timestamps:
  - `publishedAt`
  - `updatedAt`
- rendered/derived summaries:
  - `excerpt`
  - `highlight`
  - `targetPreview`
  - `actorSummary`

### Unsafe projection (projection không an toàn) mặc định bị cấm

- DB-only identity:
  - raw numeric id
  - internal UUID không public hóa
- raw internals:
  - unsanitized HTML
  - raw storage row
  - raw queue payload
  - raw Meilisearch payload
- security-sensitive fields:
  - token
  - refresh/session secret
  - checksum thô
  - secret flag
  - raw IP / device fingerprint
- moderation/abuse internals:
  - raw reporter notes
  - internal abuse heuristics
  - hidden review comments chưa qua allowlist

### Projection owner rule

- nếu UI chỉ cần hiển thị, backend phải trả `summary projection`, không đẩy raw nested row để client tự map.
- `availableActions[]`, `decisionOptions[]`, `lockedReason`, `visibilityStatus` là backend-owned policy projections.
- bất kỳ field nào cần sanitize/allowlist đều phải được chốt ở DTO owner row hoặc projection notes; không để controller tự quyết ở lúc scaffold.

## Pagination / filter / facet baseline

### Pagination defaults

- nếu route family chưa có lý do mạnh để dùng cursor, phải nói rõ đang dùng `offset`.
- nếu route family là member list hoặc sync-heavy list, ưu tiên `cursor`.
- pagination semantics là owner decision của route family; không được đổi giữa controller và web.

### Offset shape (hình dạng offset)

- `limit`
- `offset`
- `hasMore`
- `totalApproximate?`

### Cursor shape (hình dạng cursor)

- `cursor?`
- `nextCursor?`
- `pageSize`
- `hasMore`

### Filter / facet rule

- `appliedFilters` chỉ echo những filter canon được route owner cho phép; không echo hidden filter nội bộ.
- `filterFacets` là safe projections để render UI filter:
  - `key`
  - `label`
  - `options[]`
  - `optionCount?`
  - `selectionMode`
- admin filter rows và public filter rows có thể khác nhau, nhưng phải giữ cùng vocabulary nếu cùng nói về một dimension.
- client không được tự đếm `tabCounts` hoặc tự derive facet options từ raw list nếu DTO aggregate đã có field owner.

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
| chant hub page | `ChantHubPageDto` | `entryCards[]`, `ritualTemplates[]`, `chantItems[]`, `chantPlans[]`, `faqHighlights[]`, `guideRefs[]` | owner cho `/niem-kinh`; hub support surface, không chỉ generic list |
| chant environment rules page | `ChantEnvironmentRulesPageDto` | `intro`, `groupCards[]`, `groups[]`, `quickChecklist`, `specialLocationHighlights[]`, `referenceOnlyCautions[]`, `relatedGuideRefs[]` | owner cho `/niem-kinh/luu-y-moi-truong-va-thoi-gian`; rule canon surface |
| chant environment rule group | `ChantEnvironmentRuleGroupDto` | `groupKey`, `title`, `summary`, `severityLegend[]`, `rules[]`, `lastReviewedAt`, `versionNote?` | owner cho `/content/chanting/environment-rules/:groupKey`; không trả long-form blob |
| chant item detail | `ChantItemDetailDto` | `publicId`, `slug`, `title`, `summary`, `textBlocks[]`, `audioCompanion`, `recommendedCounts[]`, `timeRules[]`, `relatedRituals[]`, `relatedPlans[]` | owner cho `/niem-kinh/[slug]`; không embed full ritual flow |
| chant ritual template detail | `ChantRitualTemplateDetailDto` | `publicId`, `slug`, `title`, `summary`, `context`, `preparationChecklist[]`, `steps[]`, `conditionalRules[]`, `relatedChantItems[]`, `relatedPlans[]`, `nextRoutes[]` | owner cho `/niem-kinh/nghi-thuc/[slug]`; flow nhiều bước như `thắp tâm hương` |
| chant plan detail | `ChantPlanDetailDto` | `publicId`, `slug`, `title`, `summary`, `estimatedDurationMinutes`, `entryRequirements[]`, `orderedSections[]`, `relatedRitualTemplate?`, `nextActions[]` | owner cho `/niem-kinh/ke-hoach/[slug]`; composition surface |
| offline bundle list | `OfflineBundleListItemDto` | `publicId`, `bundleType`, `scope`, `version`, `freshnessStatus`, `lastRebuiltAt`, `downloadSize`, `syncStatus` | cho `/ngoai-tuyen` |
| offline bundle list page | `OfflineBundleListPageDto` | `items[]`, `pagination`, `syncSummary`, `pendingDeltaBadge`, `hasMore` | page aggregate cho `/ngoai-tuyen` |
| offline bundle delta response | `OfflineBundleDeltaResponseDto` | `bundleId`, `bundleName`, `fromVersion`, `toVersion`, `isFullSync`, `added[]`, `updated[]`, `deletedIds[]`, `totalEntries`, `generatedAt` | owner cho `/offline-bundles/:publicId/delta` |
| member notification preferences page | `NotificationPreferencesPageDto` | `capability`, `subscriptionState`, `categoryPreferences[]`, `practiceReminder`, `eventReminder`, `conflicts[]`, `lastEvaluatedAt` | owner cho `/thong-bao`; page settings surface, không phải inbox |
| personal practice calendar page | `PersonalPracticeCalendarPageDto` | `todayLunar`, `advisorySummary`, `calendarDays[]`, `upcomingEvents[]`, `reminderSummary`, `activeVowReminders[]` | owner cho `/lich-ca-nhan`; không nhét full event detail vào page aggregate |
| admin download detail | `AdminDownloadDetailDto` | `publicId`, `title`, `downloadType`, `targetAudience`, `status`, `versionNote`, `sourceReference`, `fileRef`, `surfaceRefs[]`, `updatedAt` | owner cho `/admin/content/downloads/:publicId`; download workspace không tự ráp metadata từ raw asset |
| admin sutra detail | `AdminSutraDetailDto` | `publicId`, `slug`, `title`, `status`, `language`, `summary`, `volumes[]`, `audioCompanion?`, `glossaryRefs[]`, `updatedAt` | owner cho `/admin/content/sutras/:publicId`; nested sutra tree phải đến từ 1 detail aggregate |
| admin table common | `AdminTableRowDto` | `publicId`, `status`, `createdAt`, `updatedAt`, `lastModifiedBy?` | base shape cho tables |
| admin search status | `AdminSearchStatusDto` | `requestedEngine`, `actualEngine`, `indexFreshnessSeconds`, `documentCount`, `pendingJobs`, `lastSuccessfulReindexAt`, `meiliHealth`, `sqlFallbackAvailable`, `bootstrapFallbackActive` | owner cho `/admin/search/status` và `operational-status` |
| admin search indexing job | `AdminSearchIndexingJobDto` | `publicId`, `source`, `triggerType`, `status`, `startedAt`, `finishedAt`, `durationMs`, `rowsIndexed`, `rowsDeleted`, `actorUserId?`, `requestId?`, `errorSummary?` | không nhét raw logs vào DTO detail |
| admin search fallback event | `AdminSearchFallbackEventDto` | `occurredAt`, `requestedEngine`, `actualEngine`, `reason`, `route`, `queryHash`, `durationMs`, `userAgentClass`, `requestId` | không expose raw query text |
| admin push subscription stats | `AdminPushSubscriptionStatsDto` | `activeCount`, `inactiveCount`, `newSubscriptionsLast30d[]`, `browserBreakdown[]`, `lastAggregatedAt`, `deliveryHealthSummary` | aggregate-only cho tab subscriptions của admin notifications |
| admin dashboard page | `AdminDashboardPageDto` | `systemSummary`, `pendingModeration`, `recentAuditEvents[]`, `contentOpsSummary`, `searchOpsSummary?` | owner cho `/admin/dashboard`; không để admin home tự ghép nhiều panel vô chủ |
| admin notification ops page | `AdminNotificationOpsPageDto` | `pushStatus`, `subscriptionStats`, `jobQueueSummary`, `recentJobs[]`, `deliveryHealthSummary` | owner cho `/admin/he-thong/thong-bao`; jobs/subscription stats phải cùng vocabulary |
| admin system health extended | `AdminSystemHealthExtendedDto` | `uptime`, `memoryUsageMb`, `cpuUsagePercent`, `diskUsagePercent`, `dbConnectionCount`, `featureFlagsCount`, `recentErrors[]` | owner cho page `/admin/he-thong/health` qua backing API `GET /admin/system/health-extended`; `recentErrors[]` chỉ là safe projection |
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

### `AdminDownloadDetailDto`

- `fileRef` là safe projection:
  - `publicId`
  - `mimeType`
  - `fileSizeLabel`
  - `downloadUrl`
- `surfaceRefs[]` chỉ là owner references:
  - `surfaceType`
  - `surfaceLabel`
  - `href`
- workspace này không được tự suy metadata từ raw media asset record.

### `AdminSutraDetailDto`

- `volumes[]` phải đủ cho nested editor:
  - `volumePublicId`
  - `title`
  - `orderIndex`
  - `chapters[]`
- mỗi `chapters[]` item tối thiểu:
  - `chapterPublicId`
  - `title`
  - `orderIndex`
  - `hasAudioCompanion`
  - `status`
- route detail này là owner aggregate cho tree editor; không để admin UI expand rồi tự fan-out từng chapter route nếu chưa có canon riêng.

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

### `ChantHubPageDto`

- `entryCards[]` là primary entry points, không phải chỉ nav links:
  - `bat-dau-tu-day`
  - `mo-nghi-thuc`
  - `mo-ke-hoach`
- `ritualTemplates[]` là mini cards cho các flow như `thắp tâm hương`.
- `chantItems[]` chỉ là curated subset, không dump toàn bộ library nếu page đã có CTA rõ hơn.
- `faqHighlights[]` là short snippets; full FAQ vẫn ở guide owner khi cần.
- `guideRefs[]` là bridges sang `/kinh-bai-tap/*`, không duplicate full guide payload.

### `ChantEnvironmentRulesPageDto`

- `intro` tối thiểu:
  - `title`
  - `summary`
  - `updatedAt`
- `groupCards[]` là primary entry points cho 6 buckets:
  - `time-rules`
  - `place-rules`
  - `food-body-rules`
  - `posture-hygiene-rules`
  - `special-location-cautions`
  - `non-interpretive-cautions`
- `groups[]` dùng `ChantEnvironmentRuleGroupDto`, nhưng page aggregate có thể chỉ preload expanded groups cần thiết cho first paint.
- `quickChecklist` tối thiểu:
  - `beforeYouStart[]`
  - `whenToPause[]`
  - `safeLaneSuggestions[]`
- `specialLocationHighlights[]` là curated mini list; full rules nằm trong group tương ứng.
- `referenceOnlyCautions[]` chỉ gồm safe projection:
  - `topic`
  - `summary`
  - `ctaLabel`
  - `ctaHref`
- `relatedGuideRefs[]` là bridges sang `Kinh Bài Tập`, `Ngôi Nhà Nhỏ`, `Kinh Văn Tự Tu`; không duplicate full guide payload.

### `ChantEnvironmentRuleGroupDto`

- `groupKey` canonical values:
  - `time-rules`
  - `place-rules`
  - `food-body-rules`
  - `posture-hygiene-rules`
  - `special-location-cautions`
  - `non-interpretive-cautions`
- `rules[]` mỗi item tối thiểu:
  - `ruleKey`
  - `title`
  - `canonicalWording`
  - `severity`
  - `productizationMode`
  - `safeLaneRefs[]?`
  - `avoidItems[]?`
  - `shortReason?`
  - `sourceReference?`
  - `versionNote?`
  - `referenceOnly`
- `severity` canonical values:
  - `advisory`
  - `caution`
  - `strong_guardrail`
  - `quality_guidance`
  - `reference_only`
- `productizationMode` canonical values:
  - `warning_card`
  - `checklist_item`
  - `safe_lane_suggestion`
  - `drawer_note`
  - `reference_only_note`
  - `do_not_automate`
- nếu `productizationMode = do_not_automate` thì:
  - `referenceOnly` phải là `true`
  - UI chỉ được render note/caution tĩnh
  - route/service không được trả thêm field gợi ý calculator hay interpretation helper
- `referenceOnly = true` là bắt buộc cho:
  - ánh sáng
  - giấc mơ / con số
  - tro / ngọn lửa
  - các hiện tượng không được product hóa thành tool phán đoán
- DTO này không được chứa:
  - user acknowledgment state
  - calculator output
  - auto-interpretation result
  - raw article body chưa phân nhóm

### `ChantItemDetailDto`

- `textBlocks[]` phải support bilingual hoặc segmented reading, không chỉ 1 blob text.
- `recommendedCounts[]` nên có label theo context:
  - `daily_default`
  - `ritual_opening`
  - `special_case`
- `relatedRituals[]` chỉ là mini refs; ritual detail route mới giữ flow đầy đủ.

### `ChantRitualTemplateDetailDto`

- `context` canonical values tối thiểu:
  - `daily_practice_opening`
  - `vow_support`
  - `life_release_support`
  - `little_house_support`
- `steps[]` mỗi item tối thiểu:
  - `stepNumber`
  - `stepType`
  - `title`
  - `instruction`
  - `countLabel?`
  - `conditionNote?`
- `stepType` canonical values tối thiểu:
  - `setup`
  - `visualization`
  - `silent_recitation`
  - `bow`
  - `closing`
- `conditionalRules[]` phải support các case như `7/13 biến`.
- route này phải đủ data để FE render stepper + condensed mode mà không bịa cấu trúc từ raw article body.

### `ChantPlanDetailDto`

- `orderedSections[]` mỗi section tối thiểu:
  - `sectionType`
  - `title`
  - `items[]`
  - `ritualTemplateRef?`
- `sectionType` canonical values tối thiểu:
  - `opening_ritual`
  - `core_recitation`
  - `optional_support`
  - `closing`
- nếu plan có ritual mở đầu như `thắp tâm hương`, section chỉ ref ritual template chứ không chôn toàn văn bước ritual vào plan payload.

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
  - `tab?`
  - `type?`
  - `entryType?`
  - `sourceFamily?`
- `pagination` tối thiểu:
  - `limit`
  - `offset`
  - `hasMore`
  - `totalApproximate?`
- `tab` canonical values cho public `/tim-kiem`:
  - `all`
  - `btpp`
  - `qa`
  - `khai-thi`
  - `posts`
- `tabCounts` là projected counts theo đúng visible tab trên `/tim-kiem`, không để client tự đếm:
  - `all`
  - `btpp`
  - `qa`
  - `khai-thi`
  - `posts`
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
- `activeTab` phải bám route family owner, không dùng chung một enum mơ hồ cho mọi hub:
  - `/bach-thoai`: `btpp` | `sach-noi`
  - `/hoi-dap`: `all` | `wenda` | `popular`
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
- `pagination` của `WisdomHubDto` mặc định dùng `offset` cho phase hiện tại:
  - `limit`
  - `offset`
  - `hasMore`
  - `totalApproximate?`
- nếu sau này muốn đổi sang `cursor`, phải cập nhật cả row route family và page-loader owner tương ứng; không đổi lặng lẽ ở controller.

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

- member dashboard aggregate -> hiện map vào `GET /dashboard`
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
