/**
 * OutboxModule — Platform module for transactional event sourcing
 *
 * Exports:
 * - OutboxService: used by domain services to append events atomically
 * - OutboxProcessor: runs automatically via @Interval and @Cron
 *
 * Register in AppModule.imports after QueueModule.
 */
import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { QueueModule } from "../queue/queue.module.js";
import { PrismaModule } from "../../common/prisma/prisma.module.js";
import { OutboxService } from "./outbox.service.js";
import { OutboxProcessor } from "./outbox.processor.js";

@Module({
  imports: [
    // Schedule module for @Interval and @Cron decorators
    ScheduleModule.forRoot(),
    // Queue module (needed by OutboxProcessor to enqueue events)
    QueueModule,
    // Prisma module (needed by OutboxService for DB access)
    PrismaModule,
  ],
  providers: [OutboxService, OutboxProcessor],
  exports: [OutboxService],
})
export class OutboxModule {}
