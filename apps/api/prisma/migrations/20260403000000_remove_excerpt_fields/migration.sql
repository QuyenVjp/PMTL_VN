-- Remove excerpt column from posts, wisdom_entries, beginner_guides
ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt";
ALTER TABLE "wisdom_entries" DROP COLUMN IF EXISTS "excerpt";
ALTER TABLE "beginner_guides" DROP COLUMN IF EXISTS "excerpt";
