-- CreateEnum
CREATE TYPE "WisdomEntryType" AS ENUM ('BACH_THOAI', 'KHAI_THI', 'PHAT_NGON', 'PHAP_HOI');

-- CreateTable
CREATE TABLE "wisdom_entries" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "entry_type" "WisdomEntryType" NOT NULL DEFAULT 'BACH_THOAI',
    "source_family" TEXT,
    "source_url" TEXT,
    "source_code" TEXT,
    "original_text" TEXT,
    "translated_text" TEXT,
    "excerpt" TEXT,
    "tags" TEXT[],
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "author_id" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wisdom_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wisdom_entries_public_id_key" ON "wisdom_entries"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "wisdom_entries_slug_key" ON "wisdom_entries"("slug");

-- CreateIndex
CREATE INDEX "wisdom_entries_author_id_idx" ON "wisdom_entries"("author_id");

-- CreateIndex
CREATE INDEX "wisdom_entries_status_idx" ON "wisdom_entries"("status");

-- CreateIndex
CREATE INDEX "wisdom_entries_entry_type_idx" ON "wisdom_entries"("entry_type");

-- AddForeignKey
ALTER TABLE "wisdom_entries" ADD CONSTRAINT "wisdom_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
