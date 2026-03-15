// ─────────────────────────────────────────────────────────────
//  POST /api/push/subscribe — Lưu push subscription vào Strapi DB
//  DELETE /api/push/subscribe — Xóa push subscription
//
//  Dữ liệu lưu trong Strapi collection push-subscription.
//  Không dùng file system — an toàn khi server restart.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const STRAPI_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')
const STRAPI_TOKEN = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN) || ''

async function strapiReq(path: string, options: RequestInit = {}) {
  return fetch(`${STRAPI_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
      ...(options.headers || {}),
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, notificationTypes, userId } = await req.json()

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Dữ liệu subscription không hợp lệ' }, { status: 400 })
    }

    const jwt = (await cookies()).get('auth_token')?.value

    const res = await strapiReq('/push-subscriptions/upsert', {
      method: 'POST',
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        timezone: 'Asia/Ho_Chi_Minh',
        notificationTypes: Array.isArray(notificationTypes) ? notificationTypes : ['community'],
        userId: typeof userId === 'number' ? userId : undefined,
        isActive: true,
      }),
    })

    if (!res.ok) {
      const err = await parseResponseBody(res)
      return NextResponse.json(
        { error: normalizeApiErrorMessage(err, res.status, 'Không thể đăng ký thông báo') },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'Thiếu endpoint' }, { status: 400 })

    const res = await strapiReq('/push-subscriptions/by-endpoint', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    })

    if (!res.ok) {
      const err = await parseResponseBody(res)
      return NextResponse.json(
        { error: normalizeApiErrorMessage(err, res.status, 'Không thể hủy thông báo') },
        { status: res.status }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
