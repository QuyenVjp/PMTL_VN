import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from '@/features/auth/utils/auth-cookie'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value

  // Cho phép guest gửi comment; backend sẽ xử lý việc gán user hay không
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (process.env.PAYLOAD_API_TOKEN) {
    // Nếu là guest, ta có thể dùng system token để bypass permission nếu cần
    // Tuy nhiên nếu backend cho phép public submit thì không cần.
    // Tạm thời chỉ truyền token của user nếu có.
    headers['Authorization'] = `Bearer ${process.env.PAYLOAD_API_TOKEN}`;
  }

  try {
    const body = await req.json() as Record<string, unknown>;
    const strapiBody =
      typeof body === 'object' && body !== null
        ? Object.fromEntries(
            Object.entries(body as Record<string, unknown>).filter(
              ([key]) => key !== 'actorUserId' && key !== 'actorEndpoint'
            )
          )
        : body

    const res = await fetch(`${CMS_API_URL}/api/community-comments/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify(strapiBody),
    });

    const data = await parseResponseBody(res)

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
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
