import { NextRequest, NextResponse } from 'next/server'
import { processNextPushJob } from '@/lib/push-worker'

export async function POST(req: NextRequest) {
  const secret = process.env.PUSH_WORKER_SECRET || process.env.PUSH_SEND_SECRET
  const authHeader = req.headers.get('Authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processNextPushJob()
    if (!result) {
      return NextResponse.json({ processed: false, reason: 'empty-queue' })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể xử lý hàng đợi push' },
      { status: 500 }
    )
  }
}
