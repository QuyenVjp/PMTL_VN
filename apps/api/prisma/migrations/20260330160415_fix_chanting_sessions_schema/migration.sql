/*
  Warnings:

  - You are about to drop the column `author_id` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `public_id` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `published_at` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `session_type` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `chanting_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `chanting_sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[public_id]` on the table `chanting_sessions` will be removed. If there were duplicate values, this will fail.
  - Added the required column `duration_minutes` to the `chanting_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_date` to the `chanting_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `chanting_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `chanting_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "chanting_sessions" DROP CONSTRAINT "chanting_sessions_author_id_fkey";

-- DropIndex
DROP INDEX "chanting_sessions_author_id_idx";

-- DropIndex
DROP INDEX "chanting_sessions_public_id_key";

-- DropIndex
DROP INDEX "chanting_sessions_session_type_idx";

-- DropIndex
DROP INDEX "chanting_sessions_status_idx";

-- AlterTable
ALTER TABLE "chanting_sessions" DROP COLUMN "author_id",
DROP COLUMN "content",
DROP COLUMN "description",
DROP COLUMN "duration",
DROP COLUMN "public_id",
DROP COLUMN "published_at",
DROP COLUMN "session_type",
DROP COLUMN "status",
DROP COLUMN "title",
ADD COLUMN     "duration_minutes" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "session_date" DATE NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "chanting_sessions_user_id_idx" ON "chanting_sessions"("user_id");

-- CreateIndex
CREATE INDEX "chanting_sessions_session_date_idx" ON "chanting_sessions"("session_date");

-- AddForeignKey
ALTER TABLE "chanting_sessions" ADD CONSTRAINT "chanting_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;