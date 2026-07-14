/**
 * ModerationPipelineWorker — async moderation action processor.
 *
 * Decouples HTTP request from moderation side-effects:
 *   - Audit log write (via append-only AuditService)
 *   - Search index update after content status change
 *   - Future: email notification, webhook dispatch
 */
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { AuditService } from "../../audit/audit.service.js";
import type { AuditAction } from "../../audit/audit.schemas.js";
import { QUEUES } from "../queue.constants.js";
import type { ModerationPipelineJobData } from "../queue.service.js";

@Processor(QUEUES.MODERATION_PIPELINE)
export class ModerationPipelineWorker extends WorkerHost {
  private readonly logger = new Logger(ModerationPipelineWorker.name);

  constructor(private readonly audit: AuditService) {
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

    // Map pipeline action → canonical audit action enum (no free-form strings).
    const actionMap = {
      flag: "moderation.flag",
      approve: "moderation.approve",
      reject: "moderation.reject",
    } as const satisfies Record<ModerationPipelineJobData["action"], AuditAction>;
    const auditAction = actionMap[action];

    // Append-only audit — never write auditLog.create directly (breaks hash chain).
    await this.audit.append(
      {
        actorId: moderatorId,
        actorType: "admin",
        correlationId: job.id ? `moderation-job:${job.id}` : undefined,
      },
      auditAction,
      contentType,
      contentId,
      { reason: reason ?? null, jobId: job.id },
    );

    this.logger.log({
      msg: "moderation.pipeline.completed",
      jobId: job.id,
      contentId,
      action,
    });
  }
}
