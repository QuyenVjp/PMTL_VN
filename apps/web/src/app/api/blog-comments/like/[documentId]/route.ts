// ─────────────────────────────────────────────────────────────
//  app/api/blog-comments/like/[documentId]/route.ts
//  POST — tăng lượt thích bình luận
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export const dynamic = 'force-dynamic'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { documentId } = await params
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/blog-comments/like/${encodeURIComponent(documentId)}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const data = await parseResponseBody(res)
    if (!res.ok) {
      return Response.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Không thể thích bình luận') },
        { status: res.status }
      )
    }
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
