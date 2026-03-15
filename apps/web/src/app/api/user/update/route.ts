// ─────────────────────────────────────────────────────────────
//  PUT /api/user/update — Proxy cập nhật thông tin user
//  Đọc JWT từ httpOnly cookie, forward đến CMS /users/me
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { logger } from '@/lib/logger'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

type LegacyProfileUpdateBody = {
  fullName?: string | null
  displayName?: string | null
  bio?: string | null
  phone?: string | null
  dharmaName?: string | null
  avatar?: string | number | null
  avatar_url?: string | number | null
  address?: string | null
}

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = (await req.json()) as LegacyProfileUpdateBody
    const payload = {
      ...(body.fullName !== undefined || body.displayName !== undefined
        ? { fullName: body.fullName ?? body.displayName ?? null }
        : {}),
      ...(body.bio !== undefined ? { bio: body.bio ?? '' } : {}),
      ...(body.phone !== undefined ? { phone: body.phone } : {}),
      ...(body.dharmaName !== undefined ? { dharmaName: body.dharmaName } : {}),
      ...(body.avatar !== undefined || body.avatar_url !== undefined
        ? { avatar: body.avatar ?? body.avatar_url ?? null }
        : {}),
    }

    const res = await fetch(`${CMS_API_URL}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await parseResponseBody(res)

    if (!res.ok) {
      logger.warn('Legacy profile update failed', {
        status: res.status,
        bodyKeys: Object.keys(body),
        hasAddress: body.address !== undefined,
        response: data,
      })

      return NextResponse.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Cập nhật thất bại') },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Legacy profile update crashed', {
      error,
      path: req.nextUrl.pathname,
    })

    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
