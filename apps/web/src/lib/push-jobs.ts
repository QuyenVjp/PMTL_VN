import { createPushJob, fetchPushJobByDocumentId } from '@/lib/push-server'
import { processNextPushJob, type PushProcessResult } from '@/lib/push-worker'

interface EnqueuePushJobInput {
  kind: string
  title: string
  body: string
  url?: string
  tag?: string
  payload?: Record<string, unknown>
  chunkSize?: number
}

export async function enqueuePushJobSafe(input: EnqueuePushJobInput) {
  try {
    await createPushJob({
      kind: input.kind,
      status: 'pending',
      title: input.title,
      body: input.body,
      url: input.url || '/shares',
      tag: input.tag || input.kind,
      payload: input.payload || {},
      chunkSize: Math.max(1, Math.min(500, Number(input.chunkSize) || 100)),
      cursor: 0,
      targetedCount: 0,
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      invalidCount: 0,
      lastError: null,
      startedAt: null,
      finishedAt: null,
    })
  } catch (error) {
    console.error('[push enqueue]', error)
  }
}

export async function dispatchQueueUntil(targetJobDocumentId?: string) {
  const maxRounds = 20
  const results: PushProcessResult[] = []

  for (let round = 1; round <= maxRounds; round += 1) {
    const result = await processNextPushJob()

    if (!result) {
      return {
        reachedTarget: false,
        rounds: round,
        reason: 'empty-queue',
        results,
      }
    }

    results.push(result)

    if (!targetJobDocumentId || result.jobDocumentId === targetJobDocumentId) {
      const latest = await fetchPushJobByDocumentId(result.jobDocumentId)
      return {
        reachedTarget: !targetJobDocumentId || result.jobDocumentId === targetJobDocumentId,
        rounds: round,
        result,
        latest,
        results,
      }
    }
  }

  const latest = targetJobDocumentId ? await fetchPushJobByDocumentId(targetJobDocumentId) : null

  return {
    reachedTarget: false,
    rounds: maxRounds,
    reason: 'max-rounds-exceeded',
    latest,
    results,
  }
}
