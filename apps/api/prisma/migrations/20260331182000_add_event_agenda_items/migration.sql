-- CreateTable
CREATE TABLE "event_agenda_items" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_agenda_items_public_id_key" ON "event_agenda_items"("public_id");

-- CreateIndex
CREATE INDEX "event_agenda_items_event_id_idx" ON "event_agenda_items"("event_id");

-- AddForeignKey
ALTER TABLE "event_agenda_items" ADD CONSTRAINT "event_agenda_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
