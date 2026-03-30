# API_DTO_SHAPE_PLAN

File này chốt DTO field picks mức scaffold cho các route family dễ bị code tay theo cảm tính.
Nó là cầu nối giữa domain contracts, route canon, và page/admin mapping; không thay domain contract detail.

> Route canon: `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`
> Admin mapping: `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
> Query plan: `design/04-execution-overlay/admin/ADMIN_FEATURE_QUERY_PLAN.md`

---

## Rules

- DTO ở file này là `scaffold-level picks`, không thay domain contracts.
- `public list`, `public detail`, `admin list`, `admin detail` phải tách riêng.
- Không trả raw DB columns không có nghĩa ở client.
- `internal ids`, checksum thô, secret flags, moderation internals không được lộ vào public DTO.
- Nếu route chưa có row ở file này, controller không được tự chọn field theo cảm tính; phải bổ sung owner row trước.

## Validation / transform baseline for DTO-backed routes

- route family có row ở file này phải map được về request contract owner tương ứng:
  - `body`
  - `query`
  - `params`
- Nest `ValidationPipe` option samples như `transform`, `whitelist`, `forbidNonWhitelisted` chỉ là framework knobs; PMTL authority vẫn là Zod request schema
- nếu route cần primitive transport transform:
  - ưu tiên chốt rõ ở owner row/notes thay vì để controller tự bật auto-transform ngầm
  - Parse* pipe hoặc equivalent helper chỉ được dùng cho scalar cases thật sự rõ
- không dựa vào implicit class-transformer conversion để suy DTO/query semantics cho route family
- nếu route family cần default query values, default đó phải hiện diện trong contract owner hoặc route notes; không để framework default tự quyết

## Error mapping baseline for DTO-backed routes

- mọi route family ở file này phải map được từ validation/authz/business failure về canonical `error.code`
- error mapping không được để controller tự phát sinh message/code ad hoc theo từng handler
- tối thiểu:
  - invalid `body` -> `validation.invalid_body`
  - invalid `query` -> `validation.invalid_query`
  - invalid `params` -> `validation.invalid_params`
  - permission failure -> code family đúng owner module, không generic `Forbidden`
- nếu một DTO route family có failure mode đặc thù mà registry chưa có row canon, phải cập nhật `design/04-execution-overlay/api/ERROR_CODE_REGISTRY.md` trước khi scaffold
- validation errors ở đây là `mandatory minimum`, không phải exhaustive error inventory.
- domain/business failure nào vượt qua schema validation nhưng vẫn fail semantics phải có code family canon riêng, không gộp bừa vào `validation.*`

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
| newcomer faq handbook | `NewcomerFaqHandbookDto` | `publicId`, `slug`, `title`, `intro`, `generalFaq[]`, `faqSections[]`, `faqEntries[]`, `caseStudies[]`, `disclaimerBlock`, `updatedAt` | owner cho chapter 10-12 aggregate, để BE/FE codegen không tự ráp từ nhiều bài rời |
| newcomer onboarding roadmap | `NewcomerOnboardingRoadmapDto` | `publicId`, `slug`, `title`, `intro`, `durationDays`, `weeks[]`, `completionChecklist[]`, `safetyRules[]`, `nextActions[]`, `updatedAt` | owner cho chapter 13 (lộ trình 30 ngày), support checklist rendering |
| newcomer onboarding 90d | `NewcomerOnboarding90dDto` | `publicId`, `slug`, `title`, `intro`, `months[]`, `tableChecklist[]`, `updatedAt` | owner cho lộ trình 90 ngày bản Việt |
| newcomer encyclopedia package | `NewcomerEncyclopediaDto` | `publicId`, `slug`, `title`, `toc[]`, `chapters[]`, `faqQuick[]`, `topCaseStudies[]`, `onboarding90dRef`, `glossaryRef`, `audioOverviewRef`, `updatedAt` | package aggregate cho bản bách khoa 9 phần |
| newcomer glossary | `NewcomerGlossaryDto` | `publicId`, `slug`, `title`, `entries[]`, `updatedAt` | owner cho glossary Trung-Việt-Anh |
| newcomer audio overview | `NewcomerAudioOverviewDto` | `publicId`, `slug`, `title`, `durationMinutes`, `scriptBlocks[]`, `updatedAt` | owner cho script audio tóm tắt |
| practice support altar care | `PracticeSupportAltarCareDto` | `publicId`, `slug`, `title`, `locationRules[]`, `placementRules[]`, `offeringRules[]`, `maintenanceSteps[]`, `specialCases[]`, `updatedAt` | owner cho guide vận hành Phật đài và bảo dưỡng |
| practice support little-house writing rules | `PracticeSupportLittleHouseWritingRulesDto` | `publicId`, `slug`, `title`, `namingRules`, `dottingRules`, `errorRecoveryRules`, `examples[]`, `updatedAt` | owner cho quy tắc viết/chấm NNN để codegen form validation |
| practice support little-house allocation guidelines | `PracticeSupportLittleHouseAllocationGuidelinesDto` | `publicId`, `slug`, `title`, `baseRange`, `scenarioGuidelines[]`, `combinationRules[]`, `continuityNotes[]`, `updatedAt` | owner cho định mức số tờ NNN theo tình huống |
| practice support heart-incense | `PracticeSupportHeartIncenseDto` | `publicId`, `slug`, `title`, `steps[]`, `travelModeRules[]`, `doNotRules[]`, `littleHouseEmergencyFlow[]`, `updatedAt` | owner cho nghi thức Tâm Hương 9 bước |
| practice support name-change ritual | `PracticeSupportNameChangeRitualDto` | `publicId`, `slug`, `title`, `overview`, `preparationRules[]`, `timingRules[]`, `withAltarFlow[]`, `withoutAltarFlow[]`, `successSignals[]`, `postRitualNotes[]`, `updatedAt` | owner cho nghi thức Đơn Thăng Văn đổi tên |
| practice support fetal-karma resolution | `PracticeSupportFetalKarmaResolutionDto` | `publicId`, `slug`, `title`, `overview`, `littleHouseRules`, `repentanceRules[]`, `additionalMantras[]`, `dreamSignals[]`, `updatedAt` | owner cho guideline hóa giải nghiệp thai nhi |
| practice support recitation guide | `PracticeSupportRecitationGuideDto` | `publicId`, `slug`, `title`, `overview`, `coreRecitations[]`, `minorMantras[]`, `timeRules[]`, `interruptionRules[]`, `workplacePracticeRules[]`, `applicationScenarios[]`, `longTermAspirationNotes[]`, `updatedAt` | owner cho tổng hợp niệm kinh (kinh lớn + thập tiểu chú + interruption/workplace/aspiration guidance) |
| practice support life-release selection guide | `PracticeSupportLifeReleaseSelectionGuideDto` | `publicId`, `slug`, `title`, `overview`, `speciesSelectionRules[]`, `ecologyRules[]`, `ritualFlow[]`, `emergencyHandling[]`, `recommendedTiming[]`, `updatedAt` | owner cho quy tắc chọn loài phóng sanh và bảo toàn sinh thái |
| practice support vietnam home-practice guide | `PracticeSupportVietnamHomePracticeGuideDto` | `publicId`, `slug`, `title`, `overview`, `homeAltarRules[]`, `heartIncenseFallbackRules[]`, `littleHouseDisciplineRules[]`, `familyCoordinationRules[]`, `sacredItemRules[]`, `accidentalViolationRecovery[]`, `vegetarianDisciplineRules[]`, `officeNutritionNotes[]`, `supplementalDietNotes[]`, `complianceAndEthicsRules[]`, `updatedAt` | owner cho lane tự tu tại gia ở Việt Nam + discipline vật phẩm hộ thân + ăn chay cơ bản |
| public search result item | `SearchResultItemDto` | `publicId`, `docType`, `entryType?`, `sourceFamily?`, `title`, `excerpt`, `href`, `publishedAt?`, `highlight?` | shared shape cho `/search`, `/tim-kiem`, wisdom-aware search cards |
| public search results page | `SearchResultsPageDto` | `query`, `appliedFilters`, `items[]`, `pagination`, `tabCounts`, `filterFacets`, `engine`, `suggestedQueries[]` | owner cho `/tim-kiem`; không để client tự đếm/tabulate từ raw list |
| wisdom list | `WisdomListItemDto` | `publicId`, `slug`, `entryType`, `sourceFamily`, `titleVietnamese`, `summaryVietnamese`, `sourceCode`, `publishedAt`, `hasAudio` | không đưa full original text vào list |
| wisdom hub page | `WisdomHubDto` | `items[]`, `pagination`, `activeTab`, `tabCounts`, `filterFacets`, `featuredEntries[]`, `searchScope`, `engine` | owner cho `/bach-thoai` và `/hoi-dap` |
| wisdom detail | `WisdomDetailDto` | list item fields + `titleOriginal`, `translatedText`, `rawOriginalText?`, `sourceUrl`, `sourceAttribution`, `keywordAliases[]`, `relatedEntries[]` | `question/answer` pair chỉ hiện khi `entryType = qa` |
| community post list item | `CommunityPostListItemDto` | `publicId`, `slug`, `title`, `excerpt`, `authorSummary`, `publishedAt`, `heartCount`, `commentCount`, `visibilityStatus`, `shareUrl`, `viewerHasHearted?`, `tags[]` | owner cho `/community/posts`; không trả moderation internals |
| community post detail | `CommunityPostDetailDto` | list item fields + `bodyHtml`, `breadcrumbs[]`, `commentsPreview[]`, `relatedPosts[]`, `reportState?` | owner cho `/community/posts/:publicId`; `reportState` là safe projection, không phải raw reports |
| community comment item | `CommunityCommentItemDto` | `publicId`, `parentPublicId?`, `authorSummary`, `bodyRendered`, `createdAt`, `heartCount`, `viewerHasHearted?`, `replyCount`, `visibilityStatus` | dùng cho editorial/community comment threads; thread depth nông |
| guestbook entry item | `GuestbookEntryItemDto` | `publicId`, `displayName`, `messageRendered`, `approvedAt`, `shareUrl`, `visibilityStatus` | owner cho `/guestbook`; không public raw moderation state |
| member dashboard page | `MemberDashboardDto` | `todayLunar`, `advisorySummary`, `quickActions[]`, `practiceSummary`, `activeVowsSummary`, `onboardingState`, `notificationSummary` | owner cho `/dashboard`; không để web tự fan-out mù qua 4 module |
| member practice profile | `PracticeProfileDto` | `experienceTier`, `baselineMode`, `skipBeginnerTrack`, `privateStreakEnabled`, `foundationRuleSummary`, `warningState?`, `lastUpdatedAt` | owner cho `/engagement/practice-profile`; self-owned profile authority |
| member practice log item | `PracticeLogItemDto` | `publicId`, `practiceDate`, `planRef?`, `items[]`, `totalCompletedCount`, `completedAt?`, `notePreview?`, `createdAt`, `updatedAt` | owner cho `/engagement/practice-logs`; historical session record, không thay practice sheet |
| member practice log self-state | `PracticeLogSelfStateDto` | `practiceDate`, `planRef?`, `items[]`, `note?`, `clientEventId?`, `privateStreak?`, `updatedAt` | owner cho `GET/PUT /engagement/practice-logs/self`; canonical self-save lane cho buổi tu |
| member practice sheet detail | `PracticeSheetDetailDto` | `publicId`, `practiceDate`, `planRef?`, `experienceTierSnapshot`, `baselineModeSnapshot`, `items[]`, `completionState`, `sourceRefs[]`, `baselineWarning?`, `privateStreak?`, `updatedAt` | owner cho `/engagement/practice-sheets/:publicId`; không bắt web tự ghép profile + sheet + warning |
| member practice sheet mutation result | `PracticeSheetMutationResultDto` | `sheet`, `profile`, `baselineWarning?`, `privateStreak?`, `requestAcceptedAt` | dùng cho `PATCH /engagement/practice-sheets/:publicId` và `POST /engagement/practice-sheets/:publicId/complete`; mutation phải trả aggregate đủ dùng cho optimistic UI |
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
| admin newcomer faq handbook detail | `AdminNewcomerFaqHandbookDto` | `publicId`, `slug`, `title`, `intro`, `generalFaq[]`, `faqSections[]`, `faqEntries[]`, `caseStudies[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/newcomer/faq-handbook`; editor lane cho chapter 10-12 |
| admin newcomer onboarding roadmap detail | `AdminNewcomerOnboardingRoadmapDto` | `publicId`, `slug`, `title`, `intro`, `durationDays`, `weeks[]`, `completionChecklist[]`, `safetyRules[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/newcomer/onboarding-roadmap`; editor lane cho chapter 13 |
| admin newcomer onboarding 90d detail | `AdminNewcomerOnboarding90dDto` | `publicId`, `slug`, `title`, `intro`, `months[]`, `tableChecklist[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/newcomer/onboarding-90d` |
| admin newcomer encyclopedia detail | `AdminNewcomerEncyclopediaDto` | `publicId`, `slug`, `title`, `toc[]`, `chapters[]`, `faqQuick[]`, `topCaseStudies[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/newcomer/encyclopedia` |
| admin newcomer glossary detail | `AdminNewcomerGlossaryDto` | `publicId`, `slug`, `title`, `entries[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/newcomer/glossary` |
| admin newcomer audio overview detail | `AdminNewcomerAudioOverviewDto` | `publicId`, `slug`, `title`, `durationMinutes`, `scriptBlocks[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/newcomer/audio-overview` |
| admin practice support altar care detail | `AdminPracticeSupportAltarCareDto` | `publicId`, `slug`, `title`, `locationRules[]`, `placementRules[]`, `offeringRules[]`, `maintenanceSteps[]`, `specialCases[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/altar-care` |
| admin practice support little-house writing rules detail | `AdminPracticeSupportLittleHouseWritingRulesDto` | `publicId`, `slug`, `title`, `namingRules`, `dottingRules`, `errorRecoveryRules`, `examples[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/little-house-writing-rules` |
| admin practice support little-house allocation guidelines detail | `AdminPracticeSupportLittleHouseAllocationGuidelinesDto` | `publicId`, `slug`, `title`, `baseRange`, `scenarioGuidelines[]`, `combinationRules[]`, `continuityNotes[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/little-house-allocation-guidelines` |
| admin practice support heart-incense detail | `AdminPracticeSupportHeartIncenseDto` | `publicId`, `slug`, `title`, `steps[]`, `travelModeRules[]`, `doNotRules[]`, `littleHouseEmergencyFlow[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/heart-incense` |
| admin practice support name-change ritual detail | `AdminPracticeSupportNameChangeRitualDto` | `publicId`, `slug`, `title`, `overview`, `preparationRules[]`, `timingRules[]`, `withAltarFlow[]`, `withoutAltarFlow[]`, `successSignals[]`, `postRitualNotes[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/name-change-ritual` |
| admin practice support fetal-karma resolution detail | `AdminPracticeSupportFetalKarmaResolutionDto` | `publicId`, `slug`, `title`, `overview`, `littleHouseRules`, `repentanceRules[]`, `additionalMantras[]`, `dreamSignals[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/fetal-karma-resolution` |
| admin practice support recitation guide detail | `AdminPracticeSupportRecitationGuideDto` | `publicId`, `slug`, `title`, `overview`, `coreRecitations[]`, `minorMantras[]`, `timeRules[]`, `applicationScenarios[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/recitation-guide` |
| admin practice support life-release selection guide detail | `AdminPracticeSupportLifeReleaseSelectionGuideDto` | `publicId`, `slug`, `title`, `overview`, `speciesSelectionRules[]`, `ecologyRules[]`, `ritualFlow[]`, `emergencyHandling[]`, `recommendedTiming[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/life-release-selection-guide` |
| admin practice support vietnam home-practice guide detail | `AdminPracticeSupportVietnamHomePracticeGuideDto` | `publicId`, `slug`, `title`, `overview`, `homeAltarRules[]`, `heartIncenseFallbackRules[]`, `littleHouseDisciplineRules[]`, `familyCoordinationRules[]`, `complianceAndEthicsRules[]`, `reviewStatus`, `versionNote`, `updatedAt` | owner cho `/admin/content/practice-support/vietnam-home-practice-guide` |
| admin table common | `AdminTableRowDto` | `publicId`, `status`, `createdAt`, `updatedAt`, `lastModifiedBy?` | base shape cho tables |
| admin search status | `AdminSearchStatusDto` | `requestedEngine`, `actualEngine`, `indexFreshnessSeconds`, `documentCount`, `pendingJobs`, `lastSuccessfulReindexAt`, `meiliHealth`, `sqlFallbackAvailable`, `bootstrapFallbackActive` | owner cho `/admin/search/status` và `operational-status` |
| admin search indexing job | `AdminSearchIndexingJobDto` | `publicId`, `source`, `triggerType`, `status`, `startedAt`, `finishedAt`, `durationMs`, `rowsIndexed`, `rowsDeleted`, `actorUserId?`, `requestId?`, `errorSummary?` | không nhét raw logs vào DTO detail |
| admin search fallback event | `AdminSearchFallbackEventDto` | `occurredAt`, `requestedEngine`, `actualEngine`, `reason`, `route`, `queryHash`, `durationMs`, `userAgentClass`, `requestId` | không expose raw query text |
| admin push subscription stats | `AdminPushSubscriptionStatsDto` | `activeCount`, `inactiveCount`, `newSubscriptionsLast30d[]`, `browserBreakdown[]`, `lastAggregatedAt`, `deliveryHealthSummary` | aggregate-only cho tab subscriptions của admin notifications |
| admin dashboard page | `AdminDashboardPageDto` | `systemSummary`, `pendingModeration`, `recentAuditEvents[]`, `contentOpsSummary`, `searchOpsSummary?` | owner cho `/admin/dashboard`; không để admin home tự ghép nhiều panel vô chủ |
| admin notification ops page | `AdminNotificationOpsPageDto` | `pushStatus`, `subscriptionStats`, `jobQueueSummary`, `recentJobs[]`, `deliveryHealthSummary` | owner cho `/admin/he-thong/thong-bao`; jobs/subscription stats phải cùng vocabulary |
| admin system health extended | `AdminSystemHealthExtendedDto` | `uptime`, `memoryUsageMb`, `cpuUsagePercent`, `diskUsagePercent`, `dbConnectionCount`, `featureFlagsCount`, `recentErrors[]` | owner cho page `/admin/he-thong/health` qua backing API `GET /admin/system/health-extended`; `recentErrors[]` chỉ là safe projection |
| admin moderation report detail | `AdminModerationReportDetailDto` | `publicId`, `status`, `reasonCode`, `reporterSummary`, `targetType`, `targetPreview`, `createdAt`, `decisionHistory[]`, `currentDecisionOptions[]` | giảm blind scaffold ở moderation |
| admin community post detail | `AdminCommunityPostDetailDto` | `publicId`, `title`, `authorSummary`, `bodyRendered`, `moderationStatus`, `visibilityStatus`, `heartCount`, `commentCount`, `reportCount`, `createdAt`, `updatedAt`, `availableActions[]` | owner cho `/admin/community/posts/:publicId`; không trả raw abuse internals |
| admin guestbook entry detail | `AdminGuestbookEntryDetailDto` | `publicId`, `displayName`, `messageRendered`, `approvalStatus`, `visibilityStatus`, `reportCount`, `createdAt`, `updatedAt`, `availableActions[]` | owner cho `/admin/community/guestbook/:publicId`; guestbook approval khác moderation report canonical |
| admin audit-log detail | `AdminAuditLogDetailDto` | `publicId`, `actorSummary`, `action`, `resourceType`, `resourcePublicId`, `occurredAt`, `metadata`, `correlationId`, `requestId` | `metadata` phải qua safe projection |
| admin wisdom import job detail | `AdminWisdomImportJobDetailDto` | `publicId`, `jobType`, `providerProfile`, `sourceFamily`, `status`, `candidateSlug`, `dedupeStatus`, `resultEntryPublicId?`, `errorSummary?`, `createdAt`, `updatedAt` | lấp gap import workspace |

Note:
- `audio_talk_entries` và `video_talk_entries` hiện là schema/source-family records của `wisdom-qa`, chưa tự động trở thành standalone DTO family.
- nếu chưa có route canon và page/admin owner rõ cho audio/video talk surfaces, codegen phải coi chúng là `blocked at design`, không tự mở route/DTO mới chỉ vì schema table đã tồn tại.

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
- query validation/error-map expectations:
  - invalid/missing `q` theo threshold owner -> `search.query_invalid` hoặc `search.query_too_short`
  - invalid cursor -> `search.cursor_invalid`
  - hidden fallback/internal engine detail không lộ qua generic `400`
- transform/default expectations:
  - `limit` default phải là route default owner, không suy từ framework pipe
  - `tab/type/entryType/sourceFamily` chỉ nhận canonical vocab đã chốt; không auto-cast enum lỏng theo query string bất kỳ
- docs/OpenAPI expectations:
  - route docs phải phản ánh đây là public read/search aggregate
  - không annotate bearer/cookie security requirement cho route public này chỉ vì search page có signed-in enhancement

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
- validation/error-map expectations:
  - route này không nhận body; nếu transport/session invalid thì dùng `auth.session_missing|expired|forbidden`, không trộn vào generic validation code
  - cookie presence không đủ để trả `200`; canonical session verification fail phải đi đúng auth error code
- docs/OpenAPI expectations:
  - browser auth scheme phải phản ánh cookie-first transport
  - không annotate route này thành bearer-only baseline
  - nếu có selective bearer support cho internal consumer khác, phải tách rõ contract thay vì làm mơ hồ `/auth/me`

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
  - `foundationGuard?`
- `activeVowsSummary` tối thiểu:
  - `activeCount`
  - `nextMilestoneLabel?`
- `onboardingState` tối thiểu:
  - `isFirstVisit`
  - `showOnboardingBanner`
  - `nextRecommendedRoute`
  - `practiceProfileHint?`
- `notificationSummary` chỉ là aggregate state:
  - `pushCapability`
  - `practiceReminderEnabled`
  - `eventReminderEnabled`

### `NewcomerFaqHandbookDto`

- `generalFaq[]` giữ nhóm FAQ nhập môn (chapter 10).
- `faqSections[]` là taxonomy để render section tabs:
  - `sectionKey`
  - `title`
  - `orderNo`
- `faqEntries[]` phải có:
  - `publicId`
  - `question`
  - `answer`
  - `sectionKey`
  - `priority`
  - `tags[]`
  - `sourceTier`
- `caseStudies[]` phải có:
  - `publicId`
  - `title`
  - `summary`
  - `year`
  - `evidenceTier`
  - `riskLabel`
  - `claimedOutcomes[]`
- `disclaimerBlock` là required:
  - `medical`
  - `legal`
  - `doctrinal`
- không trộn raw testimonial wall vào `faqEntries[]`; case studies là lane riêng (chapter 12).

### `NewcomerOnboardingRoadmapDto`

- `durationDays` mặc định `30`.
- `weeks[]` phải ổn định theo thứ tự `1..4`, mỗi week gồm:
  - `weekNumber`
  - `title`
  - `goal`
  - `tasks[]`
  - `warnings[]`
- `tasks[]` phải có:
  - `taskKey`
  - `title`
  - `description`
  - `taskKind`
  - `isRequired`
  - `cadence`
  - `checklist[]`
- `taskKind` canonical values:
  - `recitation`
  - `study`
  - `ritual`
  - `vow`
  - `life_release`
  - `faq_review`
- `safetyRules[]` là required để chặn FE bỏ qua khung giờ/cảnh báo nền tảng.

### `NewcomerOnboarding90dDto`

- `months[]` cố định 3 phase:
  - `monthNumber`
  - `goal`
  - `checklist[]`
- `tableChecklist[]` là format bảng cho onboarding Việt, để FE render trực tiếp.
- DTO này không thay `NewcomerOnboardingRoadmapDto`; nó là lane dài hạn (90 ngày) tách riêng.

### `NewcomerEncyclopediaDto`

- `toc[]` giữ mục lục 9 phần.
- `chapters[]` phải có:
  - `chapterNumber`
  - `title`
  - `summaryBlocks[]`
- `faqQuick[]` là shortlist FAQ hiển thị nhanh, không thay `faq-handbook`.
- `topCaseStudies[]` là shortlist card, detail đầy đủ vẫn qua `case-studies`.
- `onboarding90dRef`, `glossaryRef`, `audioOverviewRef` là stable refs để FE prefetch đúng route.

### `NewcomerGlossaryDto`

- `entries[]` mỗi item gồm:
  - `term`
  - `hanzi?`
  - `vietnamese`
  - `english`
  - `note?`

### `NewcomerAudioOverviewDto`

- `durationMinutes` và `scriptBlocks[]` là required.
- `scriptBlocks[]` gồm:
  - `speaker`
  - `toneHint?`
  - `text`
- lane này là script content owner; media asset/audio file mapping là aux layer riêng.

### `AdminNewcomerFaqHandbookDto`

- giữ cùng vocabulary với `NewcomerFaqHandbookDto`; admin chỉ được thêm:
  - `reviewStatus`
  - `versionNote`
  - `lastReviewedAt`
- không mở field raw moderation notes vào public mirror.

### `AdminNewcomerOnboardingRoadmapDto`

- giữ cùng vocabulary với `NewcomerOnboardingRoadmapDto`; admin chỉ được thêm:
  - `reviewStatus`
  - `versionNote`
- `lastReviewedAt`
- nếu đổi baseline warning wording, phải bump `versionNote` để FE invalidate roadmap cache đúng scope.

### `PracticeSupportAltarCareDto`

- `locationRules[]` phải explicit từng điều cấm/khuyến nghị:
  - `ruleCode`
  - `label`
  - `description`
  - `severity`
- `offeringRules[]` giữ rule theo nhóm:
  - `water`
  - `oilLamp`
  - `fruit`
  - `flowers`
  - `incense`
- `specialCases[]` tối thiểu gồm:
  - `travel`
  - `moving-home`
  - `temporary-rental`
- DTO này là owner để render checklist vận hành, không để FE scrape từ prose.

### `PracticeSupportLittleHouseWritingRulesDto`

- `namingRules` phải giữ:
  - `inkColor`
  - `writeBeforeRecite`
  - `recipientPatterns[]`
  - `giverPattern`
  - `dateFillRule`
- `dottingRules` phải giữ:
  - `dotColor`
  - `timingRule`
  - `shapeRule`
  - `fillPercentGuideline`
  - `sequenceGuideline`
- `errorRecoveryRules` là required:
  - `doNotTear`
  - `doNotBurnInvalidSheet`
  - `disposeFlow[]`
  - `rebuildFlow[]`

### `PracticeSupportLittleHouseAllocationGuidelinesDto`

- `baseRange` giữ mức khởi điểm cho newcomer.
- `scenarioGuidelines[]` mỗi item gồm:
  - `scenarioCode`
  - `title`
  - `suggestedRange`
  - `recipientTemplate`
  - `notes`
- `combinationRules[]` dùng cho các case đi kèm `Lễ Phật Đại Sám Hối Văn`.
- `continuityNotes[]` bắt buộc có nội dung duy trì dài hạn, tránh hiểu sai là one-off.

### `PracticeSupportHeartIncenseDto`

- `steps[]` phải đủ 9 bước, mỗi bước có:
  - `stepNumber`
  - `title`
  - `action`
  - `mentalOnly` (boolean)
- `travelModeRules[]` chứa quy tắc khi đi công tác/ở trọ.
- `doNotRules[]` chứa cấm kỵ edge cases.
- `littleHouseEmergencyFlow[]` là luồng rút gọn khi cần xử lý NNN gấp trong travel mode.

### `PracticeSupportNameChangeRitualDto`

- `preparationRules[]` phải có:
  - `formType`
  - `paperColor`
  - `requiredFields[]`
- `timingRules[]` phải có:
  - `preferredLunarDays[]`
  - `timeWindows[]`
  - `weatherRequirement`
- `withAltarFlow[]` và `withoutAltarFlow[]` là 2 flow tách biệt, không trộn.
- `postRitualNotes[]` phải gồm:
  - `nameActivationWindow`
  - `temporaryNamingFallback`
  - `retryPolicy`

### `PracticeSupportFetalKarmaResolutionDto`

- `littleHouseRules` phải có:
  - `recipientTemplate`
  - `baseRangePerChild`
  - `escalationRange`
- `repentanceRules[]` phải explicit `Li Fo` frequency guardrails.
- `additionalMantras[]` dùng cho mantra bổ trợ (ví dụ Công Đức Bảo Sơn).
- `dreamSignals[]` phải tách rõ:
  - `resolvedSignals[]`
  - `unresolvedSignals[]`

### `PracticeSupportRecitationGuideDto`

- `coreRecitations[]` mỗi item gồm:
  - `name`
  - `purpose`
  - `baselineCount`
  - `intensiveCount`
- `minorMantras[]` mỗi item gồm:
  - `name`
  - `useCase`
  - `typicalRange`
- `timeRules[]` phải encode rule severity cho các khung giờ nhạy cảm.
- `applicationScenarios[]` là danh sách guidance ngắn, không nhúng long-form prose.

### `PracticeSupportLifeReleaseSelectionGuideDto`

- `speciesSelectionRules[]` là rule chọn đối tượng cận kề bị giết thịt.
- `ecologyRules[]` là rule sinh thái bắt buộc khi thả.
- `ritualFlow[]` giữ theo `stepNumber` để FE render checklist.
- `emergencyHandling[]` chứa lane xử lý khi có sinh vật tử vong trong quá trình.
- `recommendedTiming[]` là mốc ngày/khung thời điểm khuyến nghị.

### `PracticeSupportVietnamHomePracticeGuideDto`

- `homeAltarRules[]` là lane đặt bàn thờ và cúng dường tại gia.
- `heartIncenseFallbackRules[]` là lane fallback khi không có bàn thờ.
- `littleHouseDisciplineRules[]` là lane kỷ luật NNN cho người tự tu.
- `familyCoordinationRules[]` là lane ứng xử với người thân chưa đồng thuận.
- `complianceAndEthicsRules[]` bắt buộc có rule tuân thủ pháp luật sở tại.

### `AdminPracticeSupport*Dto`

- Tất cả admin practice-support DTO giữ cùng vocabulary public DTO tương ứng.
- Chỉ được thêm metadata admin:
  - `reviewStatus`
  - `versionNote`
  - `lastReviewedAt`
- Không được mở raw note nội bộ ra public mirror.

### `PracticeProfileDto`

- `experienceTier` canonical values:
  - `newcomer`
  - `established`
  - `experienced_new_to_app`
- `baselineMode` canonical values:
  - `beginner_guided`
  - `standard_foundation`
  - `custom_with_warning`
- `foundationRuleSummary` tối thiểu:
  - `greatCompassionBaseline`
  - `heartSutraBaseline`
  - `noteSafe`
  - `sourceRef`
- `warningState?` là profile-level warning projection:
  - `code`
  - `message`
  - `severity`
- `warningState?` chỉ dùng cho profile/config context.
- nếu warning gắn trực tiếp với sheet execution hiện tại, dùng `baselineWarning?` ở sheet DTO thay vì tái dùng field name này.
- route này không trả raw personalized scoring hoặc hidden heuristic internals.

### `PracticeLogItemDto`

- `items[]` là snapshot của buổi tu đã lưu:
  - `itemKey`
  - `label`
  - `completedCount`
- `PracticeLogItemDto` là historical record/read model.
- route list/detail cho `practice-logs` không được drift thành daily sheet editor DTO.

### `PracticeLogSelfStateDto`

- dùng cho self-save/read lane `GET/PUT /engagement/practice-logs/self`.
- `items[]` tối thiểu:
  - `itemKey`
  - `completedCount`
- đây là canonical self-save path cho buổi tu hiện tại; không thay role của `practiceSheets`, vốn là daily structured sheet lane.
- nếu response có `privateStreak?`, đó là read-only post-save projection để UI cập nhật nhẹ, không mở quyền sửa streak qua request body.

### `PracticeSheetDetailDto`

- `items[]` là projection đủ cho sheet editor:
  - `itemKey`
  - `label`
  - `plannedCount`
  - `completedCount`
  - `completionState`
- `baselineWarning?` tối thiểu:
  - `code`
  - `message`
  - `appliesTo[]`
  - `sourceRef`
- `privateStreak?` tối thiểu:
  - `enabled`
  - `currentDays`
  - `longestDays`
  - `lastCompletedDate`
- `privateStreak` là self-only projection; không được tái dùng cho community/admin default DTO.
- visibility canon:
  - member owner self routes được đọc
  - admin/moderator/default support routes không được trả field này nếu chưa có support exception owner riêng

### `PracticeSheetMutationResultDto`

- `sheet` dùng `PracticeSheetDetailDto`.
- `profile` dùng `PracticeProfileDto`.
- `requestAcceptedAt` là server timestamp để web reconcile optimistic UI.
- completion/save route không được chỉ trả `200 ok` mơ hồ rồi để client tự reload nhiều endpoint.
- `profile` ở đây là read-only projection sau mutation:
  - để UI biết profile/baseline hiện hành
  - không mở quyền update `experienceTier`, `baselineMode`, `skipBeginnerTrack`, `privateStreakEnabled` qua sheet route

### `AdminSystemHealthExtendedDto`

- `recentErrors[]` chỉ gồm:
  - `occurredAt`
  - `module`
  - `action`
  - `errorCode`
  - `requestId`
- không trả raw stack trace, token, cookie, hoặc payload metadata chưa sanitize.
- `dbConnectionCount`, `pendingOutboxCount?`, `queueDepths?` là operational counters; không dùng field name mơ hồ kiểu `healthData`.
- validation/error-map expectations:
  - đây là admin operational aggregate; unauthorized/forbidden phải ra `auth.forbidden` hoặc owner admin code, không generic 400/500
  - degraded dependency state vẫn ưu tiên trả aggregate an toàn nếu contract cho phép; không lộ raw infra exception text
- docs/OpenAPI expectations:
  - route này thuộc control-plane/admin surface, không public hóa cùng `/health/*`
  - docs phải cho thấy đây là admin-only operational projection, không phải raw log tail hay unrestricted diagnostics

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
| member dashboard aggregate | query params chỉ được gồm `tz?`, `today?`, `includeOnboarding?`; default: `tz = user setting hoặc server fallback`, `today = server current date`, `includeOnboarding = false` | `MemberDashboardDto` với section-level ownership rõ cho `todayLunar`, `advisorySummary`, `practiceSummary`, `activeVowsSummary`, `notificationSummary` | `auth.session_missing`, `dashboard.aggregate_unavailable`, `calendar.advisory_unavailable` | `apps/api` phải có 1 aggregate read owner; web không được tự compose mù từ nhiều module |
| notification preferences aggregate | body/query không được tách capability check thành route riêng cho page bootstrap | `NotificationPreferencesPageDto` + `capability`, `subscriptionState`, `categoryPreferences[]`, `practiceReminder`, `eventReminder`, `conflicts[]` | `auth.session_missing`, `notification.push_not_supported`, `notification.preferences_degraded`, `notification.subscription_missing` | projection owner là notification module; không cho web tự merge prefs + capability + reminder health |
| search results aggregate | query params tối thiểu: `q`, `tab?`, `docType?`, `entryType?`, `sourceFamily?`, `cursor?`, `limit?`; default: `tab = all`, `limit = route default`, không tự thêm hidden filter | `SearchResultsPageDto` + stable `SearchResultItemDto[]`, `tabCounts`, `filterFacets`, `engine`, `pagination` | `search.query_invalid`, `search.query_too_short`, `search.engine_unavailable`, `search.cursor_invalid` | search module phải trả canonical `href`, `engine`, `tabCounts`; client không được derive |
| offline bundle list page | query params tối thiểu: `cursor?`, `pageSize?`, `freshnessStatus?`; default: first page nếu thiếu `cursor`, canonical page size từ route owner, `freshnessStatus = all` | `OfflineBundleListPageDto` + `items[]`, `pagination`, `syncSummary`, `pendingDeltaBadge`, `hasMore` | `auth.session_missing`, `offline.bundle_list_unavailable`, `offline.sync_degraded` | owner là offline bundle aggregate read; page không loop qua từng bundle detail để tự tính badge |
| personal practice calendar page | query params tối thiểu: `month`, `tz?`; `month` là bắt buộc, `tz` default theo user setting hoặc server fallback | `PersonalPracticeCalendarPageDto` + `calendarDays[]`, `upcomingEvents[]`, `reminderSummary`, `activeVowReminders[]` | `auth.session_missing`, `calendar.month_invalid`, `calendar.aggregate_unavailable` | calendar module là owner của month grid projection; không preload advisory detail cho từng ngày |
| newcomer faq handbook aggregate | query params chỉ cho phép `section?`, `tag?`, `q?`; default load full handbook | `NewcomerFaqHandbookDto` với `generalFaq[]`, `faqSections[]`, `faqEntries[]`, `caseStudies[]`, `disclaimerBlock` | `content.handbook_not_found`, `content.handbook_query_invalid` | content aggregate owner; FE không tự ráp từ nhiều post/beginner-guide rời |
| newcomer onboarding roadmap aggregate | query params chỉ cho phép `track?`; default `track = standard-30d` | `NewcomerOnboardingRoadmapDto` với `weeks[]`, `completionChecklist[]`, `safetyRules[]`, `nextActions[]` | `content.roadmap_not_found`, `content.roadmap_query_invalid` | content owner cho chapter 13 roadmap; engagement chỉ attach progress aux khi signed-in |
| newcomer onboarding 90d aggregate | query params chỉ cho phép `locale?`; default `locale = vi-VN` | `NewcomerOnboarding90dDto` với `months[]`, `tableChecklist[]` | `content.roadmap90d_not_found`, `content.roadmap90d_query_invalid` | owner cho bản 90 ngày Việt, không ghép client-side từ roadmap 30d |
| newcomer encyclopedia aggregate | query params chỉ cho phép `part?`; default load toàn bộ package | `NewcomerEncyclopediaDto` với `toc[]`, `chapters[]`, refs tới faq/glossary/audio/onboarding | `content.encyclopedia_not_found`, `content.encyclopedia_query_invalid` | package aggregate, tránh FE scrape markdown dài |
| newcomer glossary aggregate | query params chỉ cho phép `q?`; default full list | `NewcomerGlossaryDto` với `entries[]` | `content.glossary_not_found`, `content.glossary_query_invalid` | owner cho glossary Trung-Việt-Anh |
| newcomer audio overview aggregate | query params chỉ cho phép `version?`; default latest | `NewcomerAudioOverviewDto` với `durationMinutes`, `scriptBlocks[]` | `content.audio_overview_not_found`, `content.audio_overview_query_invalid` | owner cho script audio, không hardcode ở FE |
| practice support altar-care aggregate | query params chỉ cho phép `version?`; default latest published | `PracticeSupportAltarCareDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | content owner của ritual operations baseline |
| practice support little-house-writing aggregate | query params chỉ cho phép `version?`; default latest published | `PracticeSupportLittleHouseWritingRulesDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | không để FE tự suy luận regex/tip từ prose rời |
| practice support little-house-allocation aggregate | query params chỉ cho phép `scenario?`; default full guideline | `PracticeSupportLittleHouseAllocationGuidelinesDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | owner cho định mức NNN theo tình huống |
| practice support heart-incense aggregate | query params chỉ cho phép `mode?`; default `standard-travel` | `PracticeSupportHeartIncenseDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | owner cho flow Tâm Hương + emergency NNN flow khi travel |
| practice support name-change aggregate | query params chỉ cho phép `version?`; default latest published | `PracticeSupportNameChangeRitualDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | owner cho Đơn Thăng Văn đổi tên |
| practice support fetal-karma aggregate | query params chỉ cho phép `scenario?`; default full guideline | `PracticeSupportFetalKarmaResolutionDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | owner cho lane hóa giải nghiệp thai nhi |
| practice support recitation aggregate | query params chỉ cho phép `version?`; default latest published | `PracticeSupportRecitationGuideDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | owner cho lane niệm kinh và thập tiểu chú |
| practice support life-release selection aggregate | query params chỉ cho phép `version?`; default latest published | `PracticeSupportLifeReleaseSelectionGuideDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | owner cho lane chọn loài phóng sanh và nghi thức đi kèm |
| practice support vietnam home-practice aggregate | query params chỉ cho phép `version?`; default latest published | `PracticeSupportVietnamHomePracticeGuideDto` | `content.practice_support_not_found`, `content.practice_support_query_invalid` | owner cho lane tu học tại gia Việt Nam + kỷ luật pháp lý/đạo đức |
| member practice profile | body/query shape tối thiểu: `GET` không bắt query ngoài `tz?`; `PATCH` body chỉ được gồm `experienceTier`, `baselineMode`, `skipBeginnerTrack`, `privateStreakEnabled` | `PracticeProfileDto` | `auth.session_missing`, `engagement.practice_profile_invalid`, `engagement.practice_profile_conflict` | practice profile là authority riêng; không nhét vào auth profile hay daily sheet payload tùy hứng |
| member practice log list/self-state | `GET /engagement/practice-logs` dùng list query canon; `GET/PUT /engagement/practice-logs/self` chỉ nhận self-save body với completed counts/note/clientEventId, không nhận profile-level fields | `PracticeLogItemDto[]` hoặc `PracticeLogSelfStateDto` | `auth.session_missing`, `engagement.practice_log_invalid`, `engagement.practice_log_conflict` | `practiceLogs` là historical/self-save lane riêng; không collapse vào `practiceSheets` chỉ vì đều thuộc practice module |
| member practice sheet detail/mutation | `PATCH`/`complete` body chỉ được mutate self-owned completion fields; profile-level fields không được update qua sheet route | `PracticeSheetDetailDto` hoặc `PracticeSheetMutationResultDto` với `sheet`, `profile`, `baselineWarning?`, `privateStreak?` | `auth.session_missing`, `engagement.practice_sheet_invalid`, `engagement.practice_sheet_transition_invalid`, `engagement.practice_foundation_warning` | sheet route phải trả đủ aggregate để client không fan-out thêm `/practice-profile` sau mỗi save nếu response đã có projection |

### Route inventory dependency

Các row `P0 anti-invention surface` ở trên không được đứng riêng.
Mỗi row phải map được sang route canon hiện có trong `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md` hoặc phải chặn scaffold cho tới khi inventory được bổ sung:

- member dashboard aggregate -> hiện map vào `GET /dashboard`
- notification preferences aggregate -> hiện map vào `GET /notifications/preferences`
- search results aggregate -> hiện map vào `GET /search`
- offline bundle list page -> hiện map vào `GET /offline-bundles`
- personal practice calendar page -> hiện map vào `GET /calendar/personal-practice`
- newcomer faq handbook aggregate -> hiện map vào `GET /content/newcomer/faq-handbook`
- newcomer onboarding roadmap aggregate -> hiện map vào `GET /content/newcomer/onboarding-roadmap`
- newcomer onboarding 90d aggregate -> hiện map vào `GET /content/newcomer/onboarding-90d`
- newcomer encyclopedia aggregate -> hiện map vào `GET /content/newcomer/encyclopedia`
- newcomer glossary aggregate -> hiện map vào `GET /content/newcomer/glossary`
- newcomer audio overview aggregate -> hiện map vào `GET /content/newcomer/audio-overview`
- practice support altar-care aggregate -> hiện map vào `GET /content/practice-support/altar-care`
- practice support little-house-writing aggregate -> hiện map vào `GET /content/practice-support/little-house-writing-rules`
- practice support little-house-allocation aggregate -> hiện map vào `GET /content/practice-support/little-house-allocation-guidelines`
- practice support heart-incense aggregate -> hiện map vào `GET /content/practice-support/heart-incense`
- practice support name-change aggregate -> hiện map vào `GET /content/practice-support/name-change-ritual`
- practice support fetal-karma aggregate -> hiện map vào `GET /content/practice-support/fetal-karma-resolution`
- practice support recitation aggregate -> hiện map vào `GET /content/practice-support/recitation-guide`
- practice support life-release selection aggregate -> hiện map vào `GET /content/practice-support/life-release-selection-guide`
- practice support vietnam home-practice aggregate -> hiện map vào `GET /content/practice-support/vietnam-home-practice-guide`
- member practice profile -> hiện map vào `GET/PATCH /engagement/practice-profile`
- member practice log list/self-state -> hiện map vào `GET /engagement/practice-logs` và `GET/PUT /engagement/practice-logs/self`
- member practice sheet detail/mutation -> hiện map vào `GET/PATCH /engagement/practice-sheets/:publicId` và `POST /engagement/practice-sheets/:publicId/complete`

Nếu route inventory hiện có chưa đủ semantics aggregate cho DTO row tương ứng, phải cập nhật [API_ROUTE_INVENTORY.md](./API_ROUTE_INVENTORY.md) trước; không được để controller hoặc web tự suy luận từ tên gần giống.

## Zod schema naming canon for practice lane

Lane `practice profile + baseline guard + private streak` phải dùng naming ổn định để FE/BE/shared không drift:

- request schemas:
  - `practiceProfileQuerySchema`
  - `practiceProfileUpdateSchema`
  - `practiceSheetQuerySchema`
  - `practiceSheetUpdateSchema`
  - `practiceSheetCompleteSchema`
- response/DTO companion schemas:
  - `practiceProfileDtoSchema`
  - `practiceBaselineWarningSchema`
  - `privatePracticeStreakSchema`
  - `practiceLogItemDtoSchema`
  - `practiceLogSelfStateDtoSchema`
  - `practiceSheetDetailDtoSchema`
  - `practiceSheetMutationResultDtoSchema`
- shared enum/value schemas:
  - `practiceExperienceTierSchema`
  - `practiceBaselineModeSchema`

Additional naming canon cho newcomer handbook lane:

- request schemas:
  - `newcomerFaqHandbookQuerySchema`
  - `newcomerOnboardingRoadmapQuerySchema`
  - `newcomerOnboarding90dQuerySchema`
  - `newcomerEncyclopediaQuerySchema`
  - `newcomerGlossaryQuerySchema`
  - `newcomerAudioOverviewQuerySchema`
  - `adminNewcomerFaqHandbookPatchSchema`
  - `adminNewcomerOnboardingRoadmapPatchSchema`
  - `adminNewcomerOnboarding90dPatchSchema`
  - `adminNewcomerEncyclopediaPatchSchema`
  - `adminNewcomerGlossaryPatchSchema`
  - `adminNewcomerAudioOverviewPatchSchema`
  - `adminNewcomerCaseStudyUpsertSchema`
- response schemas:
  - `newcomerFaqHandbookDtoSchema`
  - `newcomerOnboardingRoadmapDtoSchema`
  - `newcomerOnboarding90dDtoSchema`
  - `newcomerEncyclopediaDtoSchema`
  - `newcomerGlossaryDtoSchema`
  - `newcomerAudioOverviewDtoSchema`
  - `newcomerFaqEntrySchema`
  - `newcomerCaseStudySchema`
  - `newcomerRoadmapWeekSchema`
  - `newcomerRoadmapTaskSchema`

Additional naming canon cho practice-support lane:

- request schemas:
  - `practiceSupportVersionQuerySchema`
  - `practiceSupportScenarioQuerySchema`
  - `adminPracticeSupportPatchSchema`
- response schemas:
  - `practiceSupportAltarCareDtoSchema`
  - `practiceSupportLittleHouseWritingRulesDtoSchema`
  - `practiceSupportLittleHouseAllocationGuidelinesDtoSchema`
  - `practiceSupportHeartIncenseDtoSchema`
  - `practiceSupportNameChangeRitualDtoSchema`
  - `practiceSupportFetalKarmaResolutionDtoSchema`
  - `practiceSupportRecitationGuideDtoSchema`
  - `practiceSupportLifeReleaseSelectionGuideDtoSchema`
  - `practiceSupportVietnamHomePracticeGuideDtoSchema`
  - `practiceSupportRuleItemSchema`
  - `practiceSupportFlowStepSchema`

Rules:

- Zod schema name phải bám vocabulary owner ở file này; không sinh alias thứ hai kiểu `dailyPracticeProfileSchema` nếu cùng một contract.
- field name canon cho streak projection là `privateStreak`; schema name canon là `privatePracticeStreakSchema`.
- `baseline guard` là warning/projection lane, không phải authority mới ngoài `practiceProfileDtoSchema` và `practiceSheet*` schemas.
- nếu controller chỉ cần transport parse cho params/query/body, vẫn phải import từ canonical Zod schema; không tự dựng inline schema cục bộ.

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
  - validation detail chỉ được là safe field-level projection; không lộ raw validator target/value internals

## Request-shape freeze rule

Khi một route family đã có row trong file này:

- không được tự thêm query param mới ở controller nếu chưa bổ sung row owner hoặc section tương ứng
- không được đổi pagination semantics từ `offset` sang `cursor` hoặc ngược lại mà không cập nhật file này
- không được để admin và web dùng cùng tên route nhưng shape filter khác nhau nếu chưa có note tách owner rõ ràng
- nếu route aggregate cần `include*` flag để phase-gate, phải ghi rõ default value và allowed values tại đây trước khi scaffold

## Validation error mapping discipline

- Mỗi P0 route family phải có `error code companion` rõ ràng trong `ERROR_CODE_REGISTRY.md` trước khi scaffold.
- Validation error từ Zod phải đi qua mapper tập trung, trả field-level output theo `fieldErrors` key trong `details`; không trả raw `ZodError` trực tiếp ra client.
- Route family không được tự định nghĩa error shape riêng ngoài canonical error envelope ở `ERROR_ENVELOPE_CONTRACT.md`.
- `validation.invalid_body`, `validation.invalid_query`, `validation.invalid_params` là 3 code boundary cho input validation; `validation.constraint_failed` là code cho semantic business constraint đã qua schema.
- Không được merge validation error và domain error vào cùng 1 response field; chúng đi 2 code family riêng.

## Auth scope — DTO rule

- Route family nào gắn auth scope `member+` hoặc `admin+` phải có error code `auth.session_missing` trong companion list.
- Nếu route cần phân biệt `thiếu session` vs `đủ session nhưng không đủ quyền`, phải ghi rõ 2 error codes: `auth.session_missing` (401) và `auth.forbidden` (403).
- DTO projection cho member route không được bao gồm field `admin-only`; ngược lại admin route không được trả field `public-only` nếu có security implication.
- Nếu một route có thể trả kết quả khác nhau dựa trên auth state (public fallback vs member personalized), phải note rõ `dual-mode projection` và phần personalized phải là aux non-blocking.

## Dashboard aggregate — cache invalidation ownership

- `MemberDashboardDto` là primary aggregate; query key root là `['dashboard']` hoặc `['dashboard', userId]`.
- Không section nào trong dashboard được tự invalidate query key riêng trừ khi section đó đã phase-gated thành route độc lập trong `API_ROUTE_INVENTORY.md`.
- Các mutation trong `engagement`, `vows-merit`, `calendar`, `notification` modules mà ảnh hưởng dashboard state phải invalidate `['dashboard']` root key → không invalidate chỉ section key riêng lẻ.
- Server-side invalidation authority thuộc `apps/api`; client không được tự quyết định invalidation schedule dựa trên timer hoặc scroll event.
- `advisorySummary` trong dashboard phải đến từ aggregate hoặc phải là aux với query key riêng nếu phase-gated; không để RSC tự gọi calendar API rồi merge.
