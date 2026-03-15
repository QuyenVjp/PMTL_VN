import { NextResponse } from 'next/server'
import { normalizeApiErrorMessage } from '@/lib/http-error'

interface ForgotPasswordRequestBody {
  email: string
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
    const body: ForgotPasswordRequestBody = await req.json()
    const strapiUrl = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

    const res = await fetch(`${strapiUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        {
          error: normalizeApiErrorMessage(
            data as StrapiErrorResponse,
            res.status,
            'Không thể gửi email đặt lại mật khẩu',
          ),
        },
        { status: res.status },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
