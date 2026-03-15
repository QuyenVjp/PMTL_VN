import { NextRequest, NextResponse } from 'next/server'
import { createPushJob } from '@/lib/push-server'
import { dispatchQueueUntil } from '@/lib/push-jobs'

export async function POST(req: NextRequest) {
  const secret = process.env.PUSH_SEND_SECRET
  const authHeader = req.headers.get('Authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const {
      kind = 'daily_chant',
      title = 'Nhắc Niệm Kinh',
      body = 'Đến giờ niệm kinh hôm nay rồi, hãy dành vài phút tu tập nhé!',
      url = '/niem-kinh',
      tag = 'daily-reminder',
      chunkSize = 100,
      payload = {},
      dispatchNow = false,
    } = await req.json().catch(() => ({}))

    const created = await createPushJob({
      kind,
      status: 'pending',
      title,
      body,
      url,
      tag,
      payload,
      chunkSize: Math.max(1, Math.min(500, Number(chunkSize) || 100)),
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

    let dispatchResult = null
    if (dispatchNow) {
      dispatchResult = await dispatchQueueUntil(created.data.documentId)
    }

    return NextResponse.json({
      queued: true,
      job: created.data,
      dispatched: Boolean(dispatchResult),
      dispatchResult,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể tạo hàng đợi push' },
      { status: 500 }
    )
  }
}
