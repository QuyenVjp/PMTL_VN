'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, History, Loader2, Pin, PinOff } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import type { BlogReaderPostList, BlogReaderState, BlogReaderSummary, BlogPost } from '@/types/strapi'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import { cn } from '@/lib/utils'

type LibraryTab = 'favorite' | 'read'
type LibrarySort = 'recent-read' | 'recent-favorite' | 'most-viewed'

function getRecentLabel(value?: string | null): string | null {
  if (!value) return null

  const delta = Date.now() - new Date(value).getTime()
  if (delta <= 24 * 60 * 60 * 1000) return 'Hôm nay'
  if (delta <= 7 * 24 * 60 * 60 * 1000) return 'Tuần này'
  return null
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}

function BlogLibraryList({
  posts,
  stateMap,
  tab,
  onToggleFavorite,
  onTogglePin,
}: {
  posts: BlogPost[]
  stateMap: Record<string, BlogReaderState>
  tab: LibraryTab
  onToggleFavorite: (post: BlogPost) => void
  onTogglePin: (post: BlogPost, nextPinned: boolean) => void
}) {
  if (posts.length === 0) {
    return tab === 'favorite' ? (
      <EmptyState
        title="Chưa có bài yêu thích"
        description="Khi anh lưu một bài từ trang chi tiết hoặc trang tìm kiếm, bài đó sẽ xuất hiện ở đây."
      />
    ) : (
      <EmptyState
        title="Chưa có lịch sử đọc"
        description="Khi anh mở bài viết, lịch sử sẽ được đồng bộ để quay lại đọc tiếp nhanh hơn."
      />
    )
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => {
        const thumbUrl = getStrapiMediaUrl(post.thumbnail?.formats?.thumbnail?.url ?? post.thumbnail?.url)
        const readerState = stateMap[post.documentId]
        const readRecentLabel = getRecentLabel(readerState?.lastReadAt)
        const favoriteRecentLabel = getRecentLabel(readerState?.favoritedAt)

        return (
          <div
            key={post.documentId}
            className={cn(
              'rounded-xl border border-border/60 bg-card/70 p-4 transition-colors',
              readerState?.isPinned && 'border-gold/35'
            )}
          >
            <div className="flex gap-4">
              <Link href={`/blog/${post.slug}`} className="flex min-w-0 flex-1 gap-4">
                {thumbUrl ? (
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                    <Image
                      src={thumbUrl}
                      alt={post.thumbnail?.alternativeText ?? post.title}
                      width={96}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {readerState?.isPinned && <Badge variant="sacred">Ghim</Badge>}
                    {post.featured && <Badge variant="sacred">Nổi bật</Badge>}
                    {readerState?.isFavorite && <Badge variant="outline">Yêu thích</Badge>}
                    {readRecentLabel && <Badge variant="outline">{readRecentLabel}</Badge>}
                    {!readRecentLabel && favoriteRecentLabel && <Badge variant="outline">{favoriteRecentLabel}</Badge>}
                    <Badge variant="outline" className="rounded-md">
                      {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('vi-VN')}
                    </Badge>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-medium leading-6 text-foreground">{post.title}</h3>
                  {post.excerpt && <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>}
                </div>
              </Link>

              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  type="button"
                  variant={readerState?.isFavorite ? 'sacred' : 'outline'}
                  size="icon"
                  className="rounded-full"
                  onClick={() => onToggleFavorite(post)}
                >
                  <Heart className={cn('size-4', readerState?.isFavorite && 'fill-current')} />
                </Button>
                {tab === 'favorite' && (
                  <Button
                    type="button"
                    variant={readerState?.isPinned ? 'sacred' : 'outline'}
                    size="icon"
                    className="rounded-full"
                    onClick={() => onTogglePin(post, !readerState?.isPinned)}
                  >
                    {readerState?.isPinned ? <Pin className="size-4 fill-current" /> : <PinOff className="size-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function BlogLibraryPanel() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('favorite')
  const [favorites, setFavorites] = useState<BlogPost[]>([])
  const [reads, setReads] = useState<BlogPost[]>([])
  const [favoriteStateMap, setFavoriteStateMap] = useState<Record<string, BlogReaderState>>({})
  const [readStateMap, setReadStateMap] = useState<Record<string, BlogReaderState>>({})
  const [favoriteSort, setFavoriteSort] = useState<LibrarySort>('recent-favorite')
  const [readSort, setReadSort] = useState<LibrarySort>('recent-read')
  const [summary, setSummary] = useState<BlogReaderSummary | null>(null)
  const [loading, setLoading] = useState(true)

  const loadLibrary = useCallback(async () => {
    setLoading(true)
    try {
      const [favoriteRes, readRes, summaryRes] = await Promise.all([
        fetch(`/api/blog-reader-states/posts?library=favorite&librarySort=${favoriteSort}&page=1&pageSize=24`, { cache: 'no-store' }),
        fetch(`/api/blog-reader-states/posts?library=read&librarySort=${readSort}&page=1&pageSize=24`, { cache: 'no-store' }),
        fetch('/api/blog-reader-states/summary', { cache: 'no-store' }),
      ])

      const favoriteData = favoriteRes.ok ? ((await favoriteRes.json()) as BlogReaderPostList) : null
      const readData = readRes.ok ? ((await readRes.json()) as BlogReaderPostList) : null
      const summaryData = summaryRes.ok ? ((await summaryRes.json()) as { data?: BlogReaderSummary }) : null

      setFavorites(favoriteData?.data ?? [])
      setReads(readData?.data ?? [])
      setFavoriteStateMap(
        Object.fromEntries(
          Object.entries(favoriteData?.meta.states ?? {}).flatMap(([documentId, state]) =>
            state
              ? [[
                  documentId,
                  {
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
                    post: favoriteData?.data.find((item) => item.documentId === documentId) ?? null,
                  } as BlogReaderState,
                ]]
              : []
          )
        )
      )
      setReadStateMap(
        Object.fromEntries(
          Object.entries(readData?.meta.states ?? {}).flatMap(([documentId, state]) =>
            state
              ? [[
                  documentId,
                  {
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
                    post: readData?.data.find((item) => item.documentId === documentId) ?? null,
                  } as BlogReaderState,
                ]]
              : []
          )
        )
      )
      setSummary(summaryData?.data ?? null)
    } finally {
      setLoading(false)
    }
  }, [favoriteSort, readSort])

  useEffect(() => {
    loadLibrary()
  }, [loadLibrary])

  async function updateState(post: BlogPost, body: Record<string, unknown>, successMessage: string) {
    const res = await fetch('/api/blog-reader-states', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blogPostDocumentId: post.documentId, ...body }),
    })

    if (!res.ok) {
      toast.error('Không thể cập nhật thư viện bài viết.')
      return
    }

    toast.success(successMessage)
    await loadLibrary()
  }

  return (
    <Card className="surface-panel">
      <CardHeader>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl">Thư viện bài viết</CardTitle>
            <CardDescription>Xem lại bài đã đọc, bài yêu thích và quản lý nhóm bài quan trọng.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary && (
              <>
                <Badge variant="outline">Đã đọc ({summary.totalRead})</Badge>
                <Badge variant="outline">Yêu thích ({summary.totalFavorite})</Badge>
                {summary.totalPinned > 0 && <Badge variant="sacred">Đã ghim {summary.totalPinned}</Badge>}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tải thư viện bài viết...
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LibraryTab)} className="w-full">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <TabsList className="grid w-full grid-cols-2 lg:w-[320px]">
                <TabsTrigger value="favorite" className="gap-2">
                  <Heart className="size-4" />
                  Yêu thích ({summary?.totalFavorite ?? 0})
                </TabsTrigger>
                <TabsTrigger value="read" className="gap-2">
                  <History className="size-4" />
                  Đã đọc ({summary?.totalRead ?? 0})
                </TabsTrigger>
              </TabsList>

              <div className="w-full lg:w-[240px]">
                <Select value={activeTab === 'favorite' ? favoriteSort : readSort} onValueChange={(value: LibrarySort) => {
                  if (activeTab === 'favorite') setFavoriteSort(value)
                  else setReadSort(value)
                }}>
                  <SelectTrigger className="rounded-xl bg-background/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTab === 'favorite' ? (
                      <>
                        <SelectItem value="recent-favorite">Yêu thích mới lưu</SelectItem>
                        <SelectItem value="most-viewed">Xem nhiều</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="recent-read">Đọc gần nhất</SelectItem>
                        <SelectItem value="most-viewed">Xem nhiều</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {summary && summary.recentReadToday > 0 && <Badge variant="outline">Đọc hôm nay {summary.recentReadToday}</Badge>}
              {summary && summary.recentReadWeek > 0 && <Badge variant="outline">Đọc tuần này {summary.recentReadWeek}</Badge>}
              {summary && summary.recentFavoriteToday > 0 && <Badge variant="outline">Yêu thích hôm nay {summary.recentFavoriteToday}</Badge>}
              {summary && summary.recentFavoriteWeek > 0 && <Badge variant="outline">Yêu thích tuần này {summary.recentFavoriteWeek}</Badge>}
            </div>

            <TabsContent value="favorite" className="mt-4">
              <ScrollArea className="max-h-[36rem] pr-2">
                <BlogLibraryList
                  posts={favorites}
                  stateMap={favoriteStateMap}
                  tab="favorite"
                  onToggleFavorite={(post) => updateState(post, { isFavorite: false }, 'Đã bỏ khỏi yêu thích.')}
                  onTogglePin={(post, nextPinned) => updateState(post, { isPinned: nextPinned }, nextPinned ? 'Đã ghim bài yêu thích.' : 'Đã bỏ ghim.')}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="read" className="mt-4">
              <ScrollArea className="max-h-[36rem] pr-2">
                <BlogLibraryList
                  posts={reads}
                  stateMap={readStateMap}
                  tab="read"
                  onToggleFavorite={(post) => updateState(post, { isFavorite: !readStateMap[post.documentId]?.isFavorite }, readStateMap[post.documentId]?.isFavorite ? 'Đã bỏ khỏi yêu thích.' : 'Đã lưu vào yêu thích.')}
                  onTogglePin={() => {}}
                />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <Separator className="my-5" />

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/search?library=favorite">Tìm trong bài yêu thích</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/search?library=read">Lọc bài đã đọc</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/search?library=unread">Lọc bài chưa đọc</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
