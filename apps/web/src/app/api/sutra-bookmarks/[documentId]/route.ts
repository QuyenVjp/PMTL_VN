import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { STRAPI_URL } from '@/lib/strapi'

export const dynamic = 'force-dynamic'

async function getUserJwt(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('auth_token')?.value ?? null
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const jwt = await getUserJwt()
  if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { documentId } = await params
  if (!documentId) return NextResponse.json({ error: 'Thiếu documentId' }, { status: 400 })

  try {
    const res = await fetch(`${STRAPI_URL}/api/sutra-bookmarks/my/${documentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    })
    if (res.status === 204) return new NextResponse(null, { status: 204 })
    const data = await res.json().catch(() => ({}))
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

