-- Make migration replay-safe for shadow DB / mixed historical baselines.
ALTER TABLE "chanting_sessions"
  DROP CONSTRAINT IF EXISTS "chanting_sessions_author_id_fkey";

DROP INDEX IF EXISTS "chanting_sessions_author_id_idx";
DROP INDEX IF EXISTS "chanting_sessions_public_id_key";
DROP INDEX IF EXISTS "chanting_sessions_session_type_idx";
DROP INDEX IF EXISTS "chanting_sessions_status_idx";

ALTER TABLE "chanting_sessions"
  DROP COLUMN IF EXISTS "author_id",
  DROP COLUMN IF EXISTS "content",
  DROP COLUMN IF EXISTS "description",
  DROP COLUMN IF EXISTS "duration",
  DROP COLUMN IF EXISTS "public_id",
  DROP COLUMN IF EXISTS "published_at",
  DROP COLUMN IF EXISTS "session_type",
  DROP COLUMN IF EXISTS "status",
  DROP COLUMN IF EXISTS "title",
  ADD COLUMN IF NOT EXISTS "duration_minutes" INTEGER,
  ADD COLUMN IF NOT EXISTS "location" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "session_date" DATE,
  ADD COLUMN IF NOT EXISTS "start_time" TEXT,
  ADD COLUMN IF NOT EXISTS "user_id" TEXT;

CREATE INDEX IF NOT EXISTS "chanting_sessions_user_id_idx" ON "chanting_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "chanting_sessions_session_date_idx" ON "chanting_sessions"("session_date");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chanting_sessions_user_id_fkey'
  ) THEN
    ALTER TABLE "chanting_sessions"
      ADD CONSTRAINT "chanting_sessions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END $$;
