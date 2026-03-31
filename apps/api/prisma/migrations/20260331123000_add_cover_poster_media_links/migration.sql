-- Add schema-level media linkage drift fixes from SCHEMA_PLAN:
-- - beginner_guides.cover_media_id
-- - downloads.file_media_id + downloads.thumbnail_media_id
-- - calendar_events.cover_image_id + calendar_events.poster_image_id

ALTER TABLE "beginner_guides"
  ADD COLUMN "cover_media_id" TEXT;

ALTER TABLE "downloads"
  ADD COLUMN "file_media_id" TEXT,
  ADD COLUMN "thumbnail_media_id" TEXT;

ALTER TABLE "calendar_events"
  ADD COLUMN "cover_image_id" TEXT,
  ADD COLUMN "poster_image_id" TEXT;

CREATE INDEX "beginner_guides_cover_media_id_idx" ON "beginner_guides"("cover_media_id");
CREATE INDEX "downloads_file_media_id_idx" ON "downloads"("file_media_id");
CREATE INDEX "downloads_thumbnail_media_id_idx" ON "downloads"("thumbnail_media_id");
CREATE INDEX "calendar_events_cover_image_id_idx" ON "calendar_events"("cover_image_id");
CREATE INDEX "calendar_events_poster_image_id_idx" ON "calendar_events"("poster_image_id");

ALTER TABLE "beginner_guides"
  ADD CONSTRAINT "beginner_guides_cover_media_id_fkey"
  FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "downloads"
  ADD CONSTRAINT "downloads_file_media_id_fkey"
  FOREIGN KEY ("file_media_id") REFERENCES "media_assets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "downloads"
  ADD CONSTRAINT "downloads_thumbnail_media_id_fkey"
  FOREIGN KEY ("thumbnail_media_id") REFERENCES "media_assets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "calendar_events"
  ADD CONSTRAINT "calendar_events_cover_image_id_fkey"
  FOREIGN KEY ("cover_image_id") REFERENCES "media_assets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "calendar_events"
  ADD CONSTRAINT "calendar_events_poster_image_id_fkey"
  FOREIGN KEY ("poster_image_id") REFERENCES "media_assets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
