import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { CMS_API_URL } from '@/lib/cms'

async function getUserJwt(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value ?? null
}

export async function GET() {
  const jwt = await getUserJwt()
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const res = await fetch(`${CMS_API_URL}/api/blog-reader-states/my/summary`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
