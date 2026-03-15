// ─────────────────────────────────────────────────────────────
//  app/api/blog-posts/route.ts — Blog-posts proxy endpoint
//  Allows client-side code to fetch blog posts without exposing Strapi directly
// ─────────────────────────────────────────────────────────────

import { buildStrapiUrl } from '@/lib/strapi'
import type { StrapiList, BlogPost } from '@/types/strapi'

export async function GET(request: Request) {
  try {
    const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'API token not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const categorySlug = searchParams.get('categorySlug') || undefined
    const search = searchParams.get('search') || undefined

    const filters: Record<string, unknown> = {}
    
    if (categorySlug) {
      filters['categories'] = { slug: { $eq: categorySlug } }
    }
    
    if (search) {
      filters['$or'] = [
        { title: { $containsi: search } },
        { content: { $containsi: search } },
      ]
    }

    const url = buildStrapiUrl('/blog-posts', {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      populate: ['thumbnail', 'gallery', 'categories', 'tags'],
      sort: ['publishedAt:desc'],
      pagination: { page, pageSize },
    })

    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // ISR: cache 10 phút, Next.js sẽ revalidate ngầm
      next: { revalidate: 600, tags: ['blog-posts'] },
    })

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch blog posts', status: res.status }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json() as Record<string, unknown>
    let normalized: StrapiList<BlogPost>

    if (Array.isArray(data['results']) && !Array.isArray(data['data'])) {
      normalized = {
        data: data['results'] as BlogPost[],
        meta: {
          pagination: (data['pagination'] as StrapiList<BlogPost>['meta']['pagination']) ?? { page: 1, pageSize: 0, pageCount: 0, total: 0 }
        }
      }
    } else if (Array.isArray(data['data'])) {
      normalized = data as unknown as StrapiList<BlogPost>
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
    console.error('[BlogPosts] Lỗi server:', errMsg)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
