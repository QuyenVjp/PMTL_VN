// ─────────────────────────────────────────────────────────────
//  PUT /api/user/update — Proxy cập nhật thông tin user
//  Đọc JWT từ httpOnly cookie, forward đến Strapi /users/me
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = await req.json()

    const res = await fetch(`${CMS_API_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: body }),
    })

    const data = await parseResponseBody(res)

    if (!res.ok) {
      return NextResponse.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Cập nhật thất bại') },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
