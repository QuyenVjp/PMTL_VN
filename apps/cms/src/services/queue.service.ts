import { Queue } from "bullmq";
import { QUEUE_NAMES, type EmailNotificationJob, type SearchSyncJob } from "@pmtl/shared";

import { getBullMqConnection } from "./redis.service";
import type { ContentDocument } from "./types";

const queues = new Map<(typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES], Queue>();

function getQueue(name: (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]) {
  const existingQueue = queues.get(name);

  if (existingQueue) {
    return existingQueue;
  }

  const connection = getBullMqConnection();

  if (!connection) {
    return null;
  }

  const queue = new Queue(name, {
    connection,
  });

  queues.set(name, queue);

  return queue;
}

export async function enqueueSearchSyncJob(document: ContentDocument) {
  const queue = getQueue(QUEUE_NAMES.searchSync);

  if (!queue) {
    return false;
  }

  await queue.add(
    "post-sync",
    <SearchSyncJob>{
      entityType: "post",
      documentId: document.documentId ?? document.id,
      publicId: document.publicId ?? null,
      document,
    },
    {
      removeOnComplete: 100,
      removeOnFail: 100,
      jobId: `search:post:${document.publicId ?? document.id}`,
    },
  );

  return true;
}

export async function enqueuePushDispatchJob(pushJobId: string | number) {
  const queue = getQueue(QUEUE_NAMES.pushDispatch);

  if (!queue) {
    return false;
  }

  await queue.add(
    "push-dispatch",
    {
      pushJobId: String(pushJobId),
    },
    {
      removeOnComplete: 100,
      removeOnFail: 100,
      jobId: `push:${pushJobId}`,
    },
  );

  return true;
}

export async function enqueueEmailNotificationJob(job: EmailNotificationJob) {
  const queue = getQueue(QUEUE_NAMES.emailNotification);

  if (!queue) {
    return false;
  }

  await queue.add("email-notification", job, {
    removeOnComplete: 100,
    removeOnFail: 100,
  });

  return true;
}

export async function closeQueues(): Promise<void> {
  await Promise.all(Array.from(queues.values()).map((queue) => queue.close()));
  queues.clear();
}

export async function getQueueJobCounts(name: (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]) {
  const queue = getQueue(name);

  if (!queue) {
    return {
      enabled: false,
      counts: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      },
    };
  }

  const counts = await queue.getJobCounts("waiting", "active", "completed", "failed", "delayed");

  return {
    enabled: true,
    counts: {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
    },
  };
}
