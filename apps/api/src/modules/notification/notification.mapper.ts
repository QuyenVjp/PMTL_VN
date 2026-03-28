import type { PushJob, User } from "../../generated/prisma/client.js";

type CreatorRow = Pick<User, "publicId" | "displayName" | "email">;

type PushJobWithCreator = PushJob & { createdBy: CreatorRow };

export function mapPushJobToAdminItem(job: PushJobWithCreator) {
  return {
    publicId: job.publicId,
    title: job.title,
    body: job.body,
    status: job.status,
    targetAudience: job.targetAudience,
    sentCount: job.sentCount,
    failedCount: job.failedCount,
    createdBy: {
      publicId: job.createdBy.publicId,
      displayName: job.createdBy.displayName,
      email: job.createdBy.email,
    },
    processedAt: job.processedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
  };
}
