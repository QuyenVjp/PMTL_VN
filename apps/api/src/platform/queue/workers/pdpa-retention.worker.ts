/**
 * PDPA Retention Worker — processes session cleanup (+ audit archive notice).
 *
 * Current schema capabilities (no soft-delete User.deletedAt yet):
 *   - Delete expired/revoked sessions older than 90 days (PDPA NĐ 13/2023 §7)
 *   - Audit logs are APPEND-ONLY (hash chain + DB triggers). Physical delete is
 *     forbidden; operator archive after ≥ 7 years is documented in
 *     docs/runbooks/AUDIT_INTEGRITY.md. This worker never calls auditLog.delete*.
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

    // Session cleanup only — audit rows must not be deleted by app role.
    const sessionsDeleted = await this.prisma.session.deleteMany({
      where: {
        AND: [
          { expiresAt: { lt: cutoffSessions } },
          { createdAt: { lt: cutoffSessions } },
        ],
      },
    });

    // Count (not delete) audit rows past retention so ops can schedule archive.
    const auditLogsPastRetention = await this.prisma.auditLog.count({
      where: { createdAt: { lt: cutoffAuditLogs } },
    });

    if (auditLogsPastRetention > 0) {
      this.logger.warn({
        msg: "pdpa.retention.audit_archive_pending",
        jobId: job.id,
        auditLogsPastRetention,
        note: "audit_logs is append-only; run operator archive per docs/runbooks/AUDIT_INTEGRITY.md",
      });
    }

    const durationMs = Date.now() - startedAt;
    this.logger.log({
      msg: "pdpa.retention.completed",
      jobId: job.id,
      sessionsDeleted: sessionsDeleted.count,
      auditLogsPastRetention,
      auditLogsDeleted: 0,
      durationMs,
    });
  }
}
