/**
 * QueueService — producer for pdpa-retention + moderation-pipeline queues.
 * Inject this wherever jobs need to be enqueued (controllers, services).
 */
import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { QUEUES } from "./queue.constants.js";

export interface PdpaRetentionJobData {
  trigger: "scheduled" | "manual";
  requestedBy?: string;
}

export interface ModerationPipelineJobData {
  contentId: string;
  contentType: "post" | "comment" | "community";
  action: "flag" | "approve" | "reject";
  moderatorId: string;
  reason?: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUES.PDPA_RETENTION)
    private readonly pdpaQueue: Queue,
    @InjectQueue(QUEUES.MODERATION_PIPELINE)
    private readonly moderationQueue: Queue,
  ) {}

  async enqueuePdpaRetention(data: PdpaRetentionJobData) {
    const job = await this.pdpaQueue.add("run-retention", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    });
    this.logger.log({ msg: "queue.pdpa_retention.enqueued", jobId: job.id });
    return job.id;
  }

  async enqueueModerationAction(data: ModerationPipelineJobData) {
    const job = await this.moderationQueue.add("process-moderation", data, {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 100 },
    });
    this.logger.log({
      msg: "queue.moderation.enqueued",
      jobId: job.id,
      contentId: data.contentId,
      action: data.action,
    });
    return job.id;
  }

  async getQueueStats() {
    const [pdpaWaiting, pdpaActive, pdpaFailed] = await Promise.all([
      this.pdpaQueue.getWaitingCount(),
      this.pdpaQueue.getActiveCount(),
      this.pdpaQueue.getFailedCount(),
    ]);
    const [modWaiting, modActive, modFailed] = await Promise.all([
      this.moderationQueue.getWaitingCount(),
      this.moderationQueue.getActiveCount(),
      this.moderationQueue.getFailedCount(),
    ]);

    return {
      pdpaRetention: { waiting: pdpaWaiting, active: pdpaActive, failed: pdpaFailed },
      moderationPipeline: { waiting: modWaiting, active: modActive, failed: modFailed },
    };
  }
}
