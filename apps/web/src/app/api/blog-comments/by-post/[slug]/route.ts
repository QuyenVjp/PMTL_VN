// ─────────────────────────────────────────────────────────────
//  app/api/blog-comments/by-post/[slug]/route.ts
//  GET — lấy bình luận đã duyệt theo slug bài viết
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { slug } = await params
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '1'
  const pageSize = searchParams.get('pageSize') ?? '20'

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/blog-comments/by-post/${encodeURIComponent(slug)}?page=${page}&pageSize=${pageSize}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return Response.json({ error: 'Lỗi khi tải bình luận.' }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
