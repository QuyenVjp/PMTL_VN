import type { Payload, TaskConfig } from "payload";
import {
  QUEUE_NAMES,
  type EmailNotificationJob,
  type PushDispatchJob,
  type SearchSyncJob,
} from "@pmtl/shared";

import { getLogger, withError } from "@/services/logger.service";
import { runEmailNotificationJob } from "@/workers/processors/email-notification";
import { runPushDispatchJob } from "@/workers/processors/push-dispatch";
import { runSearchSyncJob } from "@/workers/processors/search-sync";

const logger = getLogger("jobs:index");

export const JOB_TASK_SLUGS = {
  emailNotification: "email-notification",
  pushDispatch: "push-dispatch",
  searchSync: "search-sync",
} as const;

export const cmsJobTasks: TaskConfig[] = [
  {
    slug: JOB_TASK_SLUGS.searchSync,
    label: "Search sync",
    retries: 3,
    handler: async ({ input, req }) => ({
      output: await runSearchSyncJob(req.payload, input as SearchSyncJob),
    }),
  },
  {
    slug: JOB_TASK_SLUGS.pushDispatch,
    label: "Push dispatch",
    retries: 2,
    handler: async ({ input, req }) => ({
      output: await runPushDispatchJob(req.payload, input as PushDispatchJob),
    }),
  },
  {
    slug: JOB_TASK_SLUGS.emailNotification,
    label: "Email notification",
    retries: 2,
    handler: async ({ input, req }) => ({
      output: await runEmailNotificationJob(req.payload, input as EmailNotificationJob),
    }),
  },
];

export async function runPendingCmsJobs(options: {
  payload: Payload;
  silent?: boolean;
}): Promise<void> {
  const { payload, silent = true } = options;

  for (const queue of Object.values(QUEUE_NAMES)) {
    try {
      await payload.jobs.run({
        limit: queue === QUEUE_NAMES.searchSync ? 20 : 10,
        overrideAccess: true,
        queue,
        silent,
      });
    } catch (error) {
      logger.error(withError({ queue }, error), "Failed to run queued CMS jobs");
    }
  }
}

