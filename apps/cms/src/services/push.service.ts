import type { Payload } from "payload";

import { ensurePublicId } from "@/services/public-id.service";
import { enqueuePushDispatchJob } from "@/services/queue.service";

function sanitizeText(value?: string | null): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeNumber(value?: number | null): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

export function upsertPushSubscription<T extends { publicId?: string | null | undefined; endpoint?: string | null | undefined; timezone?: string | null | undefined; isActive?: boolean | null | undefined; failedCount?: number | null | undefined; lastError?: string | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      endpoint: sanitizeText(input.endpoint),
      timezone: sanitizeText(input.timezone),
      isActive: input.isActive ?? true,
      failedCount: normalizeNumber(input.failedCount),
      lastError: sanitizeText(input.lastError),
    },
    "psh",
  ) as T;
}

export function deactivatePushSubscription<T extends { isActive?: boolean | null | undefined }>(input: T): T {
  return {
    ...input,
    isActive: false,
  };
}

export function createPushJob<T extends { publicId?: string | null | undefined; kind?: string | null | undefined; status?: string | null | undefined; message?: string | null | undefined; url?: string | null | undefined; tag?: string | null | undefined; chunkSize?: number | null | undefined; sentCount?: number | null | undefined; failedCount?: number | null | undefined; errorSummary?: string | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      kind: sanitizeText(input.kind) || "broadcast",
      status: sanitizeText(input.status) || "pending",
      message: sanitizeText(input.message),
      url: sanitizeText(input.url),
      tag: sanitizeText(input.tag),
      chunkSize: normalizeNumber(input.chunkSize) || 100,
      sentCount: normalizeNumber(input.sentCount),
      failedCount: normalizeNumber(input.failedCount),
      errorSummary: sanitizeText(input.errorSummary),
    },
    "pjob",
  ) as T;
}

export async function enqueuePushDispatch(payload: Payload, id: string | number) {
  const updated = await payload.update({
    collection: "pushJobs",
    id,
    data: {
      status: "queued",
      startedAt: null,
      finishedAt: null,
    },
    overrideAccess: true,
  });

  const queued = await enqueuePushDispatchJob(payload, id);

  if (!queued) {
    return updated;
  }

  return updated;
}

export function dispatchPushChunk() {
  return;
}

export async function markPushJobProcessing(payload: Payload, id: string | number) {
  return payload.update({
    collection: "pushJobs",
    id,
    data: {
      status: "processing",
      startedAt: new Date().toISOString(),
      finishedAt: null,
      errorSummary: "",
    },
    overrideAccess: true,
  });
}

export async function updatePushJobProgress(
  payload: Payload,
  id: string | number,
  input: {
    cursor: number;
    sentCount: number;
    failedCount: number;
    errorSummary?: string;
  },
) {
  return payload.update({
    collection: "pushJobs",
    id,
    data: {
      cursor: input.cursor,
      sentCount: input.sentCount,
      failedCount: input.failedCount,
      ...(input.errorSummary !== undefined ? { errorSummary: sanitizeText(input.errorSummary) } : {}),
    },
    overrideAccess: true,
  });
}

export async function completePushJob(payload: Payload, id: string | number) {
  return payload.update({
    collection: "pushJobs",
    id,
    data: {
      status: "completed",
      finishedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  });
}

export async function failPushJob(payload: Payload, id: string | number, errorSummary: string) {
  return payload.update({
    collection: "pushJobs",
    id,
    data: {
      status: "failed",
      errorSummary: sanitizeText(errorSummary),
      finishedAt: new Date().toISOString(),
    },
    overrideAccess: true,
  });
}
