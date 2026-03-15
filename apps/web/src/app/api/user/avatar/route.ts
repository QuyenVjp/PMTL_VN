// ─────────────────────────────────────────────────────────────
//  POST /api/user/avatar — Proxy upload avatar
//  Đọc JWT từ httpOnly cookie, forward multipart đến Strapi /upload
// ─────────────────────────────────────────────────────────────
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { logger } from '@/lib/logger'

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
      logger.warn('Avatar upload failed', {
        status: res.status,
        hasApiToken: Boolean(process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN),
        response: data,
      })

      return NextResponse.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Upload thất bại') },
        { status: res.status }
      )
    }

    const uploaded = (() => {
      if (data && typeof data === 'object' && 'doc' in data) {
        const record = data as { doc?: unknown }
        return record.doc
      }

      return Array.isArray(data) ? data[0] : data
    })()

    if (!uploaded || typeof uploaded !== 'object') {
      return NextResponse.json({ error: 'Phản hồi upload không hợp lệ' }, { status: 500 })
    }

    const media = uploaded as { id?: string | number; url?: string | null }
    const mediaUrl = media.url

    if (!media.id || typeof mediaUrl !== 'string' || mediaUrl.length === 0) {
      logger.error('Avatar upload returned incomplete media payload', {
        payload: uploaded,
      })
      return NextResponse.json({ error: 'Phản hồi upload không hợp lệ' }, { status: 500 })
    }

    return NextResponse.json({
      id: media.id,
      url: mediaUrl.startsWith('http') ? mediaUrl : `${CMS_API_URL}${mediaUrl}`,
    })
  } catch (error) {
    logger.error('Avatar upload crashed', {
      error,
      path: req.nextUrl.pathname,
    })

    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
