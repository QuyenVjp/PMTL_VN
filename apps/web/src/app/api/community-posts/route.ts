import { NextRequest, NextResponse } from 'next/server'

type CommunityPostListResponse = {
  data: Array<Record<string, unknown>>
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function buildEmptyListResponse(request: NextRequest): CommunityPostListResponse {
  const search = request.nextUrl.searchParams
  const page = toPositiveInt(search.get('pagination[page]') ?? search.get('page'), 1)
  const pageSize = toPositiveInt(search.get('pagination[pageSize]') ?? search.get('pageSize'), 20)

  return {
    data: [],
    meta: {
      pagination: {
        page,
        pageSize,
        pageCount: 0,
        total: 0,
      },
    },
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(buildEmptyListResponse(request), {
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
