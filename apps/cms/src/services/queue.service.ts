import type { Payload } from "payload";
import { QUEUE_NAMES, type EmailNotificationJob, type SearchSyncJob } from "@pmtl/shared";

import { JOB_TASK_SLUGS } from "@/jobs";
import type { ContentDocument } from "./types";

type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

function buildSearchSyncInput(document: ContentDocument): SearchSyncJob {
  return {
    entityType: "post",
    documentId: document.documentId ?? document.id,
    publicId: document.publicId ?? null,
    document,
  };
}

export async function enqueueSearchSyncJob(payload: Payload, document: ContentDocument) {
  await payload.jobs.queue({
    task: JOB_TASK_SLUGS.searchSync,
    queue: QUEUE_NAMES.searchSync,
    input: buildSearchSyncInput(document),
    overrideAccess: true,
  });

  return true;
}

export async function enqueuePushDispatchJob(payload: Payload, pushJobId: string | number) {
  await payload.jobs.queue({
    task: JOB_TASK_SLUGS.pushDispatch,
    queue: QUEUE_NAMES.pushDispatch,
    input: {
      pushJobId: String(pushJobId),
    },
    overrideAccess: true,
  });

  return true;
}

export async function enqueueEmailNotificationJob(payload: Payload, job: EmailNotificationJob) {
  await payload.jobs.queue({
    task: JOB_TASK_SLUGS.emailNotification,
    queue: QUEUE_NAMES.emailNotification,
    input: job,
    overrideAccess: true,
  });

  return true;
}

async function countJobs(payload: Payload, where: Record<string, unknown>) {
  const result = await payload.count({
    collection: "payload-jobs" as never,
    overrideAccess: true,
    where: where as never,
  });

  return result.totalDocs;
}

export async function getQueueJobCounts(payload: Payload, name: QueueName) {
  const now = new Date().toISOString();
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    countJobs(payload, {
      queue: {
        equals: name,
      },
      processing: {
        equals: false,
      },
      hasError: {
        not_equals: true,
      },
      completedAt: {
        exists: false,
      },
    }),
    countJobs(payload, {
      queue: {
        equals: name,
      },
      processing: {
        equals: true,
      },
    }),
    countJobs(payload, {
      queue: {
        equals: name,
      },
      completedAt: {
        exists: true,
      },
    }),
    countJobs(payload, {
      queue: {
        equals: name,
      },
      hasError: {
        equals: true,
      },
    }),
    countJobs(payload, {
      queue: {
        equals: name,
      },
      processing: {
        equals: false,
      },
      completedAt: {
        exists: false,
      },
      waitUntil: {
        greater_than: now,
      },
    }),
  ]);

  return {
    enabled: true,
    counts: {
      waiting,
      active,
      completed,
      failed,
      delayed,
    },
  };
}
