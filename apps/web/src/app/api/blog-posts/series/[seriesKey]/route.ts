// ─────────────────────────────────────────────────────────────
//  app/api/blog-posts/series/[seriesKey]/route.ts
//  GET — bài viết trong cùng chuyên đề
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seriesKey: string }> }
) {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { seriesKey } = await params
  const { searchParams } = new URL(request.url)
  const currentSlug = searchParams.get('currentSlug') ?? ''

  try {
    const res = await fetch(
      `${CMS_API_URL}/api/blog-posts/series/${encodeURIComponent(seriesKey)}?currentSlug=${encodeURIComponent(currentSlug)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600, tags: ['blog-posts'] },
      }
    )

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
