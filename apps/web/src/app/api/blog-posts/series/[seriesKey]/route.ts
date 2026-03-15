// ─────────────────────────────────────────────────────────────
//  app/api/blog-posts/series/[seriesKey]/route.ts
//  GET — bài viết trong cùng chuyên đề
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'
import { getSeriesData } from '@/lib/api/series'
import { logger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seriesKey: string }> }
) {
  const { seriesKey } = await params
  const { searchParams } = new URL(request.url)
  const currentSlug = searchParams.get('currentSlug') ?? ''

  try {
    const data = await getSeriesData(seriesKey, currentSlug)
    return Response.json(data)
  } catch (error) {
    logger.error('Series API failed', { currentSlug, error, seriesKey })
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
