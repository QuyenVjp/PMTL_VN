import { NextRequest, NextResponse } from 'next/server'
import { fetchRecentNotifications } from '@/lib/push-server'

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get('limit') || '12')

  try {
    const result = await fetchRecentNotifications(limit)
    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error('[Notifications API] Falling back to empty list:', error)
    return NextResponse.json({ data: [] })
  }
}
