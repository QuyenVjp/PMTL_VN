import { NextRequest, NextResponse } from 'next/server'
import { fetchPushStats, strapiAdminFetch } from '@/lib/push-server'

export async function GET(req: NextRequest) {
  const secret = process.env.PUSH_SEND_SECRET
  const authHeader = req.headers.get('Authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [subscriptionStats, jobs] = await Promise.all([
      fetchPushStats(),
      strapiAdminFetch<{ data: Array<Record<string, unknown>> }>(
        '/push-jobs?sort[0]=createdAt:desc&pagination[limit]=20',
        { method: 'GET' }
      ),
    ])

    return NextResponse.json({
      subscriptions: subscriptionStats.data,
      jobs: jobs.data,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể lấy thống kê push' },
      { status: 500 }
    )
  }
}
