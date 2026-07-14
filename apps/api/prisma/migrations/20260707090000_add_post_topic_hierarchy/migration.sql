ALTER TABLE "post_categories"
  ADD COLUMN "parent_id" TEXT,
  ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "level" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "path" TEXT;

CREATE INDEX "post_categories_parent_id_idx" ON "post_categories"("parent_id");
CREATE INDEX "post_categories_level_sort_order_idx" ON "post_categories"("level", "sort_order");

ALTER TABLE "post_categories"
  ADD CONSTRAINT "post_categories_parent_id_fkey"
  FOREIGN KEY ("parent_id")
  REFERENCES "post_categories"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
