import { NextRequest } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { documentId } = await params

  try {
    const body = await request.json()
    const res = await fetch(`${CMS_API_URL}/api/blog-comments/report/${encodeURIComponent(documentId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await parseResponseBody(res)
    if (!res.ok) {
      return Response.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Không thể báo cáo bình luận') },
        { status: res.status }
      )
    }
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
