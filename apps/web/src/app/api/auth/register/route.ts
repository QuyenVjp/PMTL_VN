// ─────────────────────────────────────────────────────────────
//  POST /api/auth/register — Đăng ký với Strapi
// ─────────────────────────────────────────────────────────────
import { NextResponse } from 'next/server'
import { normalizeApiErrorMessage } from '@/lib/http-error'

interface RegisterRequestBody {
  username: string
  email: string
  password: string
}

interface StrapiAuthResponse {
  jwt: string
  user: {
    id: number
    username: string
    email: string
    confirmed: boolean
  }
}

interface StrapiErrorResponse {
  error: {
    status: number
    name: string
    message: string
  }
}

export async function POST(req: Request) {
  try {
    const body: RegisterRequestBody = await req.json()

    const strapiUrl = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')
    const res = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: body.username,
        email: body.email,
        password: body.password,
      }),
    })

    const data: StrapiAuthResponse | StrapiErrorResponse = await res.json()

    if (!res.ok) {
      const error = data as StrapiErrorResponse
      return NextResponse.json({ error: normalizeApiErrorMessage(error, res.status, 'Đăng ký thất bại') }, { status: res.status })
    }

    const auth = data as StrapiAuthResponse
    const response = NextResponse.json({
      success: true,
      user: auth.user,
    })
    response.cookies.set('auth_token', auth.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
