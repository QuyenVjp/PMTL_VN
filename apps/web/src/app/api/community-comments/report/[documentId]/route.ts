import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)

  try {
    const body = await req.json()
    const res = await fetch(`${CMS_API_URL}/api/community-comments/report/${documentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await parseResponseBody(res)
    if (!res.ok) {
      return NextResponse.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Không thể báo cáo bình luận'), details: data },
        { status: res.status }
      )
    }
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
