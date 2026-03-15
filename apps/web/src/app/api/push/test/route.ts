import { NextRequest, NextResponse } from 'next/server'
import { fetchPushSubscriptionsPage, fetchSubscriptionByEndpoint } from '@/lib/push-server'

async function loadWebPush() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('web-push')
  } catch {
    throw new Error('Thiếu package web-push.')
  }
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    }
  }

  return {
    message: typeof error === 'string' ? error : JSON.stringify(error),
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.PUSH_SEND_SECRET
  const authHeader = req.headers.get('Authorization')

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL || 'admin@phapmontamlinh.vn'

  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: 'VAPID keys chưa cấu hình' }, { status: 500 })
  }

  try {
    const {
      endpoint,
      title = 'Direct push test',
      body = 'Nếu anh thấy thông báo này thì direct test đang hoạt động.',
      url = '/niem-kinh',
      tag = 'direct-push-test',
    } = await req.json().catch(() => ({}))

    const target = endpoint
      ? await fetchSubscriptionByEndpoint(endpoint)
      : (await fetchPushSubscriptionsPage(0, 20)).data.find((item) => item.isActive !== false) ?? null

    if (!target) {
      return NextResponse.json({ error: 'Không tìm thấy subscription để test' }, { status: 404 })
    }

    const webpush = await loadWebPush()
    webpush.setVapidDetails(`mailto:${vapidEmail}`, vapidPublic, vapidPrivate)

    const payload = JSON.stringify({ title, body, url, tag })

    await webpush.sendNotification(
      {
        endpoint: target.endpoint,
        keys: {
          p256dh: target.p256dh,
          auth: target.auth,
        },
      },
      payload
    )

    return NextResponse.json({
      success: true,
      endpoint: target.endpoint,
      documentId: target.documentId,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Direct push test failed',
        details: getErrorDetails(error),
      },
      { status: 500 }
    )
  }
}
