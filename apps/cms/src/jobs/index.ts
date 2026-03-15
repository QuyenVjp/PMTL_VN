import { getLogger } from "@/services/logger.service";

const logger = getLogger("jobs:index");

export function enqueuePlaceholderJob(name: string, payload: Record<string, string>): void {
  logger.info({ name, payload }, "Placeholder CMS job enqueued");
}

