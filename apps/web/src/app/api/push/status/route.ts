import { NextRequest, NextResponse } from 'next/server'
import { fetchSubscriptionByEndpoint } from '@/lib/push-server'

export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json()

    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json({ error: 'Thiếu endpoint' }, { status: 400 })
    }

    const record = await fetchSubscriptionByEndpoint(endpoint)
    return NextResponse.json({ data: record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể đọc trạng thái push' },
      { status: 500 }
    )
  }
}
