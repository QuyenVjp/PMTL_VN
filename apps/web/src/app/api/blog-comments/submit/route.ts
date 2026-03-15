// ─────────────────────────────────────────────────────────────
//  app/api/blog-comments/submit/route.ts
//  POST — gửi bình luận mới
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Request body không hợp lệ.' }, { status: 400 })
  }

  // Truyền IP thực từ header xuống Strapi để rate limit
  const forwardedFor =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  try {
    const res = await fetch(`${STRAPI_URL}/api/blog-comments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Forwarded-For': forwardedFor,
        'User-Agent': request.headers.get('user-agent') ?? '',
      },
      body: JSON.stringify(body),
    })

    const data = await parseResponseBody(res)
    if (!res.ok) {
      return Response.json(
        {
          error: normalizeApiErrorMessage(data, res.status, 'Gửi bình luận thất bại'),
          details: data,
        },
        { status: res.status }
      )
    }
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
