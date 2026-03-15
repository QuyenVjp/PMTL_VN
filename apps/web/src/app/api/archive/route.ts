// ─────────────────────────────────────────────────────────────
//  app/api/archive/route.ts
//  GET — bài viết theo năm/tháng + mục lục tổng hợp
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'
import { getArchiveIndex, getArchivePosts } from '@/lib/api/archive'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const page = searchParams.get('page') ?? '1'
  const pageSize = searchParams.get('pageSize') ?? '12'
  const index = searchParams.get('index') === '1' // ?index=1 → trả về mục lục

  try {
    if (index) {
      const data = await getArchiveIndex()
      return Response.json(data)
    }

    if (!year) {
      return Response.json({ error: 'Thiếu tham số year.' }, { status: 400 })
    }

    const data = await getArchivePosts(
      Number(year),
      month ? Number(month) : undefined,
      Number(page),
      Number(pageSize),
    )
    return Response.json(data)
  } catch (error) {
    logger.error('Archive API failed', { error, month, page, pageSize, year })
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
