// ─────────────────────────────────────────────────────────────
//  app/api/archive/route.ts
//  GET — bài viết theo năm/tháng + mục lục tổng hợp
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function GET(request: NextRequest) {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const page = searchParams.get('page') ?? '1'
  const pageSize = searchParams.get('pageSize') ?? '12'
  const index = searchParams.get('index') === '1' // ?index=1 → trả về mục lục

  try {
    if (index) {
      // Trả về mục lục năm/tháng
      const res = await fetch(`${STRAPI_URL}/api/blog-posts/archive-index`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600, tags: ['blog-posts'] },
      })
      const data = await res.json()
      return Response.json(data, { status: res.status })
    }

    if (!year) {
      return Response.json({ error: 'Thiếu tham số year.' }, { status: 400 })
    }

    const monthParam = month ? `&month=${month}` : ''
    const res = await fetch(
      `${STRAPI_URL}/api/blog-posts/archive?year=${year}${monthParam}&page=${page}&pageSize=${pageSize}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 600, tags: ['blog-posts'] },
      }
    )

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
