/**
 * PDPA Retention Worker — processes session + audit log cleanup.
 *
 * Current schema capabilities (no soft-delete User.deletedAt yet):
 *   - Delete expired/revoked sessions older than 90 days (PDPA NĐ 13/2023 §7)
 *   - Delete audit logs older than 7 years (retention limit)
 *
 * When User.deletedAt is added: extend to hard-delete soft-deleted users > 30 days.
 */
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { QUEUES } from "../queue.constants.js";
import type { PdpaRetentionJobData } from "../queue.service.js";

@Processor(QUEUES.PDPA_RETENTION)
export class PdpaRetentionWorker extends WorkerHost {
  private readonly logger = new Logger(PdpaRetentionWorker.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<PdpaRetentionJobData>): Promise<void> {
    const startedAt = Date.now();
    this.logger.log({ msg: "pdpa.retention.started", jobId: job.id, trigger: job.data.trigger });

    const cutoffSessions = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days
    const cutoffAuditLogs = new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000); // 7 years

    const [sessionsDeleted, auditLogsDeleted] = await Promise.all([
      // Delete sessions that are both expired AND older than 90 days (double-safety)
      this.prisma.session.deleteMany({
        where: {
          AND: [
            { expiresAt: { lt: cutoffSessions } },
            { createdAt: { lt: cutoffSessions } },
          ],
        },
      }),
      // Delete audit logs older than 7 years (PDPA max retention)
      this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoffAuditLogs } },
      }),
    ]);

    const durationMs = Date.now() - startedAt;
    this.logger.log({
      msg: "pdpa.retention.completed",
      jobId: job.id,
      sessionsDeleted: sessionsDeleted.count,
      auditLogsDeleted: auditLogsDeleted.count,
      durationMs,
    });
  }
}
