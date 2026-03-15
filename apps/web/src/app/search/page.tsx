import type { Metadata } from 'next'
import type { StrapiList } from '@/types/strapi'
import { getCategories, getAllTags } from '@/lib/api/blog'
import { searchPostsAndCategories } from '@/app/actions/search'
import { getSearchDateFrom, hasActiveSearchFilters, parseSearchPageParams } from '@/lib/search/search-params'
import type { SearchHit } from '@/lib/search/types'
import SearchClient from './SearchClient'

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = parseSearchPageParams(await searchParams)
  const hasFilters = hasActiveSearchFilters(params)
  const queryLabel = params.q ? `: ${params.q}` : ''

  return {
    title: hasFilters ? `Tìm kiếm${queryLabel} | Pháp Môn Tâm Linh` : 'Tìm Kiếm Khai Thị | Pháp Môn Tâm Linh',
    description: hasFilters
      ? `Kết quả tìm kiếm cho "${params.q || 'bộ lọc đã chọn'}" trong kho tàng Khai Thị.`
      : 'Tra cứu nhanh hàng ngàn bài giảng của Sư Phụ Lu Junhong trong kho tàng Khai Thị.',
    openGraph: {
      title: hasFilters ? `Kết quả tìm kiếm${queryLabel}` : 'Kho Tàng Khai Thị — Tìm Kiếm Bài Giảng',
      description: 'Tìm thấy câu trả lời bạn cần trong hàng ngàn bài giảng Phật pháp.',
      type: 'website',
    },
    alternates: {
      canonical: '/search',
    },
    robots: hasFilters ? { index: false, follow: true } : undefined,
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const initialState = parseSearchPageParams(await searchParams)

  const initialResultsPromise =
    initialState.library === 'all'
      ? searchPostsAndCategories({
          search: initialState.q || undefined,
          categorySlug: initialState.cat || undefined,
          tagSlugs: initialState.tags.length > 0 ? initialState.tags : undefined,
          dateFrom: getSearchDateFrom(initialState.time),
          page: initialState.page,
          pageSize: 10,
          sort: initialState.sort,
        })
      : Promise.resolve({
          data: [],
          meta: {
            pagination: {
              page: initialState.page,
              pageSize: 10,
              pageCount: 0,
              total: 0,
            },
          },
        })

  const [categories, tags, initialResults] = await Promise.all([
    getCategories().catch(() => []),
    getAllTags().catch(() => []),
    initialResultsPromise,
  ])

  return (
    <SearchClient
      initialCategories={categories}
      initialTags={tags}
      initialState={initialState}
      initialResults={initialResults as StrapiList<SearchHit>}
    />
  )
}
