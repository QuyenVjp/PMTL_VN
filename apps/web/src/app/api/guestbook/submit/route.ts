// ─────────────────────────────────────────────────────────────
//  app/api/guestbook/submit/route.ts
//  POST — gửi lưu bút mới
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'

import { guestbookSubmitSchema } from '@pmtl/shared'

import { logger } from '@/lib/logger'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { CORRELATION_ID_HEADER } from '@/lib/security/request-context'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(request: NextRequest) {
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch (error) {
    logger.warn('Guestbook submit rejected due to invalid JSON body', { error })
    return Response.json({ error: 'Request body không hợp lệ.' }, { status: 400 })
  }

  const parsedBody = guestbookSubmitSchema.safeParse(rawBody)
  if (!parsedBody.success) {
    return Response.json(
      {
        error: 'Dữ liệu lưu bút không hợp lệ.',
        details: parsedBody.error.flatten(),
      },
      { status: 400 },
    )
  }

  const forwardedFor =
    request.headers.get('x-forwarded-for') ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'

  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'X-Forwarded-For': forwardedFor,
      [CORRELATION_ID_HEADER]: request.headers.get(CORRELATION_ID_HEADER) ?? crypto.randomUUID(),
    })

    if (process.env.PAYLOAD_API_TOKEN) {
      headers.set('Authorization', `Bearer ${process.env.PAYLOAD_API_TOKEN}`)
    }

    const res = await fetch(`${CMS_API_URL}/api/guestbook/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(parsedBody.data),
    })

    const data: unknown = await parseResponseBody(res)
    if (!res.ok) {
      return Response.json(
        {
          error: normalizeApiErrorMessage(data, res.status, 'Gửi lưu bút thất bại'),
          details: data,
        },
        { status: res.status },
      )
    }

    return Response.json(data, { status: res.status })
  } catch (error) {
    logger.error('Guestbook submit proxy crashed', { error })
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
