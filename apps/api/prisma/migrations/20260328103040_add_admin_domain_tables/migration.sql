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
