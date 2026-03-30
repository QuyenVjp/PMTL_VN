-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('UPLOADING', 'READY', 'ORPHANED', 'DELETED');

-- CreateEnum
CREATE TYPE "MediaCollectionType" AS ENUM ('PHOTO_ALBUM', 'VIDEO_PLAYLIST', 'MIXED_GALLERY', 'FEATURED_STORY_GALLERY');

-- CreateEnum
CREATE TYPE "MediaItemType" AS ENUM ('IMAGE', 'VIDEO_EMBED', 'UPLOADED_VIDEO', 'POSTER', 'EXTERNAL_PLAYLIST_LINK');

-- CreateEnum
CREATE TYPE "RuleSeverity" AS ENUM ('ADVISORY', 'CAUTION', 'STRONG_GUARDRAIL', 'QUALITY_GUIDANCE', 'REFERENCE_ONLY');

-- CreateEnum
CREATE TYPE "RuleProductizationMode" AS ENUM ('WARNING_CARD', 'CHECKLIST_ITEM', 'SAFE_LANE_SUGGESTION', 'DRAWER_NOTE', 'REFERENCE_ONLY_NOTE', 'DO_NOT_AUTOMATE');

-- CreateEnum
CREATE TYPE "CommunityPostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "GuestbookEntryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PushJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "VowStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'VOIDED');

-- CreateEnum
CREATE TYPE "VowType" AS ENUM ('LIFE_RELEASE', 'CHANTING', 'SUTRA_READING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GuideCategory" AS ENUM ('BEGINNER', 'DAILY_PRACTICE', 'LITTLE_HOUSE', 'LIFE_RELEASE', 'GENERAL');

-- CreateEnum
CREATE TYPE "DownloadCategory" AS ENUM ('GUIDE', 'TEMPLATE', 'REFERENCE', 'FAQ');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED_HIDE', 'RESOLVED_IGNORE', 'RESOLVED_ESCALATE');

-- CreateEnum
CREATE TYPE "ContactSubmissionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "LittleHouseStatus" AS ENUM ('DRAFT', 'SIGNED', 'CHANTED', 'BURNED');

-- CreateEnum
CREATE TYPE "AltarActionType" AS ENUM ('INCENSE', 'MAINTENANCE', 'MOVE', 'HEART_INCENSE');

-- CreateEnum
CREATE TYPE "SymptomTag" AS ENUM ('PAIN', 'BAD_DREAM', 'FAMILY_CONFLICT', 'OTHER');

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_type" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resource_id" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_records" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "window_start" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "status" "AssetStatus" NOT NULL DEFAULT 'UPLOADING',
    "uploader_id" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_collections" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "collection_type" "MediaCollectionType" NOT NULL,
    "cover_media_id" TEXT,
    "source_note" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_collection_items" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "collection_id" TEXT NOT NULL,
    "item_type" "MediaItemType" NOT NULL,
    "media_asset_id" TEXT,
    "external_url" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "owner_module" TEXT,
    "owner_public_ref" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "author_id" TEXT NOT NULL,
    "featured_image_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chant_environment_rule_groups" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "group_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "last_reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chant_environment_rule_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chant_environment_rules" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "rule_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "canonical_wording" TEXT NOT NULL,
    "severity" "RuleSeverity" NOT NULL,
    "productization_mode" "RuleProductizationMode" NOT NULL,
    "safe_lane_refs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoid_items" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "short_reason" TEXT,
    "source_reference" TEXT,
    "version_note" TEXT,
    "reference_only" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chant_environment_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROCESSED',
    "metadata" JSONB,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "CommunityPostStatus" NOT NULL DEFAULT 'PENDING',
    "heart_count" INTEGER NOT NULL DEFAULT 0,
    "comment_count" INTEGER NOT NULL DEFAULT 0,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guestbook_entries" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "GuestbookEntryStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guestbook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendar_events" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "location" TEXT,
    "event_type" TEXT NOT NULL DEFAULT 'general',
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar_url" TEXT,
    "phone" TEXT,
    "zalo_link" TEXT,
    "bio" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Phật Mẫu Tâm Linh',
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "social_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_jobs" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "PushJobStatus" NOT NULL DEFAULT 'PENDING',
    "target_audience" TEXT,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beginner_guides" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "excerpt" TEXT,
    "category" "GuideCategory" NOT NULL DEFAULT 'BEGINNER',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "author_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beginner_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "DownloadCategory" NOT NULL DEFAULT 'GUIDE',
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "uploader_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vows" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vow_type" "VowType" NOT NULL,
    "description" TEXT NOT NULL,
    "target_count" INTEGER,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "status" "VowStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "life_release_journals" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vow_id" TEXT,
    "journal_date" TIMESTAMP(3) NOT NULL,
    "animal_type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "actor_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "life_release_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_reports" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "reporter_user_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason_code" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "decision_by" TEXT,
    "decision_at" TIMESTAMP(3),
    "decision_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "little_houses" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "sheets_count" INTEGER NOT NULL DEFAULT 1,
    "status" "LittleHouseStatus" NOT NULL DEFAULT 'DRAFT',
    "burn_date" TIMESTAMP(3),
    "post_burn_note" TEXT,
    "special_case" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "little_houses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merit_transfers" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "vow_id" TEXT NOT NULL,
    "transfer_percent" INTEGER NOT NULL,
    "target_label" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merit_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_gongke_logs" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "core_counts_json" JSONB NOT NULL,
    "busy_mode" BOOLEAN NOT NULL DEFAULT false,
    "heart_incense" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_gongke_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repentance_logs" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "private_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repentance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "altar_logs" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "action_type" "AltarActionType" NOT NULL,
    "checklist_state_json" JSONB NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "altar_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "elderly_mode" BOOLEAN NOT NULL DEFAULT false,
    "assist_mode" BOOLEAN NOT NULL DEFAULT false,
    "assist_contact_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practice_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activation_logs" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "symptom_tag" "SymptomTag" NOT NULL,
    "suggested_actions_json" JSONB NOT NULL,
    "private_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs"("resource");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "rate_limit_records_expires_at_idx" ON "rate_limit_records"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "rate_limit_records_key_endpoint_window_start_key" ON "rate_limit_records"("key", "endpoint", "window_start");

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_key" ON "users"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refresh_token_key" ON "sessions"("refresh_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_public_id_key" ON "media_assets"("public_id");

-- CreateIndex
CREATE INDEX "media_assets_uploader_id_idx" ON "media_assets"("uploader_id");

-- CreateIndex
CREATE INDEX "media_assets_status_idx" ON "media_assets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "media_collections_public_id_key" ON "media_collections"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_collections_slug_key" ON "media_collections"("slug");

-- CreateIndex
CREATE INDEX "media_collections_status_idx" ON "media_collections"("status");

-- CreateIndex
CREATE INDEX "media_collections_collection_type_idx" ON "media_collections"("collection_type");

-- CreateIndex
CREATE INDEX "media_collections_featured_idx" ON "media_collections"("featured");

-- CreateIndex
CREATE INDEX "media_collections_created_by_id_idx" ON "media_collections"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_collection_items_public_id_key" ON "media_collection_items"("public_id");

-- CreateIndex
CREATE INDEX "media_collection_items_collection_id_idx" ON "media_collection_items"("collection_id");

-- CreateIndex
CREATE INDEX "media_collection_items_media_asset_id_idx" ON "media_collection_items"("media_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_public_id_key" ON "posts"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");

-- CreateIndex
CREATE INDEX "posts_published_at_idx" ON "posts"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "chant_environment_rule_groups_public_id_key" ON "chant_environment_rule_groups"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "chant_environment_rule_groups_group_key_key" ON "chant_environment_rule_groups"("group_key");

-- CreateIndex
CREATE UNIQUE INDEX "chant_environment_rules_public_id_key" ON "chant_environment_rules"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "chant_environment_rules_rule_key_key" ON "chant_environment_rules"("rule_key");

-- CreateIndex
CREATE INDEX "chant_environment_rules_group_id_idx" ON "chant_environment_rules"("group_id");

-- CreateIndex
CREATE INDEX "webhook_deliveries_expires_at_idx" ON "webhook_deliveries"("expires_at");

-- CreateIndex
CREATE INDEX "webhook_deliveries_provider_event_type_idx" ON "webhook_deliveries"("provider", "event_type");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_deliveries_provider_event_id_key" ON "webhook_deliveries"("provider", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_posts_public_id_key" ON "community_posts"("public_id");

-- CreateIndex
CREATE INDEX "community_posts_author_id_idx" ON "community_posts"("author_id");

-- CreateIndex
CREATE INDEX "community_posts_status_idx" ON "community_posts"("status");

-- CreateIndex
CREATE INDEX "community_posts_created_at_idx" ON "community_posts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "guestbook_entries_public_id_key" ON "guestbook_entries"("public_id");

-- CreateIndex
CREATE INDEX "guestbook_entries_author_id_idx" ON "guestbook_entries"("author_id");

-- CreateIndex
CREATE INDEX "guestbook_entries_status_idx" ON "guestbook_entries"("status");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_events_public_id_key" ON "calendar_events"("public_id");

-- CreateIndex
CREATE INDEX "calendar_events_status_idx" ON "calendar_events"("status");

-- CreateIndex
CREATE INDEX "calendar_events_start_at_idx" ON "calendar_events"("start_at");

-- CreateIndex
CREATE INDEX "calendar_events_created_by_id_idx" ON "calendar_events"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_public_id_key" ON "volunteers"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_submissions_public_id_key" ON "contact_submissions"("public_id");

-- CreateIndex
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions"("status");

-- CreateIndex
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "contact_info_public_id_key" ON "contact_info"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_public_id_key" ON "push_subscriptions"("public_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_is_active_idx" ON "push_subscriptions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "push_jobs_public_id_key" ON "push_jobs"("public_id");

-- CreateIndex
CREATE INDEX "push_jobs_status_idx" ON "push_jobs"("status");

-- CreateIndex
CREATE INDEX "push_jobs_created_by_id_idx" ON "push_jobs"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "beginner_guides_public_id_key" ON "beginner_guides"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "beginner_guides_slug_key" ON "beginner_guides"("slug");

-- CreateIndex
CREATE INDEX "beginner_guides_author_id_idx" ON "beginner_guides"("author_id");

-- CreateIndex
CREATE INDEX "beginner_guides_status_idx" ON "beginner_guides"("status");

-- CreateIndex
CREATE INDEX "beginner_guides_category_idx" ON "beginner_guides"("category");

-- CreateIndex
CREATE UNIQUE INDEX "downloads_public_id_key" ON "downloads"("public_id");

-- CreateIndex
CREATE INDEX "downloads_uploader_id_idx" ON "downloads"("uploader_id");

-- CreateIndex
CREATE INDEX "downloads_status_idx" ON "downloads"("status");

-- CreateIndex
CREATE INDEX "downloads_category_idx" ON "downloads"("category");

-- CreateIndex
CREATE UNIQUE INDEX "vows_public_id_key" ON "vows"("public_id");

-- CreateIndex
CREATE INDEX "vows_user_id_idx" ON "vows"("user_id");

-- CreateIndex
CREATE INDEX "vows_status_idx" ON "vows"("status");

-- CreateIndex
CREATE UNIQUE INDEX "life_release_journals_public_id_key" ON "life_release_journals"("public_id");

-- CreateIndex
CREATE INDEX "life_release_journals_user_id_idx" ON "life_release_journals"("user_id");

-- CreateIndex
CREATE INDEX "life_release_journals_vow_id_idx" ON "life_release_journals"("vow_id");

-- CreateIndex
CREATE INDEX "life_release_journals_journal_date_idx" ON "life_release_journals"("journal_date");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_reports_public_id_key" ON "moderation_reports"("public_id");

-- CreateIndex
CREATE INDEX "moderation_reports_status_idx" ON "moderation_reports"("status");

-- CreateIndex
CREATE INDEX "moderation_reports_target_type_target_id_idx" ON "moderation_reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "moderation_reports_reporter_user_id_idx" ON "moderation_reports"("reporter_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "little_houses_public_id_key" ON "little_houses"("public_id");

-- CreateIndex
CREATE INDEX "little_houses_user_id_idx" ON "little_houses"("user_id");

-- CreateIndex
CREATE INDEX "little_houses_status_idx" ON "little_houses"("status");

-- CreateIndex
CREATE UNIQUE INDEX "merit_transfers_public_id_key" ON "merit_transfers"("public_id");

-- CreateIndex
CREATE INDEX "merit_transfers_vow_id_idx" ON "merit_transfers"("vow_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_gongke_logs_public_id_key" ON "daily_gongke_logs"("public_id");

-- CreateIndex
CREATE INDEX "daily_gongke_logs_user_id_idx" ON "daily_gongke_logs"("user_id");

-- CreateIndex
CREATE INDEX "daily_gongke_logs_date_idx" ON "daily_gongke_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_gongke_logs_user_id_date_key" ON "daily_gongke_logs"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "repentance_logs_public_id_key" ON "repentance_logs"("public_id");

-- CreateIndex
CREATE INDEX "repentance_logs_user_id_idx" ON "repentance_logs"("user_id");

-- CreateIndex
CREATE INDEX "repentance_logs_date_idx" ON "repentance_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "repentance_logs_user_id_date_key" ON "repentance_logs"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "altar_logs_public_id_key" ON "altar_logs"("public_id");

-- CreateIndex
CREATE INDEX "altar_logs_user_id_idx" ON "altar_logs"("user_id");

-- CreateIndex
CREATE INDEX "altar_logs_date_idx" ON "altar_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "practice_profiles_user_id_key" ON "practice_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "activation_logs_public_id_key" ON "activation_logs"("public_id");

-- CreateIndex
CREATE INDEX "activation_logs_user_id_idx" ON "activation_logs"("user_id");

-- CreateIndex
CREATE INDEX "activation_logs_date_idx" ON "activation_logs"("date");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_collections" ADD CONSTRAINT "media_collections_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_collections" ADD CONSTRAINT "media_collections_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_collection_items" ADD CONSTRAINT "media_collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "media_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_collection_items" ADD CONSTRAINT "media_collection_items_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chant_environment_rules" ADD CONSTRAINT "chant_environment_rules_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chant_environment_rule_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guestbook_entries" ADD CONSTRAINT "guestbook_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guestbook_entries" ADD CONSTRAINT "guestbook_entries_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_jobs" ADD CONSTRAINT "push_jobs_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beginner_guides" ADD CONSTRAINT "beginner_guides_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vows" ADD CONSTRAINT "vows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "life_release_journals" ADD CONSTRAINT "life_release_journals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "life_release_journals" ADD CONSTRAINT "life_release_journals_vow_id_fkey" FOREIGN KEY ("vow_id") REFERENCES "vows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "life_release_journals" ADD CONSTRAINT "life_release_journals_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "little_houses" ADD CONSTRAINT "little_houses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merit_transfers" ADD CONSTRAINT "merit_transfers_vow_id_fkey" FOREIGN KEY ("vow_id") REFERENCES "vows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_gongke_logs" ADD CONSTRAINT "daily_gongke_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repentance_logs" ADD CONSTRAINT "repentance_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altar_logs" ADD CONSTRAINT "altar_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_profiles" ADD CONSTRAINT "practice_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activation_logs" ADD CONSTRAINT "activation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

