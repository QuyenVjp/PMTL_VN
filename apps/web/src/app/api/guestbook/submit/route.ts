// ─────────────────────────────────────────────────────────────
//  app/api/guestbook/submit/route.ts
//  POST — gửi lưu bút mới
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(request: NextRequest) {
  const token = process.env.PAYLOAD_API_TOKEN
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Request body không hợp lệ.' }, { status: 400 })
  }

  const forwardedFor =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  try {
    const res = await fetch(`${CMS_API_URL}/api/guestbook/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Forwarded-For': forwardedFor,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
