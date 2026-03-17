import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { communityCommentSubmitSchema } from '@pmtl/shared'

import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from '@/features/auth/utils/auth-cookie'
import { logger } from '@/lib/logger'
import { CORRELATION_ID_HEADER } from '@/lib/security/request-context'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ error: 'Bạn cần đăng nhập để bình luận.' }, { status: 401 })
  }

  try {
    const rawBody: unknown = await req.json()
    const parsedBody = communityCommentSubmitSchema.safeParse(rawBody)

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: 'Dữ liệu bình luận không hợp lệ.',
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      )
    }

    const res = await fetch(`${CMS_API_URL}/api/community/posts/${parsedBody.data.postDocumentId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        [CORRELATION_ID_HEADER]: req.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID(),
      },
      body: JSON.stringify({
        content: parsedBody.data.content,
        ...(parsedBody.data.parentDocumentId ? { parentPublicId: parsedBody.data.parentDocumentId } : {}),
      }),
    });

    const data: unknown = await parseResponseBody(res)

    if (!res.ok) {
      return NextResponse.json(
        {
          error: normalizeApiErrorMessage(data, res.status, 'Gửi bình luận thất bại'),
          details: data,
        },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    logger.error('Community comment submit proxy crashed', { error })
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
