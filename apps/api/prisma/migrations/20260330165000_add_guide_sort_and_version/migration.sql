-- Add sortOrder and versionNote to BeginnerGuide
ALTER TABLE "beginner_guides" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "beginner_guides" ADD COLUMN "version_note" VARCHAR(500);
