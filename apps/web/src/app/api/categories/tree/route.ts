import { connection } from 'next/server'
import { getCategoryTree } from '@/lib/api/categories'
import { logger } from '@/lib/logger'
import type { CategoryTree } from '@/types/cms'

interface CategoryTreeResponse {
  data: CategoryTree[]
  meta: {
    totalRoots: number
  }
}

export async function GET() {
  await connection()

  try {
    const tree = await getCategoryTree()
    const data = {
      data: tree,
      meta: {
        totalRoots: tree.length,
      },
    } as CategoryTreeResponse

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    logger.error('Category tree API failed', { error })
    return new Response(
      JSON.stringify({ data: [], meta: { totalRoots: 0 }, error: 'Internal server error', message: errMsg }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
