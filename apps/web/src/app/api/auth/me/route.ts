// ─────────────────────────────────────────────────────────────
//  GET /api/auth/me — Lấy thông tin user từ httpOnly cookie
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  // Guest user: return 200 null to avoid noisy 401 in production logs/network panel.
  if (!token) return NextResponse.json(null, { status: 200 })

  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      // Token không hợp lệ — xóa cookie, nhưng trả về guest state (200/null)
      const response = NextResponse.json(null, { status: 200 })
      response.cookies.delete({ name: 'auth_token', path: '/' })
      return response
    }

    const user = await res.json()

    // Chuẩn hóa avatar_url nếu là Media Object
    if (user.avatar_url && typeof user.avatar_url === 'object') {
      user.avatar_url = user.avatar_url.url?.startsWith('http')
        ? user.avatar_url.url
        : `${STRAPI_URL}${user.avatar_url.url}`
    }

    return NextResponse.json(user)
  } catch {
    return NextResponse.json(null, { status: 200 })
  }
}
