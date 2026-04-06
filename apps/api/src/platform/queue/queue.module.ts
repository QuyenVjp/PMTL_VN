/**
 * QueueModule — BullMQ queue registration.
 *
 * Redis DB 1 (separate from cache DB 0 per BULLMQ_WORKER_ARCHITECTURE.md).
 * Queues: pdpa-retention, moderation-pipeline.
 * BullBoard UI at /admin/queues (all envs — restrict via RolesGuard upstream).
 */
import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { QUEUES } from "./queue.constants.js";
import { QueueService } from "./queue.service.js";
import { PdpaRetentionWorker } from "./workers/pdpa-retention.worker.js";
import { ModerationPipelineWorker } from "./workers/moderation-pipeline.worker.js";

@Module({
  imports: [
    // Root BullMQ config — Redis DB 1 isolated from cache DB 0
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const valkeyUrl = config.get<string>("VALKEY_URL");
        if (valkeyUrl) {
          // Parse URL and override db to 1 for queue isolation
          const url = new URL(valkeyUrl);
          return {
            connection: {
              host: url.hostname,
              port: parseInt(url.port || "6379", 10),
              password: url.password || undefined,
              db: 1, // BullMQ uses DB 1; cache uses DB 0
              tls: url.protocol === "rediss:" ? {} : undefined,
            },
          };
        }
        // Local dev fallback — no Redis, BullMQ runs in-memory via fake queue
        return {
          connection: { host: "127.0.0.1", port: 6379, db: 1 },
        };
      },
      inject: [ConfigService],
    }),

    // Queue registrations
    BullModule.registerQueue({ name: QUEUES.PDPA_RETENTION }),
    BullModule.registerQueue({ name: QUEUES.MODERATION_PIPELINE }),
    BullModule.registerQueue({ name: QUEUES.OUTBOX_DISPATCH }),

    // BullBoard UI — mount at /admin/queues
    BullBoardModule.forRoot({
      route: "/admin/queues",
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.PDPA_RETENTION,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.MODERATION_PIPELINE,
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: QUEUES.OUTBOX_DISPATCH,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [QueueService, PdpaRetentionWorker, ModerationPipelineWorker],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
