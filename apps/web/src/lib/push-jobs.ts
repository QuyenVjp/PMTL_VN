import { queuePushJob } from "@/lib/push-server";

interface EnqueuePushJobInput {
  kind: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  payload?: Record<string, unknown>;
  chunkSize?: number;
}

export async function enqueuePushJobSafe(input: EnqueuePushJobInput) {
  try {
    await queuePushJob(input);
  } catch (error) {
    console.error("[push enqueue]", error);
  }
}

export async function dispatchQueueUntil(targetJobDocumentId?: string) {
  return {
    reachedTarget: false,
    rounds: 0,
    reason: "worker-managed-in-cms",
    ...(targetJobDocumentId ? { targetJobDocumentId } : {}),
  };
}
