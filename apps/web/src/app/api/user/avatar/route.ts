// ─────────────────────────────────────────────────────────────
//  POST /api/user/avatar — Proxy upload avatar
//  Đọc JWT từ httpOnly cookie, forward multipart đến Strapi /upload
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const formData = await req.formData()

    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    const data = await parseResponseBody(res)

    if (!res.ok) {
      return NextResponse.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Upload thất bại') },
        { status: res.status }
      )
    }

    const uploaded = Array.isArray(data) ? data[0] : data
    return NextResponse.json({
      id: uploaded.id,
      url: uploaded.url.startsWith('http') ? uploaded.url : `${STRAPI_URL}${uploaded.url}`,
    })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
