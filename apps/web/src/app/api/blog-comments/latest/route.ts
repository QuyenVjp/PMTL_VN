// app/api/blog-comments/latest/route.ts — Latest comments proxy
import { NextRequest, NextResponse } from 'next/server'

const STRAPI = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get('limit') ?? '5'

  try {
    const res = await fetch(
      `${STRAPI}/api/blog-comments/latest?limit=${encodeURIComponent(limit)}`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ data: [] }, { status: 200 })
  }
}
