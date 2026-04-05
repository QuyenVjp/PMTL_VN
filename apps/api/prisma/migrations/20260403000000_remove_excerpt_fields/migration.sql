-- Remove excerpt column from posts, wisdom_entries, beginner_guides.
-- Some historical baselines may not include all three tables in shadow DB,
-- so guard at table-level before attempting ALTER TABLE.
DO $$
BEGIN
  IF to_regclass('public.posts') IS NOT NULL THEN
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt";
  END IF;

  IF to_regclass('public.wisdom_entries') IS NOT NULL THEN
    ALTER TABLE "wisdom_entries" DROP COLUMN IF EXISTS "excerpt";
  END IF;

  IF to_regclass('public.beginner_guides') IS NOT NULL THEN
    ALTER TABLE "beginner_guides" DROP COLUMN IF EXISTS "excerpt";
  END IF;
END $$;
