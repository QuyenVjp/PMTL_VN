# Domains

File này tóm tắt `domain ownership (quyền sở hữu mô-đun)` theo hướng `apps/api` là backend authority.
Canonical source (nguồn chuẩn) vẫn là:

- [design/overview/architecture-principles.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/overview/architecture-principles.md)
- [design/tracking/module-interactions.md](C:/Users/ADMIN/DEV2/PMTL_VN/design/tracking/module-interactions.md)

## Identity

Owns:

- `users`
- auth/session lifecycle
- role and profile basics

Notes:

- `NestJS auth` là auth authority duy nhất.
- Browser session đi qua access token + refresh rotation policy.
- Google login được phép nếu vẫn map vào cùng authority này.

## Content

Owns:

- `posts`
- `hubPages`
- `beginnerGuides`
- `downloads`
- `sutras`
- `sutraVolumes`
- `sutraChapters`
- `sutraGlossary`
- `chantItems`
- `chantPlans`
- content media linkage

Notes:

- `content` giữ editorial/public support content.
- search source fields nằm ở owner records này.

## Community

Owns:

- `postComments`
- `communityPosts`
- `communityComments`
- `guestbookEntries`

Notes:

- đây là UGC surface (bề mặt nội dung do người dùng tạo)
- moderation report lifecycle không nằm ở đây

## Engagement

Owns:

- `sutraBookmarks`
- `sutraReadingProgress`
- `chantPreferences`
- `practiceLogs`
- `practiceSheets`
- `ngoiNhaNhoSheets`

Notes:

- đây là `self-owned state (trạng thái cá nhân do người dùng sở hữu)`
- không ghi ngược vào canonical content data

## Moderation

Owns:

- `moderationReports`

Notes:

- report lifecycle source of truth nằm ở đây
- entity đích chỉ giữ summary fields

## Search

Owns:

- search query contract
- indexing projection contract
- search runtime status contract

Notes:

- không sở hữu canonical business data
- phase 1 có thể Postgres-first
- phase 2 mới bật Meilisearch nếu pain đủ rõ

## Calendar

Owns:

- `events`
- `lunarEvents`
- `lunarEventOverrides`
- `personalPracticeCalendarReadModel`

Notes:

- event ownership nằm ở calendar
- advisory/read model là derived output, không phải user-owned canonical state

## Notification

Owns:

- `pushSubscriptions`
- `pushJobs`
- reminder schedule khi feature đủ lớn

Notes:

- notification là async control-plane
- không phải inbox canonical domain

## Vows & Merit

Owns:

- `vows`
- `vowProgressEntries`
- `lifeReleaseJournal`
- `lifeReleaseChecklistSnapshots`

Notes:

- đây là self-owned practice records
- không trộn vào community feed mặc định

## Wisdom & QA

Owns:

- `wisdomEntries`
- `qaEntries`
- `authorityProfiles`
- `offlineBundles`

Notes:

- retrieval-first, source-provenance-first
- không dùng AI để bịa authority content

## Platform / Control Plane

Không thuộc `00-09` business modules nhưng là owner thật:

- `sessions`
- `audit_logs`
- `feature_flags`
- `rate_limit_records`
- `media_assets`
- health endpoints
- metrics endpoint
- storage abstraction

Các phần này nên sống ở:

- `apps/api/src/platform/*`

Không được để domain modules tự copy lại các năng lực này.
