// ─────────────────────────────────────────────────────────────
//  app/api/guestbook/archive/[year]/[month]/route.ts
//  GET — lưu bút theo tháng/năm
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ year: string; month: string }> }
) {
  const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
  if (!token) {
    return Response.json({ error: 'Cấu hình token bị thiếu.' }, { status: 500 })
  }

  const { year, month } = await params
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page') ?? '1'
  const pageSize = searchParams.get('pageSize') ?? '20'

  try {
    const res = await fetch(
      `${CMS_API_URL}/api/guestbook-entries/archive/${year}/${month}?page=${page}&pageSize=${pageSize}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    )

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
