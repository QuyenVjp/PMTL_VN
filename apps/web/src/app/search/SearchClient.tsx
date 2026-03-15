'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, Loader2, Mic, MicOff, Search as SearchIconLucide, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { searchPostsAndCategories } from '@/app/actions/search'
import { SearchIcon, ArrowRightIcon } from '@/components/icons/ZenIcons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { BlogReaderPostList, BlogReaderState, BlogReaderSummary, BlogTag, Category, StrapiList } from '@/types/strapi'
import { PAGINATION, getPaginationRange } from '@/lib/config/pagination'
import type { SearchHit } from '@/lib/search/types'
import { getEntityStableKey } from '@/lib/entity-identity'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import { cn } from '@/lib/utils'
import {
  getSearchDateFrom,
  getSearchStateKey,
  parseSearchPageParams,
  serializeSearchPageParams,
  type SearchLibraryFilter,
  type SearchPageState,
  type SearchSortOption,
} from '@/lib/search/search-params'
import { loadRecentSearches, saveRecentSearch } from '@/lib/search/recent-searches'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionLike
    webkitSpeechRecognition: new () => SpeechRecognitionLike
  }
}

interface SpeechRecognitionLike {
  start: () => void
  stop: () => void
  onstart?: () => void
  onresult?: (event: SpeechRecognitionEventLike) => void
  onerror?: (event: { error: string }) => void
  onend?: () => void
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

interface SearchClientProps {
  initialCategories: Category[]
  initialTags: BlogTag[]
  initialState: SearchPageState
  initialResults: StrapiList<SearchHit>
}

const TIME_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Trong tuần', value: 'week' },
  { label: 'Trong tháng', value: 'month' },
] as const

const SORT_OPTIONS: Array<{ label: string; value: SearchSortOption }> = [
  { label: 'Liên quan nhất', value: 'relevance' },
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Xem nhiều', value: 'most-viewed' },
]

const LIBRARY_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đã đọc', value: 'read' },
  { label: 'Yêu thích', value: 'favorite' },
  { label: 'Chưa đọc', value: 'unread' },
] as const

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

function trackSearchEvent(event: 'search_performed' | 'search_no_results', payload: Record<string, unknown>) {
  if (typeof window === 'undefined') return

  import('posthog-js')
    .then(({ default: posthog }) => {
      if (posthog.__loaded) {
        posthog.capture(event, payload)
      }
    })
    .catch(() => {})
}

function getRecentLabel(value?: string | null): string | null {
  if (!value) return null

  const delta = Date.now() - new Date(value).getTime()
  if (delta <= 24 * 60 * 60 * 1000) return 'Hôm nay'
  if (delta <= 7 * 24 * 60 * 60 * 1000) return 'Tuần này'
  return null
}

function SearchPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const range = getPaginationRange(currentPage, totalPages)

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onPageChange(currentPage - 1)
            }}
            className={cn('gap-1 px-3', currentPage <= 1 && 'pointer-events-none opacity-50')}
          >
            <ChevronLeft className="size-4" />
            Trước
          </PaginationLink>
        </PaginationItem>
        {range.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === currentPage}
                onClick={(event) => {
                  event.preventDefault()
                  onPageChange(item)
                }}
                className={cn(item === currentPage && 'border-gold/40 bg-gold/10 text-gold hover:bg-gold/10 hover:text-gold')}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(event) => {
              event.preventDefault()
              onPageChange(currentPage + 1)
            }}
            className={cn('gap-1 px-3', currentPage >= totalPages && 'pointer-events-none opacity-50')}
          >
            Sau
            <ChevronRight className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function ResultCard({
  post,
  index,
  isRead,
  isFavorite,
  readerState,
  onRead,
  onToggleFavorite,
}: {
  post: SearchHit
  index: number
  isRead: boolean
  isFavorite: boolean
  readerState?: BlogReaderState
  onRead: (post: SearchHit) => void
  onToggleFavorite: (post: SearchHit) => void
}) {
  const thumbUrl = getStrapiMediaUrl(post.thumbnail?.url)
  const highlightedTitle = post._formatted?.title || post.title
  const highlightedExcerpt = post._formatted?.excerpt || post._formatted?.content || post.excerpt || ''
  const readRecentLabel = getRecentLabel(readerState?.lastReadAt)
  const favoriteRecentLabel = getRecentLabel(readerState?.favoritedAt)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.28 }}
    >
      <Card className="rounded-2xl border-border/50 transition-all duration-200 hover:border-gold/40 hover:shadow-md hover:shadow-gold/5">
        <CardContent className="flex gap-4 pt-6">
          <Link href={`/blog/${post.slug}`} onClick={() => onRead(post)} className="group flex min-w-0 flex-1 gap-4">
            {thumbUrl && (
              <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-secondary/40 sm:h-24 sm:w-28">
                <Image
                  src={thumbUrl}
                  alt={post.thumbnail?.alternativeText || post.title}
                  width={112}
                  height={96}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {isRead && <Badge variant="secondary">Đã đọc</Badge>}
                {isFavorite && <Badge variant="sacred">Yêu thích</Badge>}
                {readRecentLabel && <Badge variant="outline">{readRecentLabel}</Badge>}
                {!readRecentLabel && favoriteRecentLabel && <Badge variant="outline">{favoriteRecentLabel}</Badge>}
                {post.featured && <Badge variant="sacred">Nổi bật</Badge>}
                <Badge variant="outline" className="rounded-md">
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
                </Badge>
                <span className="ml-auto text-[11px] text-muted-foreground">{post.views.toLocaleString('vi-VN')} lượt xem</span>
              </div>
              <h2
                className={cn(
                  'mb-2 line-clamp-2 font-display text-base transition-colors group-hover:text-gold',
                  isRead ? 'text-foreground/72' : 'text-foreground'
                )}
                dangerouslySetInnerHTML={{ __html: highlightedTitle }}
              />
              {highlightedExcerpt && (
                <p
                  className={cn('line-clamp-2 text-sm leading-relaxed', isRead ? 'text-muted-foreground/80' : 'text-muted-foreground')}
                  dangerouslySetInnerHTML={{ __html: highlightedExcerpt }}
                />
              )}
              <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gold/75 transition-colors group-hover:text-gold">
                Xem chi tiết <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
          <Button
            type="button"
            variant={isFavorite ? 'sacred' : 'ghost'}
            size="icon"
            className="shrink-0 rounded-full self-start"
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
            onClick={() => onToggleFavorite(post)}
          >
            <Heart className={cn('size-4', isFavorite && 'fill-current')} />
          </Button>
        </CardContent>
      </Card>
    </motion.article>
  )
}

export default function SearchClient({
  initialCategories,
  initialTags,
  initialState,
  initialResults,
}: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const firstRender = useRef(true)
  const pendingUrlKeyRef = useRef<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const [query, setQuery] = useState(initialState.q)
  const [activeCategory, setActiveCategory] = useState<string | null>(initialState.cat)
  const [activeTags, setActiveTags] = useState<string[]>(initialState.tags)
  const [activeTime, setActiveTime] = useState(initialState.time)
  const [sort, setSort] = useState<SearchSortOption>(initialState.sort)
  const [activeLibrary, setActiveLibrary] = useState<SearchLibraryFilter>(initialState.library)
  const [currentPage, setCurrentPage] = useState(initialState.page)
  const [showFilters, setShowFilters] = useState(false)
  const [resultsState, setResultsState] = useState(initialResults)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [readPosts, setReadPosts] = useState<string[]>([])
  const [favoritePosts, setFavoritePosts] = useState<string[]>([])
  const [stateMap, setStateMap] = useState<Record<string, BlogReaderState>>({})
  const [readerSummary, setReaderSummary] = useState<BlogReaderSummary | null>(null)

  const debouncedQuery = useDebounce(query, 350)
  const currentUrlState = parseSearchPageParams(searchParams)
  const requestState: SearchPageState = {
    q: debouncedQuery.trim(),
    cat: activeCategory,
    tags: activeTags,
    time: activeTime,
    sort,
    library: activeLibrary,
    page: currentPage,
  }
  const requestStateKey = getSearchStateKey(requestState)
  const currentUrlKey = getSearchStateKey(currentUrlState)
  const initialStateKey = getSearchStateKey(initialState)

  useEffect(() => {
    setRecentSearches(loadRecentSearches())
  }, [])

  useEffect(() => {
    if (!user) {
      setReaderSummary(null)
      return
    }

    let ignore = false

    async function loadSummary() {
      try {
        const res = await fetch('/api/blog-reader-states/summary', { cache: 'no-store' })
        if (!res.ok) return
        const payload = (await res.json()) as { data?: BlogReaderSummary }
        if (!ignore && payload.data) {
          setReaderSummary(payload.data)
        }
      } catch {}
    }

    loadSummary()

    return () => {
      ignore = true
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setStateMap({})
      setFavoritePosts([])
      setReadPosts([])
      return
    }

    const documentIds = resultsState.data.map((item) => item.documentId).filter(Boolean)
    if (documentIds.length === 0) {
      setStateMap({})
      return
    }

    let ignore = false

    async function loadStates() {
      try {
        const params = new URLSearchParams({ documentIds: documentIds.join(',') })
        const res = await fetch(`/api/blog-reader-states?${params.toString()}`, { cache: 'no-store' })
        if (!res.ok) return

        const data = (await res.json()) as BlogReaderState[]
        if (ignore || !Array.isArray(data)) return

        const nextMap = data.reduce<Record<string, BlogReaderState>>((accumulator, entry) => {
          const documentId = entry.post?.documentId?.trim()
          if (!documentId) return accumulator

          const stableKey = getEntityStableKey(entry.post)
          accumulator[documentId] = entry
          if (stableKey) accumulator[stableKey] = entry
          return accumulator
        }, {})

        const distinctStates = Object.values(
          Object.fromEntries(
            Object.values(nextMap)
              .filter((entry) => entry.post?.documentId)
              .map((entry) => [entry.post!.documentId, entry])
          )
        )

        setStateMap(nextMap)
        setReadPosts(distinctStates.filter((entry) => entry.lastReadAt).map((entry) => getEntityStableKey(entry.post)).filter(Boolean))
        setFavoritePosts(distinctStates.filter((entry) => entry.isFavorite).map((entry) => getEntityStableKey(entry.post)).filter(Boolean))
      } catch {}
    }

    loadStates()

    return () => {
      ignore = true
    }
  }, [user, resultsState.data])

  useEffect(() => {
    const nextState = parseSearchPageParams(searchParams)
    const nextStateKey = getSearchStateKey(nextState)

    if (pendingUrlKeyRef.current === nextStateKey) {
      pendingUrlKeyRef.current = null
      return
    }

    setQuery(nextState.q)
    setActiveCategory(nextState.cat)
    setActiveTags(nextState.tags)
    setActiveTime(nextState.time)
    setSort(nextState.sort)
    setActiveLibrary(nextState.library)
    setCurrentPage(nextState.page)
  }, [searchParams])

  useEffect(() => {
    const nextUrl = serializeSearchPageParams(requestState)
    const currentUrl = serializeSearchPageParams(currentUrlState)
    if (nextUrl !== currentUrl) {
      pendingUrlKeyRef.current = requestStateKey
      router.replace(`/search${nextUrl ? `?${nextUrl}` : ''}`, { scroll: false })
    }
  }, [currentUrlKey, requestStateKey, router])

  useEffect(() => {
    if (activeLibrary !== 'all' && authLoading) return

    if (firstRender.current && requestStateKey === initialStateKey) {
      firstRender.current = false
      return
    }

    firstRender.current = false
    let ignore = false

    async function run() {
      setIsLoading(true)

      try {
        let nextResults: StrapiList<SearchHit>

        if (requestState.library !== 'all') {
          if (!user) {
            nextResults = {
              data: [],
              meta: {
                pagination: {
                  page: requestState.page,
                  pageSize: PAGINATION.SEARCH_PAGE_SIZE,
                  pageCount: 0,
                  total: 0,
                },
              },
            }
          } else {
            const params = new URLSearchParams()
            if (requestState.q) params.set('q', requestState.q)
            if (requestState.cat) params.set('cat', requestState.cat)
            if (requestState.tags.length > 0) params.set('tags', requestState.tags.join(','))
            if (requestState.time !== 'all') params.set('time', requestState.time)
            if (requestState.sort !== 'relevance') params.set('sort', requestState.sort)
            params.set('library', requestState.library)
            params.set('page', String(requestState.page))
            params.set('pageSize', String(PAGINATION.SEARCH_PAGE_SIZE))

            const res = await fetch(`/api/blog-reader-states/posts?${params.toString()}`, { cache: 'no-store' })
            if (!res.ok) {
              throw new Error(`Reader state search failed: ${res.status}`)
            }
            const response = (await res.json()) as BlogReaderPostList
            setReaderSummary(response.meta.counts)
            const nextStateMap = Object.entries(response.meta.states ?? {}).reduce<Record<string, BlogReaderState>>((accumulator, [documentId, state]) => {
              if (!state) return accumulator
              const post = response.data.find((item) => item.documentId === documentId) ?? null
              const stableKey = getEntityStableKey(post)

              const readerState = {
                id: 0,
                documentId: state.documentId,
                isFavorite: state.isFavorite,
                isPinned: state.isPinned,
                firstReadAt: state.firstReadAt,
                lastReadAt: state.lastReadAt,
                favoritedAt: state.favoritedAt,
                pinnedAt: state.pinnedAt,
                readCount: state.readCount,
                updatedAt: state.lastReadAt ?? state.favoritedAt ?? '',
                post,
              } as BlogReaderState

              accumulator[documentId] = readerState
              if (stableKey) accumulator[stableKey] = readerState
              return accumulator
            }, {})
            setStateMap(nextStateMap)
            nextResults = response as unknown as StrapiList<SearchHit>
          }
        } else {
          const response = await searchPostsAndCategories({
            search: requestState.q || undefined,
            categorySlug: requestState.cat || undefined,
            tagSlugs: requestState.tags.length > 0 ? requestState.tags : undefined,
            dateFrom: getSearchDateFrom(requestState.time),
            page: requestState.page,
            pageSize: PAGINATION.SEARCH_PAGE_SIZE,
            sort: requestState.sort,
          })
          nextResults = response as StrapiList<SearchHit>
        }

        if (ignore) return

        setResultsState(nextResults)

        const resultCount = nextResults.meta.pagination.total
        const payload = {
          query: requestState.q,
          result_count: resultCount,
          category: requestState.cat,
          tags: requestState.tags,
          time: requestState.time,
          sort: requestState.sort,
          library: requestState.library,
          page: requestState.page,
        }

        trackSearchEvent('search_performed', payload)

        if (requestState.q) {
          setRecentSearches(saveRecentSearch(requestState.q))
        }

        if (requestState.q && resultCount === 0) {
          trackSearchEvent('search_no_results', payload)
        }
      } catch (error) {
        if (!ignore) {
          console.error('Search failed:', error)
          toast.error('Không thể tải kết quả tìm kiếm. Vui lòng thử lại.')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    run()

    return () => {
      ignore = true
    }
  }, [activeLibrary, authLoading, initialStateKey, requestStateKey, user])

  const results = resultsState.data
  const totalResults = resultsState.meta.pagination.total
  const totalPages = resultsState.meta.pagination.pageCount
  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    activeTags.length +
    (activeTime !== 'all' ? 1 : 0) +
    (sort !== 'relevance' ? 1 : 0) +
    (activeLibrary !== 'all' ? 1 : 0)
  const hasIdleSuggestions = !query.trim() && activeTags.length === 0 && !activeCategory && activeLibrary === 'all'
  const activeFilterSummary = useMemo(
    () => [
      activeCategory
        ? initialCategories.find((category) => category.slug === activeCategory)?.name ?? activeCategory
        : null,
      ...activeTags
        .map((slug) => initialTags.find((tag) => tag.slug === slug)?.name ?? slug)
        .slice(0, 3),
      activeTime !== 'all' ? TIME_FILTERS.find((item) => item.value === activeTime)?.label ?? activeTime : null,
      activeLibrary !== 'all' ? LIBRARY_FILTERS.find((item) => item.value === activeLibrary)?.label ?? activeLibrary : null,
      sort !== 'relevance' ? SORT_OPTIONS.find((item) => item.value === sort)?.label ?? sort : null,
    ].filter(Boolean) as string[],
    [activeCategory, activeLibrary, activeTags, activeTime, initialCategories, initialTags, sort]
  )

  function resetPage() {
    setCurrentPage(1)
  }

  function clearAll() {
    setQuery('')
    setActiveCategory(null)
    setActiveTags([])
    setActiveTime('all')
    setSort('relevance')
    setActiveLibrary('all')
    setCurrentPage(1)
    setShowFilters(false)
  }

  function toggleTag(slug: string) {
    setActiveTags((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug])
    resetPage()
  }

  function handleVoiceSearch() {
    const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionApi) {
      toast.error('Trình duyệt của bạn không hỗ trợ tìm kiếm bằng giọng nói.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SpeechRecognitionApi()
    recognitionRef.current = recognition
    recognition.lang = 'vi-VN'
    recognition.interimResults = true
    recognition.continuous = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join('')
      setQuery(transcript)
      resetPage()
    }
    recognition.onerror = () => {
      setIsListening(false)
      toast.error('Không thể nhận giọng nói. Vui lòng thử lại.')
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  function markPostAsRead(post: SearchHit) {
    const readKey = getEntityStableKey(post)
    if (!readKey) return

    setReadPosts((current) => (current.includes(readKey) ? current : [readKey, ...current].slice(0, 120)))
    setReaderSummary((current) =>
      current && !readPosts.includes(readKey)
        ? {
            ...current,
            totalRead: current.totalRead + 1,
            recentReadToday: current.recentReadToday + 1,
            recentReadWeek: current.recentReadWeek + 1,
          }
        : current
    )
    setStateMap((current) => ({
      ...current,
      [readKey]: {
        ...(current[readKey] ?? {
          id: 0,
          documentId: '',
          isFavorite: favoritePosts.includes(readKey),
          isPinned: false,
          firstReadAt: null,
          lastReadAt: null,
          favoritedAt: null,
          pinnedAt: null,
          readCount: 0,
          updatedAt: '',
          post,
        }),
        post,
        lastReadAt: new Date().toISOString(),
      },
    }))

    if (!user) return

    if (!post.documentId) return

    fetch('/api/blog-reader-states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogPostDocumentId: post.documentId, markRead: true }),
    }).catch(() => {})
  }

  async function toggleFavorite(post: SearchHit) {
    if (!user) {
      toast.error('Vui lòng đăng nhập để lưu bài yêu thích.')
      return
    }

    const postKey = getEntityStableKey(post)
    if (!postKey) return

    const nextFavorite = !favoritePosts.includes(postKey)

    setFavoritePosts((current) =>
      nextFavorite ? [postKey, ...current.filter((item) => item !== postKey)] : current.filter((item) => item !== postKey)
    )
    setReaderSummary((current) =>
      current
        ? {
            ...current,
            totalFavorite: Math.max(0, current.totalFavorite + (nextFavorite ? 1 : -1)),
            recentFavoriteToday: Math.max(0, current.recentFavoriteToday + (nextFavorite ? 1 : -1)),
            recentFavoriteWeek: Math.max(0, current.recentFavoriteWeek + (nextFavorite ? 1 : -1)),
          }
        : current
    )
    setStateMap((current) => ({
      ...current,
      [postKey]: {
        ...(current[postKey] ?? {
          id: 0,
          documentId: '',
          isFavorite: false,
          isPinned: false,
          firstReadAt: null,
          lastReadAt: null,
          favoritedAt: null,
          pinnedAt: null,
          readCount: 0,
          updatedAt: '',
          post,
        }),
        post,
        isFavorite: nextFavorite,
        favoritedAt: nextFavorite ? new Date().toISOString() : null,
      },
    }))

    if (!post.documentId) return

    const res = await fetch('/api/blog-reader-states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogPostDocumentId: post.documentId, isFavorite: nextFavorite }),
    })

    if (!res.ok) {
      setFavoritePosts((current) =>
        nextFavorite ? current.filter((item) => item !== postKey) : [postKey, ...current.filter((item) => item !== postKey)]
      )
      toast.error('Không thể cập nhật danh sách yêu thích.')
      return
    }

    toast.success(nextFavorite ? 'Đã lưu vào yêu thích.' : 'Đã bỏ khỏi yêu thích.')
  }

  const filterPanel = (
    <div className="flex h-full flex-col gap-5">
      <Card className="rounded-xl border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Thư viện cá nhân</CardTitle>
          <CardDescription>Lọc theo bài anh đã đọc hoặc đã lưu yêu thích.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {LIBRARY_FILTERS.map((libraryFilter) => (
              <Button
                key={libraryFilter.value}
                type="button"
                variant={activeLibrary === libraryFilter.value ? 'outlineGlow' : 'outline'}
                size="sm"
                onClick={() => {
                  if (libraryFilter.value !== 'all' && !user) {
                    toast.error('Vui lòng đăng nhập để dùng bộ lọc thư viện cá nhân.')
                    return
                  }
                  setActiveLibrary(libraryFilter.value)
                  resetPage()
                }}
                className="rounded-md"
              >
                {libraryFilter.label}
                {readerSummary && libraryFilter.value === 'read' ? ` (${readerSummary.totalRead})` : ''}
                {readerSummary && libraryFilter.value === 'favorite' ? ` (${readerSummary.totalFavorite})` : ''}
              </Button>
            ))}
          </div>
          {!user && (
            <p className="text-xs leading-5 text-muted-foreground">
              Đăng nhập để đồng bộ bài đã đọc và yêu thích giữa tìm kiếm, chi tiết bài viết và hồ sơ cá nhân.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Danh mục chủ đề</CardTitle>
              <CardDescription>Thu hẹp theo nhóm nội dung chính.</CardDescription>
            </div>
            {activeCategory && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setActiveCategory(null)}>
                Bỏ chọn
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {initialCategories.map((category) => (
            <Button
              key={category.slug}
              type="button"
              variant={activeCategory === category.slug ? 'sacred' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveCategory(activeCategory === category.slug ? null : category.slug)
                resetPage()
              }}
              className="rounded-md"
            >
              {category.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">Thẻ chủ đề</CardTitle>
              <CardDescription>Chọn nhiều thẻ để gom đúng tinh thần câu hỏi.</CardDescription>
            </div>
            {activeTags.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setActiveTags([])}>
                Xóa thẻ
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="max-h-56 pr-3">
            <div className="flex flex-wrap gap-2">
              {initialTags.slice(0, 36).map((tag) => (
                <Button
                  key={tag.slug}
                  type="button"
                  variant={activeTags.includes(tag.slug) ? 'outlineGlow' : 'outline'}
                  size="sm"
                  onClick={() => toggleTag(tag.slug)}
                  className="rounded-md"
                >
                  #{tag.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-border/60 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Thời gian đăng tải</CardTitle>
          <CardDescription>Lọc theo độ mới của bài viết.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {TIME_FILTERS.map((timeFilter) => (
            <Button
              key={timeFilter.value}
              type="button"
              variant={activeTime === timeFilter.value ? 'outlineGlow' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTime(timeFilter.value)
                resetPage()
              }}
              className="rounded-md"
            >
              {timeFilter.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <main className="flex-1 py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-6 max-w-5xl">
          <Card className="rounded-2xl border-border/60 bg-card/90 shadow-ant">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="group relative flex-1">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-gold" />
                  <Input
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value)
                      resetPage()
                    }}
                    placeholder="Nhập từ khóa như: buông xả, gia đình, niệm Phật..."
                    className="h-14 rounded-xl border-border/60 bg-background/60 pl-12 pr-24 text-base shadow-none"
                  />
                  {query && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setQuery('')
                        resetPage()
                      }}
                      className="absolute right-14 top-1/2 size-8 -translate-y-1/2 rounded-full"
                      aria-label="Xóa từ khóa"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant={isListening ? 'destructive' : 'ghost'}
                    size="icon"
                    onClick={handleVoiceSearch}
                    className="absolute right-3 top-1/2 size-9 -translate-y-1/2 rounded-full"
                    aria-label={isListening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
                  >
                    {isListening ? <MicOff className="size-4" /> : <Mic className="size-4.5" />}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant={showFilters || activeFilterCount > 0 ? 'outlineGlow' : 'outline'}
                  size="pill"
                  onClick={() => setShowFilters(true)}
                  className="relative rounded-xl md:min-w-32"
                >
                  <SlidersHorizontal className="size-4" />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-md px-3 py-1 text-xs">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" />
                      Đang cập nhật kết quả
                    </span>
                  ) : (
                    `Tìm thấy ${totalResults.toLocaleString('vi-VN')} kết quả`
                  )}
                </Badge>
                {totalPages > 1 && (
                  <Badge variant="outline" className="rounded-md px-3 py-1 text-xs">
                    Trang {currentPage}/{totalPages}
                  </Badge>
                )}
                {activeFilterSummary.slice(0, 4).map((label) => (
                  <Badge key={label} variant="secondary" className="rounded-md px-3 py-1 text-xs">
                    {label}
                  </Badge>
                ))}
                {readerSummary && readerSummary.totalRead > 0 && (
                  <Badge variant="secondary" className="rounded-md px-3 py-1 text-xs">
                    Đã đọc {readerSummary.totalRead} bài
                  </Badge>
                )}
                {readerSummary && readerSummary.totalFavorite > 0 && (
                  <Badge variant="secondary" className="rounded-md px-3 py-1 text-xs">
                    Yêu thích {readerSummary.totalFavorite} bài
                  </Badge>
                )}
                {readerSummary && readerSummary.recentReadToday > 0 && (
                  <Badge variant="outline" className="rounded-md px-3 py-1 text-xs">
                    Đọc hôm nay {readerSummary.recentReadToday}
                  </Badge>
                )}
                {readerSummary && readerSummary.recentFavoriteWeek > 0 && (
                  <Badge variant="outline" className="rounded-md px-3 py-1 text-xs">
                    Yêu thích tuần này {readerSummary.recentFavoriteWeek}
                  </Badge>
                )}
              </div>

              {isListening && <p className="text-sm text-red-500">Đang lắng nghe giọng nói và cập nhật vào ô tìm kiếm.</p>}
            </CardContent>
          </Card>
        </motion.div>

        <Sheet open={showFilters} onOpenChange={setShowFilters}>
          <SheetContent side="right" className="w-full sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
              <SheetDescription>Kết hợp danh mục, thẻ và thời gian để giảm nhiễu kết quả.</SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex items-center justify-between">
              <Badge variant="outline" className="rounded-md px-3 py-1 text-xs">
                {activeFilterCount} bộ lọc đang bật
              </Badge>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Xóa tất cả
              </Button>
            </div>
            <Separator className="my-5" />
            <ScrollArea className="h-[calc(100vh-12rem)] pr-3">
              {filterPanel}
            </ScrollArea>
          </SheetContent>
        </Sheet>

        <div className="mx-auto max-w-5xl">
          <section className="min-w-0 space-y-4">
            <Card className="rounded-2xl border-border/60 shadow-none">
              <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="w-full sm:w-[220px]">
                    <Select
                      value={sort}
                      onValueChange={(value: SearchSortOption) => {
                        setSort(value)
                        resetPage()
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-background/80">
                        <SelectValue placeholder="Sắp xếp" />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                      </Select>
                  </div>
                  {activeFilterSummary.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activeFilterSummary.map((label) => (
                        <Badge key={label} variant="outline" className="rounded-md px-3 py-1 text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                {(query.trim() || activeFilterCount > 0) && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="self-start lg:self-auto">
                    Xóa trạng thái tìm kiếm
                  </Button>
                )}
              </CardContent>
            </Card>

            {hasIdleSuggestions && (
              <Card className="rounded-2xl border-border/60 shadow-none">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Gợi ý bắt đầu</CardTitle>
                  <CardDescription>Chọn nhanh từ tìm kiếm gần đây hoặc một chủ đề phổ biến.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {recentSearches.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Tìm gần đây</p>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((item) => (
                          <Button
                            key={item}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setQuery(item)
                              resetPage()
                            }}
                            className="rounded-md"
                          >
                            {item}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Gợi ý nhanh</p>
                    <div className="flex flex-wrap gap-2">
                      {initialTags.slice(0, 12).map((tag) => (
                        <Button
                          key={tag.slug}
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setQuery(tag.name)
                            setActiveTags([tag.slug])
                            resetPage()
                          }}
                          className="rounded-md"
                        >
                          #{tag.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="relative space-y-3">
              {isLoading && results.length > 0 && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
                  <Badge variant="whisper" className="rounded-full px-3 py-1 text-xs">
                    <Loader2 className="mr-1 size-3.5 animate-spin" />
                    Đang cập nhật...
                  </Badge>
                </div>
              )}

              {isLoading && results.length === 0 && (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <Card key={item} className="rounded-2xl border-border/40 shadow-none">
                      <CardContent className="flex gap-4 pt-6">
                        <div className="size-20 animate-pulse rounded-xl bg-secondary sm:h-24 sm:w-28" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/4 animate-pulse rounded bg-secondary" />
                          <div className="h-5 w-3/4 animate-pulse rounded bg-secondary" />
                          <div className="h-3 w-full animate-pulse rounded bg-secondary" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!isLoading && results.length === 0 && (
                <Card className="rounded-2xl border-dashed border-border/60 shadow-none">
                  <CardContent className="px-4 py-16 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/50">
                      <SearchIconLucide className="size-6 text-muted-foreground/60" />
                    </div>
                    <h2 className="mb-2 text-lg font-medium text-foreground">
                      {activeLibrary !== 'all' && !user ? 'Đăng nhập để dùng thư viện cá nhân' : 'Không tìm thấy bài viết nào'}
                    </h2>
                    <p className="mx-auto mb-8 max-w-sm text-sm text-muted-foreground">
                      {activeLibrary !== 'all' && !user
                        ? 'Bộ lọc Đã đọc và Yêu thích được đồng bộ theo tài khoản, nên cần đăng nhập trước khi dùng.'
                        : 'Hãy thử đổi từ khóa, bỏ bớt bộ lọc hoặc chọn một chủ đề gợi ý bên dưới.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {initialTags.slice(0, 8).map((tag) => (
                        <Button
                          key={tag.slug}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setQuery(tag.name)
                            setActiveTags([tag.slug])
                            resetPage()
                          }}
                          className="rounded-md"
                        >
                          #{tag.name}
                        </Button>
                      ))}
                    </div>
                    <Button type="button" variant="outlineGlow" onClick={clearAll} className="mt-8 rounded-xl">
                      Xóa tất cả bộ lọc
                    </Button>
                  </CardContent>
                </Card>
              )}

              {results.length > 0 && (
                <div className={cn('space-y-3 transition-opacity', isLoading && 'opacity-50')}>
                  {results.map((result, index) => {
                    const stableKey = getEntityStableKey(result) || result.documentId
                    return (
                      <ResultCard
                        key={stableKey}
                        post={result}
                        index={index}
                        readerState={stateMap[stableKey]}
                        isRead={Boolean(stateMap[stableKey]?.lastReadAt) || readPosts.includes(stableKey)}
                        isFavorite={Boolean(stateMap[stableKey]?.isFavorite) || favoritePosts.includes(stableKey)}
                        onRead={markPostAsRead}
                        onToggleFavorite={toggleFavorite}
                      />
                    )
                  })}
                </div>
              )}
            </div>

            {!isLoading && (
              <SearchPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  setCurrentPage(page)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
