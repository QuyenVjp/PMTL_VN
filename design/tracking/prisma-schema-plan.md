# Prisma Schema Plan (Kế hoạch hợp nhất schema)

File này chốt kế hoạch merge 11 module `schema.dbml` thành 1 `prisma/schema.prisma` tổng.
Không có file này, developer phải tự đoán thứ tự table, foreign keys, enums.

> **Migration order**: xem `coding-readiness.md` Phần 6 cho 12 bước chi tiết
> **Module schemas**: mỗi module có `schema.dbml` riêng trong `design/XX-module/`

---

## Source files

| Module | Schema file | Tables chính |
|---|---|---|
| Platform | `baseline/platform-modules.md` | `feature_flags`, `audit_logs`, `rate_limit_records` |
| 01-identity | `01-identity/schema.dbml` | `users`, `sessions` |
| 02-content | `02-content/schema.dbml` | `posts`, `media_assets`, `categories`, `tags`, `hub_pages`, `hub_page_blocks`, `beginner_guides`, `downloads`, `media_collections`, `media_collection_items`, `chant_items`, `chant_plans`, `chant_plan_items`, `sutras`, `sutra_volumes`, `sutra_chapters`, `sutra_glossary` |
| 03-community | `03-community/schema.dbml` | `post_comments`, `community_posts`, `community_comments`, `guestbook_entries` |
| 04-engagement | `04-engagement/schema.dbml` | `sutra_bookmarks`, `sutra_reading_progress`, `chant_preferences`, `chant_preference_optional_items`, `chant_preference_targets`, `chant_preference_intentions`, `practice_logs`, `practice_log_item_states`, `practice_sheets`, `practice_sheet_items`, `ngoi_nha_nho_sheets`, `ngoi_nha_nho_sheet_entries`, `ngoi_nha_nho_sheet_audit_snapshots` |
| 05-moderation | `05-moderation/schema.dbml` | `moderation_reports` |
| 06-search | `06-search/schema.dbml` | `search_index_metadata` (optional) |
| 07-calendar | `07-calendar/schema.dbml` | `events`, `event_agenda_items`, `event_speakers`, `event_ctas`, `event_gallery_media`, `event_files`, `lunar_events`, `lunar_event_overrides`, `personal_practice_calendar_read_model` |
| 08-notification | `08-notification/schema.dbml` | `push_subscriptions`, `push_jobs` |
| 09-vows-merit | `09-vows-merit/schema.dbml` | `vows`, `vow_progress_entries`, `life_release_journal` |
| 10-wisdom-qa | `10-wisdom-qa/schema.dbml` | `authority_profiles`, `wisdom_entries`, `qa_entries`, `audio_talk_entries`, `video_talk_entries`, `offline_bundles`, `offline_bundle_entries`, `offline_sync_states` |
| 11-contact | `11-contact/schema.dbml` | `contact_info`, `volunteers` |

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
  ├── community_posts
  ├── community_comments
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
  ├── post_tags → tags
  ├── post_related_posts
  ├── post_gallery_media → media_assets
  └── (search index source)

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

Ref: `coding-readiness.md` Phần 6 cho chi tiết. Summary:

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

> Các table `users` và `media_assets` xuất hiện trong nhiều file `schema.dbml` (01-identity, 02-content, 04-engagement, 07-calendar...).
> Đây là **reference stubs** chỉ chứa `id` + `public_id` để DBML visualizer render được FK arrows.
> Khi merge sang Prisma, chỉ lấy **1 bản canonical** từ module owner:
> - `users` → `01-identity/schema.dbml`
> - `media_assets` → `02-content/schema.dbml`
> - `sutras`, `sutra_chapters`, `chant_items`, `chant_plans` → `02-content/schema.dbml`
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

## Notes for AI/codegen

- Không expose `id` (autoincrement) ra API — luôn dùng `publicId`
- Mọi table reference user phải có cascade rule rõ (ON DELETE SET NULL hoặc CASCADE)
- Soft delete (`deletedAt`) cho content entities, hard delete chỉ cho platform tables
- `audit_logs` là append-only — không có update/delete
- `rate_limit_records` có TTL — cần cleanup job hoặc partitioning
