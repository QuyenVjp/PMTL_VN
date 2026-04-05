-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('ARTICLE', 'TRANSCRIPT', 'SOURCE_NOTE', 'EVENT_RECAP');

-- CreateEnum
CREATE TYPE "MediaCollectionType" AS ENUM ('PHOTO_ALBUM', 'VIDEO_PLAYLIST', 'MIXED_GALLERY', 'FEATURED_STORY_GALLERY');

-- CreateEnum
CREATE TYPE "MediaItemType" AS ENUM ('IMAGE', 'VIDEO_EMBED', 'UPLOADED_VIDEO', 'POSTER', 'EXTERNAL_PLAYLIST_LINK');

-- CreateEnum
CREATE TYPE "ContactSubmissionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "LittleHouseStatus" AS ENUM ('DRAFT', 'SIGNED', 'CHANTED', 'BURNED');

-- CreateEnum
CREATE TYPE "LittleHousePurpose" AS ENUM ('GENERAL_SUPPORT', 'RESOLVE_CONFLICT', 'DECEASED', 'FETAL_SPIRIT', 'SELF_ACCUMULATE', 'HEALTH_ISSUE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AltarActionType" AS ENUM ('INCENSE', 'MAINTENANCE', 'MOVE', 'HEART_INCENSE', 'RELOCATION');

-- CreateEnum
CREATE TYPE "AltarRelocationStep" AS ENUM ('PREPARING', 'INCENSE_BURNED_OLD_HOME', 'WRAPPED_IN_RED_CLOTH', 'ALTAR_INSTALLED_NEW_HOME', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SymptomTag" AS ENUM ('PAIN', 'BAD_DREAM', 'FAMILY_CONFLICT', 'OTHER');

-- CreateEnum
CREATE TYPE "SutraType" AS ENUM ('LONG', 'SHORT');

-- CreateEnum
CREATE TYPE "MentalHealthCondition" AS ENUM ('NONE', 'DEPRESSION', 'SCHIZOPHRENIA', 'ANXIETY', 'BIPOLAR', 'OTHER_MENTAL_ILLNESS');

-- CreateEnum
CREATE TYPE "DreamAbortionChildState" AS ENUM ('WELL_DRESSED_HAPPY', 'LEAVING_PEACEFULLY', 'CRYING_DISTRESSED', 'POORLY_DRESSED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SelfCultivationSutraType" AS ENUM ('LE_PHAT_DAI_SAM_HOI_VAN', 'CHU_DAI_BI', 'TAM_KINH', 'VANG_SINH_CHU');

-- CreateEnum
CREATE TYPE "SelfCultivationSheetStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'BURNED');

-- CreateEnum
CREATE TYPE "SpiritualAppBurnRule" AS ENUM ('MUST_BURN', 'NEVER_BURN', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "RitualSessionStatus" AS ENUM ('ACTIVE', 'ALERT_FIRED', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "PersonLifeStatus" AS ENUM ('LIVING', 'DECEASED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING_BURN', 'BURNED', 'ACTIVATED');

-- CreateEnum
CREATE TYPE "BurnSessionStatus" AS ENUM ('PENDING', 'PRE_CHECKED', 'BURNING', 'POST_CHECK_PENDING', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "BodhisattvaType" AS ENUM ('THICH_CA_MAU_NI', 'QUAN_THE_AM', 'NAM_KINH', 'THAI_TUOI', 'QUAN_DE', 'CHAU_XUONG', 'QUAN_BINH');

-- CreateEnum
CREATE TYPE "WaterConsumptionMethod" AS ENUM ('DRINK_DIRECTLY', 'MUST_DISCARD', 'MUST_RECITE_ONE_DBZ');

-- CreateEnum
CREATE TYPE "charity_type" AS ENUM ('BUDDHIST_TEMPLE', 'BUDDHIST_ORGANIZATION', 'ANIMAL_WELFARE', 'ENVIRONMENTAL', 'DISASTER_RELIEF', 'OTHER_NGOS');

-- CreateEnum
CREATE TYPE "whitelisting_criteria_type" AS ENUM ('LEGAL_REGISTRATION', 'FINANCIAL_TRANSPARENCY', 'MONK_VERIFICATION', 'COMMUNITY_ENDORSEMENT', 'TRACK_RECORD', 'AUDIT_REPORT', 'NO_FRAUD_HISTORY');

-- CreateEnum
CREATE TYPE "whitelist_status" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED', 'REVOKED');

-- CreateEnum
CREATE TYPE "fraud_alert_severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "fraud_alert_type" AS ENUM ('FAKE_ORGANIZATION', 'ACCOUNT_ANOMALY', 'PATTERN_MISMATCH', 'COMPROMISED_ACCOUNT', 'PHISHING_ATTEMPT', 'DONATION_ABUSE', 'OTHER_FRAUD');

-- CreateEnum
CREATE TYPE "charity_interaction_type" AS ENUM ('DONATION', 'LIFE_RELEASE', 'VOLUNTEERING', 'OTHER_INTERACTION');

-- CreateEnum
CREATE TYPE "purity_level" AS ENUM ('FULL', 'EMOTIONAL', 'PHYSICAL');

-- CreateEnum
CREATE TYPE "thought_type" AS ENUM ('SEXUAL', 'ATTACHMENT', 'JEALOUSY', 'PHYSICAL_URGE');

-- CreateEnum
CREATE TYPE "BuddhistEventType" AS ENUM ('DHARMA_TALK', 'RECITATION_SESSION', 'LIFE_LIBERATION', 'MEDITATION_RETREAT', 'COMMUNITY_SERVICE', 'SUTRA_STUDY');

-- CreateEnum
CREATE TYPE "BuddhistEventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventDeliveryMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "LifeReleaseRecordType" AS ENUM ('INDIVIDUAL', 'GROUP', 'PROXY');

-- CreateEnum
CREATE TYPE "LifeReleaseRecordStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PredatorySpecies" AS ENUM ('TURTLE', 'FISH', 'BIRD', 'INSECT', 'FROG', 'CRAB', 'OTHER');

-- CreateEnum
CREATE TYPE "LhStatus" AS ENUM ('DRAFT', 'SIGNED', 'CHANTED', 'BURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LhRecitationType" AS ENUM ('DA_BEI_ZHOU', 'HEART_SUTRA', 'REPENTANCE', 'NAMO_AMITABHA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "LhDottingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "SacredFormType" AS ENUM ('REFUGE_FORM', 'VOW_FORM', 'MERIT_TRANSFER_FORM', 'RECITATION_CERTIFICATE', 'DHARMA_STUDY_FORM');

-- CreateEnum
CREATE TYPE "SacredFormPrerequisiteStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'WAIVED');

-- CreateEnum
CREATE TYPE "SacredFormApplicantStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'PROBATION', 'APPROVED', 'REJECTED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AltarItemType" AS ENUM ('INCENSE_BURNER', 'CANDLE_HOLDER', 'FLOWER_VASE', 'WATER_CUP', 'FRUIT_PLATE', 'STATUE', 'LAMP', 'BELL', 'OTHER');

-- CreateEnum
CREATE TYPE "AltarConditionStatus" AS ENUM ('GOOD', 'NEEDS_ATTENTION', 'REQUIRES_REPLACEMENT', 'RETIRED');

-- CreateEnum
CREATE TYPE "AltarProtocolType" AS ENUM ('DAILY_CLEANING', 'INCENSE_INSERTION', 'WATER_REFRESH', 'FLOWER_REPLACEMENT', 'LAMP_CHECK', 'MONTHLY_DEEP_CLEAN');

-- AlterEnum
ALTER TYPE "DownloadCategory" ADD VALUE 'SPIRITUAL_APPLICATION';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GuideCategory" ADD VALUE 'ALTAR_SETUP';
ALTER TYPE "GuideCategory" ADD VALUE 'ALTAR_OFFERINGS';
ALTER TYPE "GuideCategory" ADD VALUE 'ALTAR_MAINTENANCE';
ALTER TYPE "GuideCategory" ADD VALUE 'HEART_INCENSE';

-- DropForeignKey
ALTER TABLE "community_comments" DROP CONSTRAINT "community_comments_author_id_fkey";

-- DropForeignKey
ALTER TABLE "community_hearts" DROP CONSTRAINT "community_hearts_user_id_fkey";

-- AlterTable
ALTER TABLE "beginner_guides" ADD COLUMN     "first_published_at" TIMESTAMP(3),
ALTER COLUMN "version_note" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "chanting_sessions" ALTER COLUMN "start_time" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN     "is_pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "downloads" ADD COLUMN     "first_published_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "allow_comments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "first_published_at" TIMESTAMP(3),
ADD COLUMN     "post_type" "PostType" NOT NULL DEFAULT 'ARTICLE',
ADD COLUMN     "primary_category_id" TEXT,
ADD COLUMN     "source_ref" TEXT;

-- AlterTable
ALTER TABLE "wisdom_entries" ADD COLUMN     "first_published_at" TIMESTAMP(3);

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
    "first_published_at" TIMESTAMP(3),
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
CREATE TABLE "post_categories" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tag_map" (
    "post_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "post_tag_map_pkey" PRIMARY KEY ("post_id","tag_id")
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
CREATE TABLE "little_houses" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "recipient_name" TEXT,
    "offer_to" TEXT,
    "purpose" "LittleHousePurpose" DEFAULT 'GENERAL_SUPPORT',
    "sheets_count" INTEGER NOT NULL DEFAULT 1,
    "status" "LittleHouseStatus" NOT NULL DEFAULT 'DRAFT',
    "started_at" TIMESTAMP(3),
    "burn_date" TIMESTAMP(3),
    "post_burn_note" TEXT,
    "special_case" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_at" TIMESTAMP(3),
    "offered_by_name" TEXT,
    "chanting_started_at" TIMESTAMP(3),
    "offered_by_locked_at" TIMESTAMP(3),
    "deceased_relative_id" TEXT,
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
    "relocation_step" "AltarRelocationStep",
    "incense_burned_confirmed" BOOLEAN,
    "red_cloth_confirmed" BOOLEAN,
    "altar_first_confirmed" BOOLEAN,
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
    "mental_health_condition" "MentalHealthCondition" NOT NULL DEFAULT 'NONE',
    "da_bei_zhou_daily_limit" INTEGER,
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

-- CreateTable
CREATE TABLE "self_cultivation_sheets" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sutra_type" "SelfCultivationSutraType" NOT NULL,
    "template_public_id" TEXT,
    "total_slots" INTEGER NOT NULL,
    "completed_slots" INTEGER NOT NULL DEFAULT 0,
    "status" "SelfCultivationSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "burn_date" TIMESTAMP(3),
    "burn_confirmed_nnn" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "self_cultivation_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "self_cultivation_templates" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "sutra_type" "SelfCultivationSutraType" NOT NULL,
    "slots_count" INTEGER NOT NULL,
    "paper_size" TEXT NOT NULL,
    "pdf_media_id" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "self_cultivation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "convincing_family_ritual_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_minutes" INTEGER NOT NULL,
    "alert_at" TIMESTAMP(3) NOT NULL,
    "alert_fired_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "RitualSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convincing_family_ritual_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "name_change_applications" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "target_person_type" "PersonLifeStatus" NOT NULL,
    "target_old_name" TEXT NOT NULL,
    "target_new_name" TEXT NOT NULL,
    "years_used_new_name" INTEGER NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING_BURN',
    "burned_at" TIMESTAMP(3),
    "activation_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "name_change_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sutra_reading_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sutra_id" TEXT NOT NULL,
    "hygiene_confirmed_at" TIMESTAMP(3) NOT NULL,
    "session_started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "session_ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sutra_reading_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sutra_bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "sutra_id" TEXT NOT NULL,
    "page_index" INTEGER NOT NULL,
    "line_index" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sutra_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "little_house_burn_sessions" (
    "id" TEXT NOT NULL,
    "little_house_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "BurnSessionStatus" NOT NULL DEFAULT 'PENDING',
    "pre_burn_checked_at" TIMESTAMP(3),
    "burn_started_at" TIMESTAMP(3),
    "post_burn_checked_at" TIMESTAMP(3),
    "burn_completed_at" TIMESTAMP(3),
    "had_scraps" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "little_house_burn_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_profiles" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "child_name" TEXT NOT NULL,
    "has_gaming_addiction" BOOLEAN NOT NULL DEFAULT false,
    "virtual_violence_karma" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "altar_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "has_altar" BOOLEAN NOT NULL DEFAULT true,
    "not_facing_kitchen" BOOLEAN NOT NULL DEFAULT false,
    "no_mirrors_around" BOOLEAN NOT NULL DEFAULT false,
    "not_on_overhanging_balcony" BOOLEAN NOT NULL DEFAULT false,
    "spatial_confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "altar_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "water_offering_logs" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bodhisattva_type" "BodhisattvaType" NOT NULL,
    "consumption_method" "WaterConsumptionMethod" NOT NULL,
    "da_bei_zhou_recited" BOOLEAN NOT NULL DEFAULT false,
    "date" DATE NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "water_offering_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deceased_relatives" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "date_of_death" DATE NOT NULL,
    "bardo_end_date" DATE NOT NULL,
    "target_lh" INTEGER NOT NULL DEFAULT 49,
    "completed_lh" INTEGER NOT NULL DEFAULT 0,
    "bardo_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deceased_relatives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sutra_metadata" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "sutra_key" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_en" TEXT,
    "sutraType" "SutraType" NOT NULL,
    "pause_mantra" TEXT,
    "pause_instruction" TEXT,
    "restart_warning" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sutra_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dream_journals" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dream_date" DATE NOT NULL,
    "abortion_child_related" BOOLEAN NOT NULL DEFAULT false,
    "child_state" "DreamAbortionChildState",
    "description" TEXT,
    "little_house_public_id" TEXT,
    "resolution_status" TEXT DEFAULT 'UNRESOLVED',
    "auto_action_triggered" BOOLEAN NOT NULL DEFAULT false,
    "auto_action_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dream_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "little_house_warnings" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "little_house_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "warning_type" TEXT NOT NULL,
    "days_elapsed" INTEGER NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "little_house_warnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charity_whitelist" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "charity_type" "charity_type" NOT NULL,
    "registration_number" TEXT,
    "country" TEXT NOT NULL DEFAULT 'VN',
    "bank_accounts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "website" TEXT,
    "contact_email" TEXT,
    "verification_score" INTEGER NOT NULL DEFAULT 0,
    "status" "whitelist_status" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,
    "suspended_at" TIMESTAMP(3),
    "suspended_reason" TEXT,
    "revoked_at" TIMESTAMP(3),
    "revoked_reason" TEXT,
    "last_audit_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charity_whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charity_whitelisting_rules" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "criteria_type" "whitelisting_criteria_type" NOT NULL,
    "satisfied" BOOLEAN NOT NULL DEFAULT false,
    "evidence_url" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "charity_whitelisting_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_detection_alerts" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "charity_id" TEXT,
    "reported_by_id" TEXT,
    "alert_type" "fraud_alert_type" NOT NULL,
    "severity" "fraud_alert_severity" NOT NULL,
    "detected_content" TEXT,
    "matched_account" TEXT,
    "is_whitelisted" BOOLEAN NOT NULL DEFAULT false,
    "is_appealable" BOOLEAN NOT NULL DEFAULT true,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "resolution_note" TEXT,
    "auto_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_detection_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_charity_interactions" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "charity_id" TEXT NOT NULL,
    "interaction_type" "charity_interaction_type" NOT NULL,
    "reference_id" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'VND',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_charity_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marital_purity_vows" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "practitioner_id" TEXT NOT NULL,
    "spouse_id" TEXT,
    "vow_date" TIMESTAMP(3) NOT NULL,
    "purity_level" "purity_level" NOT NULL,
    "kiss_allowed" BOOLEAN NOT NULL DEFAULT false,
    "hug_allowed" BOOLEAN NOT NULL DEFAULT true,
    "sleep_arrangement" TEXT NOT NULL DEFAULT 'SEPARATE_BEDS',
    "daily_recitations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marital_purity_vows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thought_state_logs" (
    "id" TEXT NOT NULL,
    "vow_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thought_type" "thought_type" NOT NULL,
    "intensity" INTEGER NOT NULL,
    "duration_minutes" INTEGER,
    "trigger" TEXT,
    "response_action" TEXT,
    "recitations_used" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "reflection" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thought_state_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marital_guidance_requests" (
    "id" TEXT NOT NULL,
    "vow_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "context" TEXT,
    "urgency" TEXT NOT NULL DEFAULT 'ROUTINE',
    "response" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marital_guidance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vow_audit_events" (
    "id" TEXT NOT NULL,
    "vow_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "details" TEXT,
    "previous_state" JSONB,
    "new_state" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vow_audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buddhist_events" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "organizer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_vi" TEXT NOT NULL,
    "description" TEXT,
    "event_type" "BuddhistEventType" NOT NULL,
    "delivery_mode" "EventDeliveryMode" NOT NULL,
    "status" "BuddhistEventStatus" NOT NULL DEFAULT 'DRAFT',
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "location_name" TEXT,
    "location_address" TEXT,
    "online_url" TEXT,
    "max_attendees" INTEGER,
    "is_free" BOOLEAN NOT NULL DEFAULT true,
    "cover_image_url" TEXT,
    "recitation_target" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buddhist_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "checked_in_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_audit_logs" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "life_release_records" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "record_type" "LifeReleaseRecordType" NOT NULL,
    "status" "LifeReleaseRecordStatus" NOT NULL DEFAULT 'PENDING',
    "release_date" TIMESTAMP(3) NOT NULL,
    "location_name" TEXT,
    "location_coords" TEXT,
    "merit" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "life_release_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "release_animal_entries" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "species" "PredatorySpecies" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "source_location" TEXT,
    "is_predatory" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "release_animal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proxy_life_releases" (
    "id" TEXT NOT NULL,
    "record_id" TEXT NOT NULL,
    "sponsor_id" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "merit" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proxy_life_releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lh_records" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "beneficiary_name" TEXT NOT NULL,
    "status" "LhStatus" NOT NULL DEFAULT 'DRAFT',
    "vow_text" TEXT,
    "drafted_at" TIMESTAMP(3),
    "signed_at" TIMESTAMP(3),
    "chanted_at" TIMESTAMP(3),
    "burned_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lh_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lh_recitations" (
    "id" TEXT NOT NULL,
    "lh_record_id" TEXT NOT NULL,
    "recitation_type" "LhRecitationType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "session_date" TIMESTAMP(3) NOT NULL,
    "chanter_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lh_recitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lh_completion_records" (
    "id" TEXT NOT NULL,
    "lh_record_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "witness" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lh_completion_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lh_dotting_sessions" (
    "id" TEXT NOT NULL,
    "lh_record_id" TEXT NOT NULL,
    "status" "LhDottingStatus" NOT NULL DEFAULT 'PENDING',
    "dotted_at" TIMESTAMP(3),
    "operator_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lh_dotting_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lh_combustion_logs" (
    "id" TEXT NOT NULL,
    "lh_record_id" TEXT NOT NULL,
    "burned_at" TIMESTAMP(3) NOT NULL,
    "altitude" TEXT,
    "container_type" TEXT,
    "operator_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lh_combustion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lh_fraud_logs" (
    "id" TEXT NOT NULL,
    "lh_record_id" TEXT NOT NULL,
    "flagged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lh_fraud_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sacred_form_templates" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "form_type" "SacredFormType" NOT NULL,
    "title_vi" TEXT NOT NULL,
    "title_zh" TEXT,
    "description" TEXT,
    "prerequisites_def" JSONB,
    "form_schema" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sacred_form_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_applicants" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "SacredFormApplicantStatus" NOT NULL DEFAULT 'PENDING',
    "form_data" JSONB,
    "probation_ends_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_applicants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_prerequisite_entries" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SacredFormPrerequisiteStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_at" TIMESTAMP(3),
    "evidence" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_prerequisite_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sacred_form_audit_logs" (
    "id" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sacred_form_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disposal_polarity_records" (
    "id" TEXT NOT NULL,
    "form_type" TEXT NOT NULL,
    "polarity" TEXT NOT NULL,
    "rationale" TEXT,
    "effective_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disposal_polarity_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "altar_items" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_type" "AltarItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "condition" "AltarConditionStatus" NOT NULL DEFAULT 'GOOD',
    "acquisition_at" TIMESTAMP(3),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "altar_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "altar_validation_logs" (
    "id" TEXT NOT NULL,
    "altar_item_id" TEXT,
    "user_id" TEXT NOT NULL,
    "protocol_type" "AltarProtocolType" NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "notes" TEXT,
    "performed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "altar_validation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "altar_protocol_templates" (
    "id" TEXT NOT NULL,
    "protocol_type" "AltarProtocolType" NOT NULL,
    "title_vi" TEXT NOT NULL,
    "steps" JSONB NOT NULL,
    "frequency" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "altar_protocol_templates_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "post_categories_public_id_key" ON "post_categories"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_categories_slug_key" ON "post_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_public_id_key" ON "post_tags"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_tags_slug_key" ON "post_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "contact_submissions_public_id_key" ON "contact_submissions"("public_id");

-- CreateIndex
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions"("status");

-- CreateIndex
CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "little_houses_public_id_key" ON "little_houses"("public_id");

-- CreateIndex
CREATE INDEX "little_houses_user_id_idx" ON "little_houses"("user_id");

-- CreateIndex
CREATE INDEX "little_houses_status_idx" ON "little_houses"("status");

-- CreateIndex
CREATE INDEX "little_houses_started_at_idx" ON "little_houses"("started_at");

-- CreateIndex
CREATE INDEX "little_houses_purpose_idx" ON "little_houses"("purpose");

-- CreateIndex
CREATE INDEX "little_houses_deceased_relative_id_idx" ON "little_houses"("deceased_relative_id");

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
CREATE INDEX "altar_logs_action_type_idx" ON "altar_logs"("action_type");

-- CreateIndex
CREATE UNIQUE INDEX "practice_profiles_user_id_key" ON "practice_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "activation_logs_public_id_key" ON "activation_logs"("public_id");

-- CreateIndex
CREATE INDEX "activation_logs_user_id_idx" ON "activation_logs"("user_id");

-- CreateIndex
CREATE INDEX "activation_logs_date_idx" ON "activation_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "self_cultivation_sheets_public_id_key" ON "self_cultivation_sheets"("public_id");

-- CreateIndex
CREATE INDEX "self_cultivation_sheets_user_id_idx" ON "self_cultivation_sheets"("user_id");

-- CreateIndex
CREATE INDEX "self_cultivation_sheets_status_idx" ON "self_cultivation_sheets"("status");

-- CreateIndex
CREATE INDEX "self_cultivation_sheets_sutra_type_idx" ON "self_cultivation_sheets"("sutra_type");

-- CreateIndex
CREATE UNIQUE INDEX "self_cultivation_templates_public_id_key" ON "self_cultivation_templates"("public_id");

-- CreateIndex
CREATE INDEX "self_cultivation_templates_sutra_type_idx" ON "self_cultivation_templates"("sutra_type");

-- CreateIndex
CREATE INDEX "self_cultivation_templates_status_idx" ON "self_cultivation_templates"("status");

-- CreateIndex
CREATE INDEX "convincing_family_ritual_sessions_user_id_idx" ON "convincing_family_ritual_sessions"("user_id");

-- CreateIndex
CREATE INDEX "convincing_family_ritual_sessions_alert_at_idx" ON "convincing_family_ritual_sessions"("alert_at");

-- CreateIndex
CREATE INDEX "convincing_family_ritual_sessions_status_idx" ON "convincing_family_ritual_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "name_change_applications_public_id_key" ON "name_change_applications"("public_id");

-- CreateIndex
CREATE INDEX "name_change_applications_user_id_idx" ON "name_change_applications"("user_id");

-- CreateIndex
CREATE INDEX "name_change_applications_status_idx" ON "name_change_applications"("status");

-- CreateIndex
CREATE INDEX "sutra_reading_sessions_user_id_sutra_id_idx" ON "sutra_reading_sessions"("user_id", "sutra_id");

-- CreateIndex
CREATE INDEX "sutra_bookmarks_user_id_idx" ON "sutra_bookmarks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sutra_bookmarks_user_id_sutra_id_key" ON "sutra_bookmarks"("user_id", "sutra_id");

-- CreateIndex
CREATE INDEX "little_house_burn_sessions_little_house_id_idx" ON "little_house_burn_sessions"("little_house_id");

-- CreateIndex
CREATE INDEX "little_house_burn_sessions_user_id_idx" ON "little_house_burn_sessions"("user_id");

-- CreateIndex
CREATE INDEX "little_house_burn_sessions_status_idx" ON "little_house_burn_sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "child_profiles_public_id_key" ON "child_profiles"("public_id");

-- CreateIndex
CREATE INDEX "child_profiles_user_id_idx" ON "child_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "altar_profiles_user_id_key" ON "altar_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "water_offering_logs_public_id_key" ON "water_offering_logs"("public_id");

-- CreateIndex
CREATE INDEX "water_offering_logs_user_id_idx" ON "water_offering_logs"("user_id");

-- CreateIndex
CREATE INDEX "water_offering_logs_date_idx" ON "water_offering_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "deceased_relatives_public_id_key" ON "deceased_relatives"("public_id");

-- CreateIndex
CREATE INDEX "deceased_relatives_user_id_idx" ON "deceased_relatives"("user_id");

-- CreateIndex
CREATE INDEX "deceased_relatives_bardo_end_date_idx" ON "deceased_relatives"("bardo_end_date");

-- CreateIndex
CREATE UNIQUE INDEX "sutra_metadata_public_id_key" ON "sutra_metadata"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "sutra_metadata_sutra_key_key" ON "sutra_metadata"("sutra_key");

-- CreateIndex
CREATE INDEX "sutra_metadata_sutraType_idx" ON "sutra_metadata"("sutraType");

-- CreateIndex
CREATE UNIQUE INDEX "dream_journals_public_id_key" ON "dream_journals"("public_id");

-- CreateIndex
CREATE INDEX "dream_journals_user_id_idx" ON "dream_journals"("user_id");

-- CreateIndex
CREATE INDEX "dream_journals_dream_date_idx" ON "dream_journals"("dream_date");

-- CreateIndex
CREATE INDEX "dream_journals_abortion_child_related_idx" ON "dream_journals"("abortion_child_related");

-- CreateIndex
CREATE INDEX "dream_journals_resolution_status_idx" ON "dream_journals"("resolution_status");

-- CreateIndex
CREATE UNIQUE INDEX "little_house_warnings_public_id_key" ON "little_house_warnings"("public_id");

-- CreateIndex
CREATE INDEX "little_house_warnings_little_house_id_idx" ON "little_house_warnings"("little_house_id");

-- CreateIndex
CREATE INDEX "little_house_warnings_user_id_idx" ON "little_house_warnings"("user_id");

-- CreateIndex
CREATE INDEX "little_house_warnings_sent_at_idx" ON "little_house_warnings"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "charity_whitelist_public_id_key" ON "charity_whitelist"("public_id");

-- CreateIndex
CREATE INDEX "charity_whitelist_status_idx" ON "charity_whitelist"("status");

-- CreateIndex
CREATE INDEX "charity_whitelist_charity_type_idx" ON "charity_whitelist"("charity_type");

-- CreateIndex
CREATE UNIQUE INDEX "charity_whitelisting_rules_public_id_key" ON "charity_whitelisting_rules"("public_id");

-- CreateIndex
CREATE INDEX "charity_whitelisting_rules_charity_id_idx" ON "charity_whitelisting_rules"("charity_id");

-- CreateIndex
CREATE UNIQUE INDEX "fraud_detection_alerts_public_id_key" ON "fraud_detection_alerts"("public_id");

-- CreateIndex
CREATE INDEX "fraud_detection_alerts_charity_id_idx" ON "fraud_detection_alerts"("charity_id");

-- CreateIndex
CREATE INDEX "fraud_detection_alerts_severity_idx" ON "fraud_detection_alerts"("severity");

-- CreateIndex
CREATE INDEX "fraud_detection_alerts_alert_type_idx" ON "fraud_detection_alerts"("alert_type");

-- CreateIndex
CREATE UNIQUE INDEX "user_charity_interactions_public_id_key" ON "user_charity_interactions"("public_id");

-- CreateIndex
CREATE INDEX "user_charity_interactions_user_id_idx" ON "user_charity_interactions"("user_id");

-- CreateIndex
CREATE INDEX "user_charity_interactions_charity_id_idx" ON "user_charity_interactions"("charity_id");

-- CreateIndex
CREATE UNIQUE INDEX "marital_purity_vows_public_id_key" ON "marital_purity_vows"("public_id");

-- CreateIndex
CREATE INDEX "marital_purity_vows_practitioner_id_idx" ON "marital_purity_vows"("practitioner_id");

-- CreateIndex
CREATE INDEX "marital_purity_vows_status_idx" ON "marital_purity_vows"("status");

-- CreateIndex
CREATE INDEX "thought_state_logs_vow_id_timestamp_idx" ON "thought_state_logs"("vow_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "marital_guidance_requests_urgency_status_idx" ON "marital_guidance_requests"("urgency", "status");

-- CreateIndex
CREATE INDEX "vow_audit_events_vow_id_created_at_idx" ON "vow_audit_events"("vow_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "buddhist_events_public_id_key" ON "buddhist_events"("public_id");

-- CreateIndex
CREATE INDEX "buddhist_events_status_start_at_idx" ON "buddhist_events"("status", "start_at");

-- CreateIndex
CREATE INDEX "buddhist_events_organizer_id_idx" ON "buddhist_events"("organizer_id");

-- CreateIndex
CREATE INDEX "event_registrations_event_id_idx" ON "event_registrations"("event_id");

-- CreateIndex
CREATE INDEX "event_registrations_user_id_idx" ON "event_registrations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "event_audit_logs_event_id_created_at_idx" ON "event_audit_logs"("event_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "life_release_records_public_id_key" ON "life_release_records"("public_id");

-- CreateIndex
CREATE INDEX "life_release_records_user_id_status_idx" ON "life_release_records"("user_id", "status");

-- CreateIndex
CREATE INDEX "life_release_records_release_date_idx" ON "life_release_records"("release_date");

-- CreateIndex
CREATE INDEX "release_animal_entries_record_id_idx" ON "release_animal_entries"("record_id");

-- CreateIndex
CREATE INDEX "proxy_life_releases_record_id_idx" ON "proxy_life_releases"("record_id");

-- CreateIndex
CREATE INDEX "proxy_life_releases_sponsor_id_idx" ON "proxy_life_releases"("sponsor_id");

-- CreateIndex
CREATE UNIQUE INDEX "lh_records_public_id_key" ON "lh_records"("public_id");

-- CreateIndex
CREATE INDEX "lh_records_user_id_status_idx" ON "lh_records"("user_id", "status");

-- CreateIndex
CREATE INDEX "lh_recitations_lh_record_id_session_date_idx" ON "lh_recitations"("lh_record_id", "session_date" DESC);

-- CreateIndex
CREATE INDEX "lh_completion_records_lh_record_id_idx" ON "lh_completion_records"("lh_record_id");

-- CreateIndex
CREATE INDEX "lh_dotting_sessions_lh_record_id_idx" ON "lh_dotting_sessions"("lh_record_id");

-- CreateIndex
CREATE INDEX "lh_combustion_logs_lh_record_id_idx" ON "lh_combustion_logs"("lh_record_id");

-- CreateIndex
CREATE INDEX "lh_fraud_logs_lh_record_id_idx" ON "lh_fraud_logs"("lh_record_id");

-- CreateIndex
CREATE INDEX "lh_fraud_logs_severity_resolved_at_idx" ON "lh_fraud_logs"("severity", "resolved_at");

-- CreateIndex
CREATE UNIQUE INDEX "sacred_form_templates_public_id_key" ON "sacred_form_templates"("public_id");

-- CreateIndex
CREATE INDEX "sacred_form_templates_form_type_is_active_idx" ON "sacred_form_templates"("form_type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "form_applicants_public_id_key" ON "form_applicants"("public_id");

-- CreateIndex
CREATE INDEX "form_applicants_user_id_status_idx" ON "form_applicants"("user_id", "status");

-- CreateIndex
CREATE INDEX "form_applicants_template_id_idx" ON "form_applicants"("template_id");

-- CreateIndex
CREATE INDEX "form_prerequisite_entries_applicant_id_idx" ON "form_prerequisite_entries"("applicant_id");

-- CreateIndex
CREATE INDEX "sacred_form_audit_logs_applicant_id_created_at_idx" ON "sacred_form_audit_logs"("applicant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "disposal_polarity_records_form_type_idx" ON "disposal_polarity_records"("form_type");

-- CreateIndex
CREATE UNIQUE INDEX "altar_items_public_id_key" ON "altar_items"("public_id");

-- CreateIndex
CREATE INDEX "altar_items_user_id_is_active_idx" ON "altar_items"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "altar_items_item_type_idx" ON "altar_items"("item_type");

-- CreateIndex
CREATE INDEX "altar_validation_logs_user_id_performed_at_idx" ON "altar_validation_logs"("user_id", "performed_at" DESC);

-- CreateIndex
CREATE INDEX "altar_validation_logs_altar_item_id_idx" ON "altar_validation_logs"("altar_item_id");

-- CreateIndex
CREATE INDEX "altar_protocol_templates_protocol_type_is_active_idx" ON "altar_protocol_templates"("protocol_type", "is_active");

-- CreateIndex
CREATE INDEX "posts_post_type_idx" ON "posts"("post_type");

-- CreateIndex
CREATE INDEX "posts_featured_idx" ON "posts"("featured");

-- AddForeignKey
ALTER TABLE "media_collections" ADD CONSTRAINT "media_collections_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_collections" ADD CONSTRAINT "media_collections_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_collection_items" ADD CONSTRAINT "media_collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "media_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_collection_items" ADD CONSTRAINT "media_collection_items_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tag_map" ADD CONSTRAINT "post_tag_map_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tag_map" ADD CONSTRAINT "post_tag_map_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "post_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_primary_category_id_fkey" FOREIGN KEY ("primary_category_id") REFERENCES "post_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_fkey" FOREIGN KEY ("featured_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_hearts" ADD CONSTRAINT "community_hearts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "little_houses" ADD CONSTRAINT "little_houses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "little_houses" ADD CONSTRAINT "little_houses_deceased_relative_id_fkey" FOREIGN KEY ("deceased_relative_id") REFERENCES "deceased_relatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "self_cultivation_sheets" ADD CONSTRAINT "self_cultivation_sheets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "self_cultivation_templates" ADD CONSTRAINT "self_cultivation_templates_pdf_media_id_fkey" FOREIGN KEY ("pdf_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convincing_family_ritual_sessions" ADD CONSTRAINT "convincing_family_ritual_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "name_change_applications" ADD CONSTRAINT "name_change_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sutra_reading_sessions" ADD CONSTRAINT "sutra_reading_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sutra_bookmarks" ADD CONSTRAINT "sutra_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "little_house_burn_sessions" ADD CONSTRAINT "little_house_burn_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altar_profiles" ADD CONSTRAINT "altar_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "water_offering_logs" ADD CONSTRAINT "water_offering_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deceased_relatives" ADD CONSTRAINT "deceased_relatives_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charity_whitelisting_rules" ADD CONSTRAINT "charity_whitelisting_rules_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity_whitelist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_detection_alerts" ADD CONSTRAINT "fraud_detection_alerts_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity_whitelist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_charity_interactions" ADD CONSTRAINT "user_charity_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_charity_interactions" ADD CONSTRAINT "user_charity_interactions_charity_id_fkey" FOREIGN KEY ("charity_id") REFERENCES "charity_whitelist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marital_purity_vows" ADD CONSTRAINT "marital_purity_vows_practitioner_id_fkey" FOREIGN KEY ("practitioner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thought_state_logs" ADD CONSTRAINT "thought_state_logs_vow_id_fkey" FOREIGN KEY ("vow_id") REFERENCES "marital_purity_vows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marital_guidance_requests" ADD CONSTRAINT "marital_guidance_requests_vow_id_fkey" FOREIGN KEY ("vow_id") REFERENCES "marital_purity_vows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vow_audit_events" ADD CONSTRAINT "vow_audit_events_vow_id_fkey" FOREIGN KEY ("vow_id") REFERENCES "marital_purity_vows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buddhist_events" ADD CONSTRAINT "buddhist_events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "buddhist_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_audit_logs" ADD CONSTRAINT "event_audit_logs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "buddhist_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "life_release_records" ADD CONSTRAINT "life_release_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "release_animal_entries" ADD CONSTRAINT "release_animal_entries_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "life_release_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proxy_life_releases" ADD CONSTRAINT "proxy_life_releases_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "life_release_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proxy_life_releases" ADD CONSTRAINT "proxy_life_releases_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lh_records" ADD CONSTRAINT "lh_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lh_recitations" ADD CONSTRAINT "lh_recitations_lh_record_id_fkey" FOREIGN KEY ("lh_record_id") REFERENCES "lh_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lh_completion_records" ADD CONSTRAINT "lh_completion_records_lh_record_id_fkey" FOREIGN KEY ("lh_record_id") REFERENCES "lh_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lh_dotting_sessions" ADD CONSTRAINT "lh_dotting_sessions_lh_record_id_fkey" FOREIGN KEY ("lh_record_id") REFERENCES "lh_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lh_combustion_logs" ADD CONSTRAINT "lh_combustion_logs_lh_record_id_fkey" FOREIGN KEY ("lh_record_id") REFERENCES "lh_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lh_fraud_logs" ADD CONSTRAINT "lh_fraud_logs_lh_record_id_fkey" FOREIGN KEY ("lh_record_id") REFERENCES "lh_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_applicants" ADD CONSTRAINT "form_applicants_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "sacred_form_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_applicants" ADD CONSTRAINT "form_applicants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_prerequisite_entries" ADD CONSTRAINT "form_prerequisite_entries_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "form_applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sacred_form_audit_logs" ADD CONSTRAINT "sacred_form_audit_logs_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "form_applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altar_items" ADD CONSTRAINT "altar_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altar_validation_logs" ADD CONSTRAINT "altar_validation_logs_altar_item_id_fkey" FOREIGN KEY ("altar_item_id") REFERENCES "altar_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "altar_validation_logs" ADD CONSTRAINT "altar_validation_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
