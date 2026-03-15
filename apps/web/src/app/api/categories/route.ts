// ─────────────────────────────────────────────────────────────
//  app/api/categories/route.ts — Authenticated categories proxy
//  Allows client-side code to fetch categories securely
// ─────────────────────────────────────────────────────────────

import { buildStrapiUrl } from '@/lib/strapi'
import type { StrapiList, Category } from '@/types/strapi'

export async function GET() {
  try {
    const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const url = buildStrapiUrl('/categories', {
      populate: ['parent', 'children'],
      sort: ['order:asc', 'name:asc'],
      pagination: { page: 1, pageSize: 1000 },
    })

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // ISR: cache 10 phút, Next.js sẽ revalidate ngầm
      next: { revalidate: 600 },
    })

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch categories', status: res.status }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json() as Record<string, unknown>
    let normalized: StrapiList<Category>

    if (Array.isArray(data['results']) && !Array.isArray(data['data'])) {
      normalized = {
        data: data['results'] as Category[],
        meta: {
          pagination: (data['pagination'] as StrapiList<Category>['meta']['pagination']) ?? { page: 1, pageSize: 0, pageCount: 0, total: 0 }
        }
      }
    } else if (Array.isArray(data['data'])) {
      normalized = data as unknown as StrapiList<Category>
    } else {
      normalized = {
        data: [],
        meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } }
      }
    }

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache 10 phút trên CDN, stale-while-revalidate 1 tiếng
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('[DanhMuc] Lỗi server:', errMsg)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
