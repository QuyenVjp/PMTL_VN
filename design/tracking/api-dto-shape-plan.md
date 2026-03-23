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
| wisdom list | `WisdomListItemDto` | `publicId`, `slug`, `entryType`, `sourceFamily`, `titleVietnamese`, `summaryVietnamese`, `sourceCode`, `publishedAt`, `hasAudio` | không đưa full original text vào list |
| wisdom detail | `WisdomDetailDto` | list item fields + `titleOriginal`, `translatedText`, `rawOriginalText?`, `sourceUrl`, `sourceAttribution`, `keywordAliases[]`, `relatedEntries[]` | `question/answer` pair chỉ hiện khi `entryType = qa` |
| offline bundle list | `OfflineBundleListItemDto` | `publicId`, `bundleType`, `scope`, `version`, `freshnessStatus`, `lastRebuiltAt`, `downloadSize`, `syncStatus` | cho `/ngoai-tuyen` |
| member notification preferences page | `NotificationPreferencesPageDto` | `capability`, `subscriptionState`, `categoryPreferences[]`, `practiceReminder`, `eventReminder`, `conflicts[]`, `lastEvaluatedAt` | owner cho `/thong-bao`; page settings surface, không phải inbox |
| admin table common | `AdminTableRowDto` | `publicId`, `status`, `createdAt`, `updatedAt`, `lastModifiedBy?` | base shape cho tables |
| admin search status | `AdminSearchStatusDto` | `requestedEngine`, `actualEngine`, `indexFreshnessSeconds`, `documentCount`, `pendingJobs`, `lastSuccessfulReindexAt`, `meiliHealth`, `sqlFallbackAvailable`, `bootstrapFallbackActive` | owner cho `/admin/search/status` và `operational-status` |
| admin search indexing job | `AdminSearchIndexingJobDto` | `publicId`, `source`, `triggerType`, `status`, `startedAt`, `finishedAt`, `durationMs`, `rowsIndexed`, `rowsDeleted`, `actorUserId?`, `requestId?`, `errorSummary?` | không nhét raw logs vào DTO detail |
| admin search fallback event | `AdminSearchFallbackEventDto` | `occurredAt`, `requestedEngine`, `actualEngine`, `reason`, `route`, `queryHash`, `durationMs`, `userAgentClass`, `requestId` | không expose raw query text |
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

## Readiness note

File này không thay Zod schema runtime.
Khi scaffold thật:

1. `packages/shared` tạo schema theo profile này
2. controller/service dùng `select`/projection bám profile
3. admin/web query layer không tự mở rộng field ngoài owner row
