// ─────────────────────────────────────────────────────────────
//  POST /api/auth/google-callback
//  Trao đổi authorization code lấy JWT CMS → set httpOnly cookie
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { logger } from '@/lib/logger'
import { invalidateAuthSessionCache } from '@/features/auth/api/session'
import { setAuthCookie } from '@/features/auth/utils/auth-cookie'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(req: NextRequest) {
  try {
    const { access_token, id_token } = await req.json()
    let jwt: string | undefined
    let user: Record<string, any> | undefined

    if (!access_token && !id_token) {
      return NextResponse.json({ error: 'Thiếu token Google callback' }, { status: 400 })
    }

    if (access_token) {
      // Exchange provider access token to CMS JWT + user
      const res = await fetch(`${CMS_API_URL}/api/auth/google/callback?access_token=${access_token}`)
      const data = await parseResponseBody(res) as Record<string, any>
      if (!res.ok || !data.jwt) {
        return NextResponse.json(
          { error: normalizeApiErrorMessage(data, res.status, 'Xác thực Google thất bại hoặc token không hợp lệ') },
          { status: 401 }
        )
      }
      jwt = data.jwt as string
      user = data.user as Record<string, any>
    } else if (id_token) {
      // Fallback only when CMS returned JWT directly as id_token.
      jwt = id_token
      const meRes = await fetch(`${CMS_API_URL}/api/users/me?populate=*`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      const meData = await parseResponseBody(meRes) as Record<string, any>
      if (!meRes.ok) {
        return NextResponse.json(
          { error: normalizeApiErrorMessage(meData, meRes.status, 'Không lấy được thông tin người dùng') },
          { status: 401 }
        )
      }
      user = meData
    }

    if (user?.avatar_url && typeof user.avatar_url === 'object') {
      user.avatar_url = user.avatar_url.url?.startsWith('http')
        ? user.avatar_url.url
        : `${CMS_API_URL}${user.avatar_url.url}`
    }

    const response = NextResponse.json({ user })
    await invalidateAuthSessionCache(jwt)
    setAuthCookie(response, jwt!)

    return response
  } catch (err) {
    logger.error('[Google Callback] Error', { error: err })
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi xác thực Google' },
      { status: 500 }
    )
  }
}
