// ─────────────────────────────────────────────────────────────
//  POST /api/user/avatar — Proxy upload avatar
//  Đọc JWT từ httpOnly cookie, forward multipart đến Strapi /upload
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN) || cookieStore.get('auth_token')?.value

  if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const incoming = await req.formData()
    const file = (incoming.get('file') ?? incoming.get('files')) as File | null
    if (!file) {
      return NextResponse.json({ error: 'Thiếu tệp tải lên' }, { status: 400 })
    }

    const formData = new FormData()
    formData.set('file', file)
    const alt = incoming.get('alt')
    if (typeof alt === 'string' && alt.trim()) {
      formData.set('alt', alt.trim())
    }

    const res = await fetch(`${CMS_API_URL}/api/media`, {
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

    const uploaded = (data as any)?.doc ?? (Array.isArray(data) ? data[0] : data)

    if (!uploaded) {
      return NextResponse.json({ error: 'Phản hồi upload không hợp lệ' }, { status: 500 })
    }
    return NextResponse.json({
      id: uploaded.id,
      url: uploaded.url.startsWith('http') ? uploaded.url : `${CMS_API_URL}${uploaded.url}`,
    })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
