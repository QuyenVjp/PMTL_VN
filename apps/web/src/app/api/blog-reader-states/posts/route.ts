import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { STRAPI_URL } from '@/lib/strapi'

export const dynamic = 'force-dynamic'

async function getUserJwt(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value ?? null
}

function proxyJsonOrEmpty(res: Response, data: unknown) {
  if (res.status === 204) return new NextResponse(null, { status: 204 })
  return NextResponse.json(data, { status: res.status })
}

export async function GET(req: NextRequest) {
  const jwt = await getUserJwt()
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const qs = req.nextUrl.searchParams.toString()
  const url = `${STRAPI_URL}/api/blog-reader-states/my/posts${qs ? `?${qs}` : ''}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({}))
    return proxyJsonOrEmpty(res, data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
