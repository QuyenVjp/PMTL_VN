import { buildStrapiUrl } from '@/lib/strapi'
import type { CategoryTree } from '@/types/strapi'

interface CategoryTreeResponse {
  data: CategoryTree[]
  meta: {
    totalRoots: number
  }
}

export async function GET() {
  try {
    const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN)
    if (!token) {
      return new Response(JSON.stringify({ error: 'API token not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const url = buildStrapiUrl('/categories/tree')
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 600 },
    })

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch category tree', status: res.status }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json() as CategoryTreeResponse
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errMsg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
