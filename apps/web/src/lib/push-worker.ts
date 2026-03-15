import {
  fetchNextPushJob,
  fetchPushSubscriptionsPage,
  isNotificationTypeEnabled,
  markSubscriptionDelivery,
  updatePushJob,
} from '@/lib/push-server'

export interface PushProcessResult {
  success: number
  failed: number
  invalid: number
  matched: number
  processedRows: number
  completed: boolean
  jobDocumentId: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown push processing error'
  }
}

async function loadWebPush() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('web-push')
  } catch {
    throw new Error('Thiếu package web-push. Chạy npm install web-push trong fe-pmtl.')
  }
}

async function safeMarkSubscriptionDelivery(documentId: string, data: Record<string, unknown>) {
  try {
    await markSubscriptionDelivery(documentId, data)
  } catch (error) {
    console.error('[push delivery update]', error)
  }
}

export async function processNextPushJob(): Promise<PushProcessResult | null> {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL || 'admin@phapmontamlinh.vn'

  if (!vapidPublic || !vapidPrivate) {
    throw new Error('VAPID keys chưa cấu hình')
  }

  const job = await fetchNextPushJob()
  if (!job) return null

  const chunkSize = Math.max(1, Math.min(500, job.chunkSize ?? 100))
  const cursor = Math.max(0, job.cursor ?? 0)
  const now = new Date()

  await updatePushJob(job.documentId, {
    status: 'processing',
    startedAt: job.startedAt || now.toISOString(),
  })

  try {
    const page = await fetchPushSubscriptionsPage(cursor, chunkSize)
    const rows = page.data || []

    if (rows.length === 0) {
      await updatePushJob(job.documentId, {
        status: 'completed',
        finishedAt: new Date().toISOString(),
      })

      return {
        success: 0,
        failed: 0,
        invalid: 0,
        matched: 0,
        processedRows: 0,
        completed: true,
        jobDocumentId: job.documentId,
      }
    }

    const webpush = await loadWebPush()
    webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate)

    const payload = JSON.stringify({
      title: job.title,
      body: job.body,
      url: job.url || '/niem-kinh',
      tag: job.tag || job.kind,
      ...(job.payload || {}),
    })
    const excludeUserIds = Array.isArray(job.payload?.excludeUserIds)
      ? job.payload.excludeUserIds.filter((value): value is number => typeof value === 'number')
      : []
    const excludeEndpoints = Array.isArray(job.payload?.excludeEndpoints)
      ? job.payload.excludeEndpoints.filter((value): value is string => typeof value === 'string' && value.length > 0)
      : []

    const eligible = rows.filter((subscription) => {
      if (excludeEndpoints.includes(subscription.endpoint)) {
        return false
      }
      const subscriptionUserId = subscription.user?.id
      if (typeof subscriptionUserId === 'number' && excludeUserIds.includes(subscriptionUserId)) {
        return false
      }
      return isNotificationTypeEnabled(subscription, job.kind)
    })

    let success = 0
    let failed = 0
    let invalid = 0

    for (const subscription of eligible) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          payload
        )

        success += 1
        await safeMarkSubscriptionDelivery(subscription.documentId, {
          lastSentAt: now.toISOString(),
          lastError: null,
          failedCount: 0,
          isActive: true,
        })
      } catch (error: any) {
        const statusCode = Number(error?.statusCode || error?.status || 0)
        const currentFailed = subscription.failedCount ?? 0

        if (statusCode === 404 || statusCode === 410) {
          invalid += 1
          await safeMarkSubscriptionDelivery(subscription.documentId, {
            isActive: false,
            lastError: error?.message || 'Subscription không còn hợp lệ',
            failedCount: currentFailed + 1,
          })
          continue
        }

        failed += 1
        await safeMarkSubscriptionDelivery(subscription.documentId, {
          lastError: error?.message || getErrorMessage(error),
          failedCount: currentFailed + 1,
        })
      }
    }

    const nextCursor = cursor + rows.length
    const completed = rows.length < chunkSize

    await updatePushJob(job.documentId, {
      cursor: nextCursor,
      targetedCount: (job.targetedCount ?? 0) + eligible.length,
      processedCount: (job.processedCount ?? 0) + rows.length,
      successCount: (job.successCount ?? 0) + success,
      failedCount: (job.failedCount ?? 0) + failed,
      invalidCount: (job.invalidCount ?? 0) + invalid,
      status: completed ? 'completed' : 'processing',
      finishedAt: completed ? new Date().toISOString() : null,
    })

    return {
      success,
      failed,
      invalid,
      matched: eligible.length,
      processedRows: rows.length,
      completed,
      jobDocumentId: job.documentId,
    }
  } catch (error) {
    await updatePushJob(job.documentId, {
      status: 'failed',
      lastError: getErrorMessage(error),
      finishedAt: new Date().toISOString(),
    })
    throw error
  }
}
