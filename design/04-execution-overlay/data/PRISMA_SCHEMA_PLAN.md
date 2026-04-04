# Prisma Schema Plan (Kế hoạch hợp nhất schema)

File này chốt kế hoạch merge 11 module `schema.dbml` thành 1 `prisma/schema.prisma` tổng.
Không có file này, developer phải tự đoán thứ tự table, foreign keys, enums.

> **Migration order**: xem [CODING_READINESS.md](../repo/CODING_READINESS.md) Phần 6 cho 12 bước chi tiết
> **Module schemas**: mỗi domain owner giữ `SCHEMA_PLAN.dbml` riêng trong `design/03-domains/<domain>/`

---

## Source files

| Module | Schema file | Tables chính |
|---|---|---|
| Platform | `design/02-platform-baseline/api-runtime/PLATFORM_MODULES.md` | `feature_flags`, `audit_logs`, `rate_limit_records` |
| `identity` | `design/03-domains/identity/SCHEMA_PLAN.dbml` | `users`, `sessions` |
| `content` | `design/03-domains/content/SCHEMA_PLAN.dbml` | `posts`, `media_assets`, `categories`, `tags`, `hub_pages`, `hub_page_blocks`, `beginner_guides`, `downloads`, `media_collections`, `media_collection_items`, `chant_items`, `chant_plans`, `chant_plan_items`, `sutras`, `sutra_volumes`, `sutra_chapters`, `sutra_glossary` |
| `community` | `design/03-domains/community/SCHEMA_PLAN.dbml` | `post_comments`, `post_comment_hearts`, `community_posts`, `community_post_hearts`, `community_comments`, `community_comment_hearts`, `guestbook_entries` |
| `engagement` | `design/03-domains/engagement/SCHEMA_PLAN.dbml` | `sutra_bookmarks`, `sutra_reading_progress`, `chant_preferences`, `chant_preference_optional_items`, `chant_preference_targets`, `chant_preference_intentions`, `practice_logs`, `practice_log_item_states`, `practice_sheets`, `practice_sheet_items`, `ngoi_nha_nho_sheets`, `ngoi_nha_nho_sheet_entries`, `ngoi_nha_nho_sheet_audit_snapshots` |
| `moderation` | `design/03-domains/moderation/SCHEMA_PLAN.dbml` | `moderation_reports` |
| `search` | `design/03-domains/search/SCHEMA_PLAN.dbml` | `search_index_metadata` (optional) |
| `calendar` | `design/03-domains/calendar/SCHEMA_PLAN.dbml` | `events`, `event_agenda_items`, `event_speakers`, `event_ctas`, `event_gallery_media`, `event_files`, `lunar_events`, `lunar_event_overrides`, `personal_practice_calendar_read_model` |
| `notification` | `design/03-domains/notification/SCHEMA_PLAN.dbml` | `push_subscriptions`, `push_jobs` |
| `vows-merit` | `design/03-domains/vows-merit/SCHEMA_PLAN.dbml` | `vows`, `vow_progress_entries`, `life_release_journal` |
| `wisdom-qa` | `design/03-domains/wisdom-qa/SCHEMA_PLAN.dbml` | `authority_profiles`, `wisdom_entries`, `qa_entries`, `audio_talk_entries`\*, `video_talk_entries`\*, `offline_bundles`, `offline_bundle_entries`, `offline_sync_states` |
| `contact` | `design/03-domains/contact/SCHEMA_PLAN.dbml` | `contact_info`, `volunteers` |

Lưu ý:
- cột `Tables chính` chỉ là summary để đọc nhanh, không phải exhaustive table list cho migration merge.
- `post_comments` là editorial blog comment thuộc content/community public surfaces; `community_comments` là comment của member/community posts. Hai family khác module behavior và khác visibility rules.
- child/junction tables canonical phải đọc thêm ở `Foreign key dependency graph` phía dưới, ví dụ:
  - `post_tags`, `post_related_posts`, `post_gallery_media`
  - `hub_page_curated_posts`, `beginner_guide_media`
  - `chant_item_preview_media`, `chant_item_recommended_presets`, `chant_item_time_rules`, `chant_plan_items`
- `audio_talk_entries`* và `video_talk_entries`* (đánh dấu * ở bảng trên) là **schema-only** ở phase hiện tại:
  - **Không được tự mở DTO** cho hai table này nếu chưa có owner row trong `API_DTO_SHAPE_PLAN.md`.
  - **Không được tự mở route** nếu chưa có route row trong `API_ROUTE_INVENTORY.md`.
  - Scaffold DB migration cho hai table theo thứ tự wisdom-qa bình thường, nhưng **không cho controller hoặc admin workspace fetch trực tiếp** trước khi có phase gate rõ.


---

## Shared enums (cần define ở top of schema)

```prisma
enum Role {
  visitor
  member
  editor
  admin
  super_admin
}

enum ContentPublicationStatus {
  draft
  published
}

enum MediaStatus {
  pending_scan
  approved
  quarantined
  rejected
}

enum ReportStatus {
  pending
  resolved_hidden
  resolved_ignored
}

enum CommunityModerationState {
  pending
  approved
  rejected
  flagged
  hidden
}

enum CommunityVisibilityState {
  pending_review
  visible
  auto_hidden
  moderator_hidden
  rejected
}

enum GuestbookStatus {
  pending
  approved
  rejected
}

enum VowStatus {
  active
  completed
  voided
}

enum PushJobStatus {
  pending
  processing
  completed
  failed
}

enum WisdomReviewStatus {
  translated_draft
  translated_reviewed
  source_verified
}

enum ProvenanceType {
  official
  mirror
  volunteer
  translation
  annotation
}

enum PracticeSheetType {
  daily_practice
  event_preparation
  vow_support
}

enum PracticeSheetStatus {
  draft
  in_progress
  completed
  archived
}

enum PracticeExperienceTier {
  newcomer
  established
  experienced_new_to_app
}

enum PracticeBaselineMode {
  beginner_guided
  standard_foundation
  custom_with_warning
}

enum NgoiNhaNhoSheetStatus {
  draft
  in_progress
  completed
  self_stored
  offered
}

enum NgoiNhaNhoSheetType {
  standard
  self_store
  custom
}

enum NgoiNhaNhoRecipientType {
  living_person
  deceased
  fetal
  self_accumulate
  household_member
  karma_resolution
  assist_other
}

enum NgoiNhaNhoBurningMode {
  with_altar
  without_altar
  not_set
}

enum NgoiNhaNhoPreparationState {
  draft_preparation
  guidance_acknowledged
  ready_to_recite
  reciting
  ready_to_burn
}

enum NgoiNhaNhoCounterType {
  great_compassion
  heart_sutra
  rebirth_mantra
  seven_buddhas
}
```

---

## Common patterns (áp dụng cho mọi table)

```prisma
// Mọi table phải có:
id          Int       @id @default(autoincrement())
publicId    String    @unique @default(uuid()) @db.VarChar(36)  // exposed ra API, never expose `id`
// Lưu ý: một số module schema.dbml dùng varchar (unbounded), một số dùng varchar(32).
// Khi merge sang Prisma, chuẩn hóa tất cả publicId thành VarChar(36) cho UUID format.
createdAt   DateTime  @default(now())
updatedAt   DateTime  @updatedAt

// Tables có soft delete:
deletedAt   DateTime?

// Tables reference user:
userId      Int       // FK → users.id
user        User      @relation(fields: [userId], references: [id])
```

---

## Foreign key dependency graph

```
users (root — no FK dependencies)
  ├── sessions
  ├── media_assets
  ├── posts
  ├── post_comments
  ├── post_comment_hearts
  ├── community_posts
  ├── community_post_hearts
  ├── community_comments
  ├── community_comment_hearts
  ├── guestbook_entries
  ├── sutra_bookmarks
  ├── sutra_reading_progress
  ├── chant_preferences
  ├── practice_logs → practice_log_item_states
  ├── practice_sheets → practice_sheet_items
  ├── ngoi_nha_nho_sheets → ngoi_nha_nho_sheet_entries, ngoi_nha_nho_sheet_audit_snapshots
  ├── chant_preference_optional_items
  ├── chant_preference_targets
  ├── chant_preference_intentions
  ├── moderation_reports
  ├── push_subscriptions
  ├── vows
  ├── life_release_journal
  └── offline_sync_states

posts (depends on: users, categories, media_assets)
  ├── post_comments
  ├── post_comment_hearts
  ├── post_tags → tags
  ├── post_related_posts
  ├── post_gallery_media → media_assets
  └── (search index source)

community_posts
  ├── community_post_tags
  ├── community_comments
  └── community_post_hearts

community_comments
  └── community_comment_hearts

categories / tags (standalone lookup tables)

hub_pages → media_assets
  ├── hub_page_blocks
  └── hub_page_curated_posts → posts

beginner_guides
  └── beginner_guide_media → media_assets

downloads → media_assets

media_collections → media_assets
  └── media_collection_items → media_assets

sutras → sutra_volumes → sutra_chapters → sutra_glossary

chant_items → chant_item_preview_media, chant_item_recommended_presets, chant_item_time_rules
chant_plans → chant_plan_items → chant_items

events (standalone)
  ├── event_agenda_items
  ├── event_speakers
  ├── event_ctas
  ├── event_gallery_media
  └── event_files
lunar_events → lunar_event_overrides

vows → vow_progress_entries

authority_profiles → wisdom_entries, qa_entries
offline_bundles → offline_bundle_entries
```

---

## Migration execution order (12 steps)

Ref: [CODING_READINESS.md](../repo/CODING_READINESS.md) Phần 6 cho chi tiết. Summary:

```
1. Platform tables (feature_flags, audit_logs, rate_limit_records)
2. Identity (users, sessions)
3. Content (media, categories, tags, posts, guides, sutras, chants)
4. Community (comments, community posts, guestbook)
5. Engagement (bookmarks, progress, practice logs, sheets)
6. Moderation (reports)
7. Search (index metadata)
8. Calendar (events, agenda/speakers/ctas/assets, lunar, personal calendar)
9. Notification (subscriptions, jobs)
10. Vows & Merit (vows, progress, journal)
11. Wisdom QA (authority profiles, entries, offline bundles)
12. Contact (contact info, volunteers)
```

---

## Reference table stubs (quan trọng khi merge)

> Các table `users` và `media_assets` xuất hiện trong nhiều file `SCHEMA_PLAN.dbml` (`identity`, `content`, `engagement`, `calendar`...).
> Đây là **reference stubs** chỉ chứa `id` + `public_id` để DBML visualizer render được FK arrows.
> Khi merge sang Prisma, chỉ lấy **1 bản canonical** từ module owner:
> - `users` → `design/03-domains/identity/SCHEMA_PLAN.dbml`
> - `media_assets` → `design/03-domains/content/SCHEMA_PLAN.dbml`
> - `sutras`, `sutra_chapters`, `chant_items`, `chant_plans` → `design/03-domains/content/SCHEMA_PLAN.dbml`
>
> Các module khác chỉ tạo `@relation` tới bản canonical, không duplicate model.

---

## Merge process (khi bắt đầu code Wave 1)

1. Đọc tất cả `schema.dbml` files
2. Map sang Prisma syntax (DBML → Prisma schema)
3. Resolve naming conflicts (nếu 2 modules đặt trùng tên)
4. Add shared enums ở top
5. Verify FK relationships match dependency graph
6. Run `npx prisma validate`
7. Run `npx prisma migrate dev --name init_all_tables`
8. Seed feature_flags + super-admin

---

## Naming conventions (Prisma)

| Convention | Rule | Ví dụ |
|---|---|---|
| Model name | PascalCase singular | `User`, `Post`, `ModerationReport` |
| Field name | camelCase | `publicId`, `createdAt`, `reviewStatus` |
| Table name | snake_case (@@map) | `@@map("users")`, `@@map("moderation_reports")` |
| Enum name | PascalCase | `Role`, `PostStatus` |
| Enum value | snake_case | `pending_scan`, `super_admin` |
| Index name | `idx_<table>_<field>` | `@@index([userId], map: "idx_posts_user_id")` |
| Unique constraint | `uq_<table>_<field>` | `@@unique([email], map: "uq_users_email")` |

---

## Community merge notes (bắt buộc khi scaffold)

### Canonical models

- `CommunityPost` -> `@@map("community_posts")`
- `CommunityComment` -> `@@map("community_comments")`
- `PostComment` -> `@@map("post_comments")`
- `GuestbookEntry` -> `@@map("guestbook_entries")`
- `CommunityPostHeart` -> `@@map("community_post_hearts")`
- `CommunityCommentHeart` -> `@@map("community_comment_hearts")`
- `PostCommentHeart` -> `@@map("post_comment_hearts")`
- `CommunityPostTag` -> `@@map("community_post_tags")`

### Required enum mapping

- `community_posts.moderation_status` -> `CommunityModerationState`
- `community_posts.visibility_state` -> `CommunityVisibilityState`
- `community_comments.moderation_status` -> `CommunityModerationState`
- `community_comments.visibility_state` -> `CommunityVisibilityState`
- `post_comments.moderation_status` -> `CommunityModerationState`
- `post_comments.visibility_state` -> `CommunityVisibilityState`
- `guestbook_entries.approval_status` -> `GuestbookStatus`
- `guestbook_entries.visibility_state` -> `CommunityVisibilityState`

### Summary fields that stay on owner tables

- `heartCount`
- `commentCount`
- `repliesCount`
- `reportCount`
- `lastReportReason`
- `lastReportedAt`
- `isHidden`
- `hiddenReasonCode`
- `visibilityState`

Những field này là owner read-model summaries để list/detail queries không phải aggregate mỗi lần từ moderation hoặc heart-edge tables.

### Heart edge rules

- Không dùng một bảng generic `reactions`.
- Dùng 3 edge tables riêng:
  - `CommunityPostHeart`
  - `CommunityCommentHeart`
  - `PostCommentHeart`
- Mỗi table phải có unique composite trên target FK + `userId`.
- Toggle heart là create/delete edge; counter summary được update transactionally hoặc recompute-safe.

### Visibility and moderation rules

- `visibilityState` là public/read summary canon; không để web hay controller tự suy từ `moderationStatus + isHidden`.
- `isHidden` vẫn được giữ như cheap filter/index flag cho read path.
- `autoHiddenAt` và `hiddenReasonCode` là summary fields an toàn; raw moderation details vẫn ở moderation module.

### Guestbook-specific rules

- Guestbook không có heart edges trong current scope.
- `approvedAt` phải được lưu để sort/filter public guestbook wall ổn định.
- report summaries trên guestbook là read-model convenience; canonical report lifecycle vẫn ở moderation module.

### Prisma relation sketch

```prisma
model CommunityPostHeart {
  postId    Int
  userId    Int
  createdAt DateTime @default(now())

  post CommunityPost @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@id([postId, userId])
  @@map("community_post_hearts")
}
```

Áp cùng pattern cho `CommunityCommentHeart` và `PostCommentHeart`.

---

## Engagement merge notes (bắt buộc khi scaffold)

### Practice profile fields

`chant_preferences` phải đủ để app phân biệt:
- người mới bắt đầu thật
- đồng tu đã có công khóa ổn định
- người tu lâu rồi nhưng mới dùng app

Prisma field picks tối thiểu:
- `experienceTier: PracticeExperienceTier`
- `baselineMode: PracticeBaselineMode`
- `skipBeginnerTrack: Boolean`
- `privateStreakEnabled: Boolean`
- `currentStreakDays: Int`
- `longestStreakDays: Int`
- `lastCompletedPracticeDate: DateTime?` hoặc `Date?` theo quyết định merge cuối

### Practice sheet snapshot fields

`practice_sheets` nên snapshot:
- `experienceTierSnapshot`
- `baselineModeSnapshot`
- `privateStreakAfterComplete?`

Lý do:
- historical sheet phải phản ánh đúng context lúc user hành trì hôm đó
- không để change sau này của `chantPreferences` silently rewrite historical understanding

### Foundation guard rule

- engagement được giữ profile/warning state
- nhưng source-of-truth cho `7 biến` lane sơ học và `21 biến` nền tảng cho user đã qua beginner phase phải nằm ở content/wisdom rule docs
- Prisma layer không encode “phán quyết tôn giáo”; nó chỉ giữ self-state đủ để app render đúng warning/preset branch

### Streak rule

- `private streak` là self-owned encouragement summary, không phải public/social metric
- không tạo leaderboard/streak table dùng chung nhiều user
- derive từ `practice_logs` hoặc update summary ở `chant_preferences`, nhưng source-of-truth vẫn là self-owned practice records

---

## BRD Phase 20–24 — Models cần thêm vào schema (planned/deferred)

Các models sau được giới thiệu bởi BRD Phase 20–24 nhưng **chưa có trong module SCHEMA_PLAN.dbml nào**. Trước khi implement, phải thêm vào domain SCHEMA_PLAN.dbml tương ứng và cập nhật bảng Source files ở đầu file này.

| Model | Domain owner | Status | Ghi chú |
|---|---|---|---|
| `karma_events` | `engagement` | **Planned Phase 1** | APPEND-ONLY — không UPDATE/DELETE; xem DECISIONS.md section 10. Fields: `userId`, `eventType`, `sourceModule`, `delta`, `metadata Json`, `occurredAt` |
| `sacred_form_templates` | `engagement` | **Planned Phase 1** | `disposalMethod: FormDisposalMethod`, `storageDuration Int?`, `watermark String?` |
| `sacred_form_records` | `engagement` | **Planned Phase 1** | FK → `sacred_form_templates`; `disposedAt DateTime?`, `disposalMethod`, `disposalConfirmedBy` |
| `article_read_history` | `content` | **Planned Phase 1** | `userId`, `articleId`, `readCount Int @default(1)`, `lastReadAt`; `@@unique([userId, articleId])` |
| `user_depth_badges` | `content` | **Planned Phase 1** | `userId`, `articleId`, `badge: DepthBadge`, `unlockedAt`; `@@unique([userId, articleId])` |
| `casualty_debt_records` | `vows-merit` | **Planned Phase 1** | FK → `life_release_journal`; `totalDebt Int`, `breakdown Json`, `dailyTaskId String?` |
| `offline_sync_batches` | `engagement` | **Planned Phase 1** | Extends offline sync — `events Json`, `clientTimeRange Json`, `estimatedTimeDrift Int`, `validationStatus` |
| `post_burn_sessions` | `engagement` | **Planned Phase 1** | FK → `ngoi_nha_nho_sheets`; `status: PostBurnStatus`, `checklistCompletedAt DateTime?` |
| `karma_pain_reports` | `wisdom-qa` | **Planned Phase 1** | `sessionId`, `sutraKey`, `bodyPart`, `description String?`, `injectedTaskId String?` |
| `altar_damage_records` | `altar-management` | **Deferred Phase 2** | Không có schema Phase 1 — events đi vào `audit_logs`. Tạo table khi altar-management tách module riêng. |

### Enums cần thêm vào Shared enums block

```prisma
enum FormDisposalMethod {
  MUST_BURN
  STRICTLY_NO_BURN
}

enum DepthBadge {
  SEED_PLANTING      // 1 lần đọc
  UNDERSTANDING      // 3 lần
  EGO_DISSOLUTION    // 7 lần
  ENLIGHTENMENT      // 21 lần
  BUDDHA_MIND        // 108 lần
}

enum PostBurnStatus {
  BURN_COMPLETED
  CHECKLIST_PENDING
  SANITIZATION_COMPLETE
}

enum KarmaEventType {
  LITTLE_HOUSE_BURNED
  REPENTANCE_COMPLETED
  LIFE_RELEASED
  SUTRA_RECITED
  DAMAGE_REPORTED
  DEBT_INCURRED
}
```

### life_release_journal — fields cần thêm (extend existing table)

```prisma
// Thêm vào model LifeReleaseJournal hiện có:
exemptionPrayerRecited  Boolean  @default(false)
casualtyDeclared        Boolean  @default(false)
creatureCount           Int?
speciesType             String?  // key in SPECIES_DEBT_MULTIPLIER
```

---

## Notes for AI/codegen

- Không expose `id` (autoincrement) ra API — luôn dùng `publicId`
- Mọi table reference user phải có cascade rule rõ (ON DELETE SET NULL hoặc CASCADE)
- Soft delete (`deletedAt`) cho content entities, hard delete chỉ cho platform tables
- `audit_logs` là append-only — không có update/delete
- `karma_events` là append-only — không có update/delete (xem DECISIONS.md section 10)
- `rate_limit_records` có TTL — cần cleanup job hoặc partitioning
