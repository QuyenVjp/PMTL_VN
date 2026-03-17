// ─────────────────────────────────────────────────────────────
//  app/api/guestbook/list/route.ts
//  GET — danh sách lưu bút đã duyệt
// ─────────────────────────────────────────────────────────────
import { connection, NextRequest } from 'next/server'
import { normalizeGuestbookList } from '@/lib/api/guestbook'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function GET(request: NextRequest) {
  await connection()
  const token = process.env.PAYLOAD_API_TOKEN
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '1'
  const pageSize = searchParams.get('pageSize') ?? '20'

  try {
    const res = await fetch(
      `${CMS_API_URL}/api/guestbook?page=${page}&pageSize=${pageSize}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: 'no-store',
      }
    )

    const data = await res.json()
    return Response.json(normalizeGuestbookList(data, Number(page), Number(pageSize)), { status: res.status })
  } catch {
    return Response.json(normalizeGuestbookList(null, Number(page), Number(pageSize)), { status: 200 })
  }
}
