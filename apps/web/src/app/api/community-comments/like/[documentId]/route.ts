import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { normalizeApiErrorMessage, parseResponseBody } from '@/lib/http-error'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

// URL format: /api/community-comments/like/[documentId]
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value || (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${CMS_API_URL}/api/community-comments/like/${documentId}`, {
      method: 'POST',
      headers,
    });

    const data = await parseResponseBody(res)

    if (!res.ok) {
      return NextResponse.json(
        { error: normalizeApiErrorMessage(data, res.status, 'Không thể thích bình luận') },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
