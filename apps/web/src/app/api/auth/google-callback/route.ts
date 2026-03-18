import { NextRequest, NextResponse } from 'next/server'
import { getCurrentSessionFromCMS } from '@/features/auth/api/cms-auth-client'
import { setAuthCookie } from '@/features/auth/utils/auth-cookie'
import { toAuthErrorResponse } from '@/features/auth/api/route-error-response'
import { WebAuthError } from '@/features/auth/utils/auth-error'

export async function POST(req: NextRequest) {
  try {
    const { id_token } = await req.json()

    if (!id_token || typeof id_token !== 'string') {
      return NextResponse.json({ error: 'Thiếu token Google callback' }, { status: 400 })
    }

    await getCurrentSessionFromCMS(id_token)

    const response = NextResponse.json({ success: true })
    setAuthCookie(response, id_token)

    return response
  } catch (error) {
    if (error instanceof Error && error.message.includes('Token session bi thieu')) {
      return NextResponse.json({ error: 'Thiếu token Google callback' }, { status: 400 })
    }

    if (error instanceof WebAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    return toAuthErrorResponse(error)
  }
}
