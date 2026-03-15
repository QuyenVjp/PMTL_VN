// ─────────────────────────────────────────────────────────────
//  app/api/hub/[slug]/route.ts
//  GET — lấy hub page theo slug
// ─────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server'
import { getHubBySlug } from '@/lib/api/hub'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  try {
    const hub = await getHubBySlug(slug)
    if (!hub) {
      return Response.json({ error: 'Không tìm thấy hub page.' }, { status: 404 })
    }
    return Response.json(hub, { status: 200 })
  } catch {
    return Response.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
