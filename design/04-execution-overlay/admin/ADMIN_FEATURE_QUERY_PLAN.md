# ADMIN_FEATURE_QUERY_PLAN

File này chốt `query key factory plan` cho `apps/admin/src/features/*/queries.ts` và `mutations.ts`.

Mục tiêu:

- không phải đoán tên key family khi scaffold
- gom query exports, mutation exports, invalidation graph, và readiness status vào 1 chỗ
- làm cầu nối giữa `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md` và `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md`

> Canon refs:
> - `design/04-execution-overlay/admin/ADMIN_PAGE_API_MAPPING.md`
> - `design/04-execution-overlay/admin/APPS_ADMIN_SCAFFOLD_BACKLOG.md`
> - `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`

---

## Conventions

- Mỗi feature có 1 `keys` object với `all`, `list`, `detail`, `aux` khi cần.
- `queries.ts` export query key factory + query option builders.
- `mutations.ts` export mutation option builders + `onSuccess` invalidation choreography.
- Status:
  - `ready`: có thể scaffold ngay
  - `conditional`: scaffold được nhưng phải giữ note permission/data-shape đặc biệt
  - `blocked`: chưa scaffold cho tới khi route canon hoặc mapping owner được chốt thêm

## Feature plan

| Feature folder | Query key factory plan | `queries.ts` exports tối thiểu | `mutations.ts` exports tối thiểu | Minimum invalidation | Status |
|---|---|---|---|---|---|
| `dashboard` | `dashboardKeys.page()` | `dashboardKeys`, `getAdminDashboardPageQuery` | none | n/a | `ready` |
| `posts` | `postAdminKeys.list(filters)`, `postAdminKeys.detail(publicId)`, `postAdminKeys.aux.statuses()` | `postAdminKeys`, `getAdminPostsQuery`, `getAdminPostQuery`, `getPostStatusesQuery` | `createPostMutation`, `updatePostMutation`, `publishPostMutation` | posts list/detail + root dashboard aggregate nếu widget liên quan bị ảnh hưởng + public cache owner | `ready` |
| `beginner-guides` | `beginnerGuideAdminKeys.list(filters)`, `beginnerGuideAdminKeys.detail(slugOrId)` | `beginnerGuideAdminKeys`, `getAdminBeginnerGuidesQuery`, `getAdminBeginnerGuideQuery` | `createBeginnerGuideMutation`, `updateBeginnerGuideMutation`, `publishBeginnerGuideMutation` | guide list/detail + related public guide loaders | `ready` |
| `daily-practice-admin` | `dailyPracticeAdminKeys.overview()`, `dailyPracticeAdminKeys.guides(filters)`, `dailyPracticeAdminKeys.presets(filters)`, `dailyPracticeAdminKeys.faq(filters)`, `dailyPracticeAdminKeys.downloads()` | `dailyPracticeAdminKeys`, `getDailyPracticeOverviewQuery`, `getDailyPracticeGuidesQuery`, `getDailyPracticePresetsQuery`, `getDailyPracticeFaqQuery`, `getDailyPracticeDownloadsQuery` | `createDailyPracticeGuideMutation`, `updateDailyPracticeGuideMutation`, `createScenarioPresetMutation`, `updateScenarioPresetMutation`, `createDailyPracticeFaqMutation`, `updateDailyPracticeFaqMutation`, `publishDailyPracticeWorkspaceMutation` | whole workspace + public grouped loaders | `ready` |
| `little-house-admin` | `littleHouseAdminKeys.overview()`, `littleHouseAdminKeys.guides(filters)`, `littleHouseAdminKeys.caseVariants(filters)`, `littleHouseAdminKeys.faq(filters)`, `littleHouseAdminKeys.downloads()` | `littleHouseAdminKeys`, `getLittleHouseOverviewQuery`, `getLittleHouseGuidesQuery`, `getLittleHouseCaseVariantsQuery`, `getLittleHouseFaqQuery`, `getLittleHouseDownloadsQuery` | `createLittleHouseGuideMutation`, `updateLittleHouseGuideMutation`, `createLittleHouseCaseVariantMutation`, `updateLittleHouseCaseVariantMutation`, `createLittleHouseFaqMutation`, `updateLittleHouseFaqMutation`, `publishLittleHouseWorkspaceMutation` | whole workspace + public grouped loaders | `ready` |
| `life-release-admin` | `lifeReleaseAdminKeys.overview()`, `lifeReleaseAdminKeys.guides(filters)`, `lifeReleaseAdminKeys.variants(filters)`, `lifeReleaseAdminKeys.faq(filters)`, `lifeReleaseAdminKeys.downloads()` | `lifeReleaseAdminKeys`, `getLifeReleaseOverviewQuery`, `getLifeReleaseGuidesQuery`, `getLifeReleaseVariantsQuery`, `getLifeReleaseFaqQuery`, `getLifeReleaseDownloadsQuery` | `createLifeReleaseGuideMutation`, `updateLifeReleaseGuideMutation`, `createLifeReleaseVariantMutation`, `updateLifeReleaseVariantMutation`, `createLifeReleaseFaqMutation`, `updateLifeReleaseFaqMutation`, `publishLifeReleaseWorkspaceMutation` | whole workspace + public guide surfaces | `ready` |
| `media-library-admin` | `mediaLibraryAdminKeys.overview()`, `mediaLibraryAdminKeys.collections(filters)`, `mediaLibraryAdminKeys.collection(publicId)`, `mediaLibraryAdminKeys.featured()`, `mediaLibraryAdminKeys.tags()` | `mediaLibraryAdminKeys`, `getMediaLibraryOverviewQuery`, `getMediaCollectionsQuery`, `getMediaCollectionQuery`, `getFeaturedCollectionsQuery`, `getMediaTagsQuery` | `createMediaCollectionMutation`, `updateMediaCollectionMutation`, `addCollectionItemMutation`, `updateCollectionItemMutation`, `updateFeaturedCollectionsMutation`, `publishMediaLibraryMutation` | collections list/detail + featured + tags | `ready` |
| `sutras-admin` | `sutraAdminKeys.list(filters)`, `sutraAdminKeys.detail(publicId)` | `sutraAdminKeys`, `getSutrasQuery`, `getSutraQuery` | `createSutraMutation`, `updateSutraMutation`, `publishSutraMutation` | list/detail + dependent grouped loaders | `conditional` |
| `chant-admin` | `chantAdminKeys.items(filters)`, `chantAdminKeys.item(publicId)`, `chantAdminKeys.ritualTemplates(filters)`, `chantAdminKeys.ritualTemplate(publicId)`, `chantAdminKeys.plans(filters)`, `chantAdminKeys.plan(publicId)` | `chantAdminKeys`, `getChantItemsQuery`, `getChantItemQuery`, `getChantRitualTemplatesQuery`, `getChantRitualTemplateQuery`, `getChantPlansQuery`, `getChantPlanQuery` | `createChantItemMutation`, `updateChantItemMutation`, `createChantRitualTemplateMutation`, `updateChantRitualTemplateMutation`, `createChantPlanMutation`, `updateChantPlanMutation`, `publishChantMutation` | item/detail + ritual-template/detail + dependent chanting or grouped loaders | `conditional` |
| `media-admin` | `mediaAdminKeys.assets(filters)`, `mediaAdminKeys.detail(publicId)` | `mediaAdminKeys`, `getMediaAssetsQuery`, `getMediaAssetQuery` | `uploadMediaMutation`, `updateMediaAssetMutation`, `deleteMediaAssetMutation` | asset list/detail + embedding workspace keys | `ready` |
| `wisdom-baihoa` | `wisdomAdminKeys.list(filters)`, `wisdomAdminKeys.detail(publicId)`, `wisdomAdminKeys.duplicateCheck(params)`, `wisdomAdminKeys.slugPreview(params)`, `authorityProfileKeys.list(filters)`, `authorityProfileKeys.detail(publicId)`, `wisdomAdminKeys.offlineBundles()`, `wisdomAdminKeys.importJobs()`, `wisdomAdminKeys.importJob(publicId)`, `baihuaAdminKeys.books(filters)`, `baihuaAdminKeys.chapter(publicId)` | `wisdomAdminKeys`, `authorityProfileKeys`, `baihuaAdminKeys`, `getAdminWisdomEntriesQuery`, `getAdminWisdomEntryQuery`, `checkWisdomDuplicateQuery`, `previewWisdomSlugQuery`, `getAdminAuthorityProfilesQuery`, `getAdminAuthorityProfileQuery`, `getAdminOfflineBundlesQuery`, `getAdminImportJobsQuery`, `getAdminImportJobQuery`, `getAdminBaihuaBooksQuery`, `getAdminBaihuaChapterQuery` | `createWisdomEntryMutation`, `updateWisdomEntryMutation`, `publishWisdomEntryMutation`, `createAuthorityProfileMutation`, `updateAuthorityProfileMutation`, `triggerWisdomIngestionMutation`, `retryWisdomImportJobMutation`, `importBaihuaSourceMutation`, `updateBaihuaTranslationMutation`, `publishBaihuaChapterMutation`, `rebuildOfflineBundlesMutation` | wisdom list/detail + authority profile list/detail + bundles + import jobs/detail + baihua chapter + freshness widgets | `ready` |
| `community-posts-admin` | `communityPostAdminKeys.list(filters)`, `communityPostAdminKeys.detail(publicId)` | `communityPostAdminKeys`, `getCommunityPostsQuery`, `getCommunityPostQuery` | `moderateCommunityPostMutation`, `hideCommunityPostMutation`, `restoreCommunityPostMutation` | list/detail + dashboard widgets | `conditional` |
| `guestbook-admin` | `guestbookAdminKeys.list(filters)`, `guestbookAdminKeys.detail(publicId)` | `guestbookAdminKeys`, `getGuestbookEntriesQuery`, `getGuestbookEntryQuery` | `approveGuestbookEntryMutation`, `rejectGuestbookEntryMutation` | list/detail + moderation/dashboard widgets | `conditional` |
| `moderation-reports` | `moderationReportKeys.list(filters)`, `moderationReportKeys.detail(publicId)` | `moderationReportKeys`, `getModerationReportsQuery`, `getModerationReportQuery` | `resolveModerationReportMutation` | report list/detail + affected target workspace + root dashboard aggregate nếu summary moderation bị ảnh hưởng | `ready` |
| `moderated-comments` | `moderatedCommentKeys.list(filters)`, `moderatedCommentKeys.detail(publicId)` | `moderatedCommentKeys`, `getModeratedCommentsQuery`, `getModeratedCommentQuery` | `hideCommentMutation`, `restoreCommentMutation` | comment list/detail + report list + target content detail | `conditional` |
| `users-admin` | `userAdminKeys.list(filters)`, `userAdminKeys.detail(publicId)`, `userAdminKeys.audit(publicId, filters)`, `userAdminKeys.practiceStats(publicId)` | `userAdminKeys`, `getAdminUsersQuery`, `getAdminUserQuery`, `getAdminUserAuditQuery`, `getAdminUserPracticeStatsQuery` | `updateAdminUserProfileMutation`, `changeAdminUserRoleMutation`, `blockAdminUserMutation`, `unblockAdminUserMutation` | users list/detail + audit/practice-stats + sessions + dashboard | `ready` |
| `sessions-admin` | `sessionAdminKeys.list(filters)`, `sessionAdminKeys.detail(sessionId)`, `sessionAdminKeys.byUser(userPublicId)` | `sessionAdminKeys`, `getAdminSessionsQuery`, `getAdminSessionQuery`, `getAdminSessionsByUserQuery` | `revokeAdminSessionMutation`, `revokeAdminSessionsBulkMutation`, `revokeAllUserSessionsMutation` | sessions list/detail/by-user + affected user detail | `ready` |
| `feature-flags-admin` | `featureFlagKeys.list()`, `featureFlagKeys.detail(key)` | `featureFlagKeys`, `getFeatureFlagsQuery`, `getFeatureFlagQuery` | `updateFeatureFlagMutation` | flag list/detail + directly bound screens | `conditional` |
| `audit-logs-admin` | `auditLogKeys.list(filters)`, `auditLogKeys.detail(id)` | `auditLogKeys`, `getAuditLogsQuery`, `getAuditLogQuery` | none | n/a | `conditional` |
| `events-admin` | `eventKeys.list(filters)`, `eventKeys.detail(eventId)`, `eventKeys.agenda(eventId)`, `eventKeys.speakers(eventId)`, `eventKeys.ctas(eventId)`, `eventKeys.overrides(filters)`, `eventKeys.override(publicId)`, `eventKeys.status()`, `eventKeys.advisoryPreview(params)`, `eventKeys.inspect(params)` | `eventKeys`, `getEventsQuery`, `getEventQuery`, `getEventAgendaQuery`, `getEventSpeakersQuery`, `getEventCtasQuery`, `getCalendarOverridesQuery`, `getCalendarOverrideQuery`, `getCalendarStatusQuery`, `getCalendarAdvisoryPreviewQuery`, `getCalendarInspectQuery` | `createEventMutation`, `updateEventMutation`, `publishEventMutation`, `rescheduleEventMutation`, `cancelEventMutation`, `createAgendaItemMutation`, `updateAgendaItemMutation`, `reorderAgendaMutation`, `createSpeakerMutation`, `updateSpeakerMutation`, `createEventCtaMutation`, `updateEventCtaMutation`, `createLunarOverrideMutation`, `updateLunarOverrideMutation`, `deleteLunarOverrideMutation`, `refreshPersonalPracticeMutation` | event list/detail + touched child keys + override list/detail + calendar status + inspect keys + public event/advisory surfaces | `ready` |
| `search-admin` | `searchAdminKeys.status()`, `searchAdminKeys.operationalStatus()`, `searchAdminKeys.performance(filters)`, `searchAdminKeys.indexingJobs(filters)`, `searchAdminKeys.indexingJob(publicId)`, `searchAdminKeys.fallbackEvents(filters)`, `searchAdminKeys.indexSettings()` | `searchAdminKeys`, `getSearchStatusQuery`, `getSearchOperationalStatusQuery`, `getSearchPerformanceQuery`, `getSearchIndexingJobsQuery`, `getSearchIndexingJobQuery`, `getSearchFallbackEventsQuery`, `getSearchIndexSettingsQuery` | `reindexAllMutation`, `reindexSourceMutation`, `updateSearchIndexSettingsMutation` | status + operational-status + indexing-jobs/detail + performance/fallback summaries; optionally surfaced content freshness keys | `ready` |
| `notifications-admin` | `notificationAdminKeys.status()`, `notificationAdminKeys.pushJobs(filters)`, `notificationAdminKeys.pushJob(publicId)`, `notificationAdminKeys.subscriptionStats()` | `notificationAdminKeys`, `getNotificationStatusQuery`, `getPushJobsQuery`, `getPushJobQuery`, `getNotificationSubscriptionStatsQuery` | `createPushJobMutation`, `processPushJobMutation`, `redrivePushJobMutation` | push jobs list/detail + status + subscription-stats | `ready` |
| `volunteers-admin` | `volunteerKeys.list()`, `volunteerKeys.detail(publicId)`, `contactInfoKeys.detail()` | `volunteerKeys`, `contactInfoKeys`, `getVolunteersQuery`, `getVolunteerQuery`, `getAdminContactInfoQuery` | `createVolunteerMutation`, `updateVolunteerMutation`, `deleteVolunteerMutation`, `sortVolunteersMutation`, `updateContactInfoMutation` | volunteers list/detail + contact-info | `conditional` |
| `health-admin` | `healthAdminKeys.summary()`, `healthAdminKeys.checks()` | `healthAdminKeys`, `getHealthExtendedQuery` | none | polling only | `ready` |
| `assisted-entry-admin` | `assistedEntryKeys.history(filters)`, `assistedEntryKeys.memberSearch(filters)`, `assistedEntryKeys.memberVows(memberPublicId)` | `assistedEntryKeys`, `getAssistedEntryHistoryQuery`, `searchAssistedEntryMembersQuery`, `getAssistedEntryMemberVowsQuery` | `createAssistedLifeReleaseMutation`, `createAssistedVowProgressMutation` | history + affected member detail + affected vow detail + root dashboard aggregate nếu support widget được surface | `ready` |

## Blocked features phải giữ nguyên trạng

- `moderated-comments`: route canon đã có baseline, nhưng detail projection vẫn phải bám `AdminModeratedCommentDetailDto`.
- `audit-logs-admin`: route canon đã mở baseline; metadata projection vẫn phải bám allowlist trong `design/04-execution-overlay/api/API_DTO_SHAPE_PLAN.md`.
- `queue-ops`: không nằm trong plan này.

## Generator order

1. shared query infra
2. `dashboard`, `feature-flags-admin`, `health-admin`
3. editorial features
4. moderation + events + notifications
5. `users-admin`, `sessions-admin`, `wisdom-baihoa`, `assisted-entry-admin`, `volunteers-admin`

Nếu có xung đột giữa file này và `design/04-execution-overlay/api/API_ROUTE_INVENTORY.md`, route inventory thắng; file này phải được cập nhật theo.
