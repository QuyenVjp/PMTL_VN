-- CreateTable
CREATE TABLE "chanting_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_date" DATE NOT NULL,
    "start_time" TIME NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chanting_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chanting_sessions_user_id_idx" ON "chanting_sessions"("user_id");

-- CreateIndex
CREATE INDEX "chanting_sessions_session_date_idx" ON "chanting_sessions"("session_date");

-- AddForeignKey
ALTER TABLE "chanting_sessions" ADD CONSTRAINT "chanting_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;