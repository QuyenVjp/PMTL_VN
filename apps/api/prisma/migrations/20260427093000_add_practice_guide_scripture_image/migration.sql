ALTER TABLE "practice_guides"
ADD COLUMN "scripture_image_media_id" TEXT;

CREATE INDEX "practice_guides_scripture_image_media_id_idx"
ON "practice_guides"("scripture_image_media_id");

ALTER TABLE "practice_guides"
ADD CONSTRAINT "practice_guides_scripture_image_media_id_fkey"
FOREIGN KEY ("scripture_image_media_id") REFERENCES "media_assets"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
