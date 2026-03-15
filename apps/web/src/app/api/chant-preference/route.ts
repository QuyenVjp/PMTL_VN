import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { CMS_API_URL } from '@/lib/cms'

async function getUserJwt(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value ?? null
}

function proxyJsonOrEmpty(res: Response, data: unknown) {
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  return NextResponse.json(data, { status: res.status })
}

export async function GET(req: NextRequest) {
  const jwt = await getUserJwt()
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const qs = req.nextUrl.searchParams.toString()
    const res = await fetch(`${CMS_API_URL}/api/chant-preferences/my${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })

    const contentType = res.headers.get('content-type')
    const data = contentType?.includes('application/json') ? await res.json() : { error: await res.text() }
    return proxyJsonOrEmpty(res, data)
  } catch (err) {
    console.error('[api/chant-preference GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const jwt = await getUserJwt()
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const res = await fetch(`${CMS_API_URL}/api/chant-preferences/my`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(body),
    })

    const contentType = res.headers.get('content-type')
    const data = contentType?.includes('application/json') ? await res.json() : { error: await res.text() }
    return proxyJsonOrEmpty(res, data)
  } catch (err) {
    console.error('[api/chant-preference PUT]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
