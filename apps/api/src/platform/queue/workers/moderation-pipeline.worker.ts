/**
 * ModerationPipelineWorker — async moderation action processor.
 *
 * Decouples HTTP request from moderation side-effects:
 *   - Audit log write
 *   - Search index update after content status change
 *   - Future: email notification, webhook dispatch
 */
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { QUEUES } from "../queue.constants.js";
import type { ModerationPipelineJobData } from "../queue.service.js";

@Processor(QUEUES.MODERATION_PIPELINE)
export class ModerationPipelineWorker extends WorkerHost {
  private readonly logger = new Logger(ModerationPipelineWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<ModerationPipelineJobData>): Promise<void> {
    const { contentId, contentType, action, moderatorId, reason } = job.data;

    this.logger.log({
      msg: "moderation.pipeline.started",
      jobId: job.id,
      contentId,
      contentType,
      action,
    });

    // Write moderation audit record
    await this.prisma.auditLog.create({
      data: {
        actorId: moderatorId,
        actorType: "moderator",
        action: `moderation.${action}`,
        resource: contentType,
        resourceId: contentId,
        metadata: { reason: reason ?? null, jobId: job.id },
      },
    });

    this.logger.log({
      msg: "moderation.pipeline.completed",
      jobId: job.id,
      contentId,
      action,
    });
  }
}
