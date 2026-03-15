'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  Camera,
  Grid2X2,
  LayoutGrid,
  MapPin,
  Search,
  Sparkles,
} from 'lucide-react'

import type { GalleryCardItem } from '@/lib/api/gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import ImageLightbox from '@/components/media/ImageLightbox'
import { cn } from '@/lib/utils'

type SortMode = 'newest' | 'oldest' | 'featured' | 'az'
type ViewMode = 'grid' | 'editorial'
const ALL_OPTION = 'Tất cả'
const UNKNOWN_YEAR = 'Khác'

function formatDate(date: string | null) {
  if (!date) return 'Chưa cập nhật'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getYear(date: string | null) {
  if (!date) return UNKNOWN_YEAR
  return String(new Date(date).getFullYear())
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <Card className="surface-panel-muted rounded-xl">
      <CardContent className="p-4">
        <p className="ant-label text-gold/80">{label}</p>
        <p className="ant-title mt-3 text-2xl text-foreground md:text-3xl">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  )
}

function GalleryCard({
  item,
  priority = false,
  editorial = false,
  onOpen,
}: {
  item: GalleryCardItem
  priority?: boolean
  editorial?: boolean
  onOpen: (item: GalleryCardItem) => void
}) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      onClick={() => onOpen(item)}
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl border border-border/70 bg-card text-left shadow-ant transition-all hover:border-gold/30 hover:shadow-gold',
        editorial ? 'sm:col-span-2 xl:col-span-2' : ''
      )}
    >
      <div className={cn('relative overflow-hidden', editorial ? 'aspect-[16/10]' : 'aspect-[4/5]')}>
        <Image
          src={item.imageUrl}
          alt={item.imageAlt}
          fill
          priority={priority}
          sizes={editorial ? '(max-width: 1280px) 100vw, 66vw' : '(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw'}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <Badge variant="whisper" className="absolute left-4 top-4 border-gold/25 bg-black/25 text-gold">
          {item.category}
        </Badge>
        {item.featured ? (
          <Badge variant="sacred" className="absolute right-4 top-4 gap-1 border-gold/20 bg-gold/15 text-gold">
            <Sparkles className="size-3.5" />
            Nổi bật
          </Badge>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
          <div className="flex items-center gap-2 text-[11px] text-white/70">
            <span>{formatDate(item.shotDate)}</span>
            {item.album ? (
              <>
                <span className="text-white/35">•</span>
                <span className="truncate">{item.album}</span>
              </>
            ) : null}
          </div>
          <h3 className="ant-title mt-2 text-xl leading-tight text-white md:text-2xl">{item.title}</h3>
          <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/72">
            {item.quote || item.description || 'Nhấn để xem chi tiết ảnh và thông tin tư liệu.'}
          </p>
        </div>
      </div>
    </motion.button>
  )
}

export default function GalleryClient({ initialItems }: { initialItems: GalleryCardItem[] }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL_OPTION)
  const [year, setYear] = useState(ALL_OPTION)
  const [sortMode, setSortMode] = useState<SortMode>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const categories = useMemo(() => {
    return [ALL_OPTION, ...Array.from(new Set(initialItems.map((item) => item.category))).sort()]
  }, [initialItems])

  const years = useMemo(() => {
    return [ALL_OPTION, ...Array.from(new Set(initialItems.map((item) => getYear(item.shotDate)))).sort().reverse()]
  }, [initialItems])

  const collections = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of initialItems) {
      if (!item.album) continue
      map.set(item.album, (map.get(item.album) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [initialItems])

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const items = initialItems.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery) ||
        item.quote?.toLowerCase().includes(normalizedQuery) ||
        item.location?.toLowerCase().includes(normalizedQuery) ||
        item.album?.toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

      const matchesCategory = category === ALL_OPTION || item.category === category
      const matchesYear = year === ALL_OPTION || getYear(item.shotDate) === year

      return matchesQuery && matchesCategory && matchesYear
    })

    return items.toSorted((a, b) => {
      if (sortMode === 'az') return a.title.localeCompare(b.title, 'vi')
      if (sortMode === 'featured') {
        return Number(b.featured) - Number(a.featured) || (b.shotDate || '').localeCompare(a.shotDate || '')
      }

      const aDate = a.shotDate || ''
      const bDate = b.shotDate || ''
      return sortMode === 'oldest' ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate)
    })
  }, [category, initialItems, query, sortMode, year])

  const heroItem = filteredItems.find((item) => item.featured) || filteredItems[0] || null
  const spotlightItems = filteredItems.filter((item) => item.documentId !== heroItem?.documentId).slice(0, 3)
  const selectedIndex = selectedId ? filteredItems.findIndex((item) => item.documentId === selectedId) : -1
  const lightboxOpen = selectedIndex >= 0

  useEffect(() => {
    if (typeof window === 'undefined' || !initialItems.length) return

    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const matched = initialItems.find((item) => item.slug === hash || item.documentId === hash)
    if (matched) {
      setSelectedId(matched.documentId)
    }
  }, [initialItems])

  useEffect(() => {
    if (selectedId && selectedIndex === -1) {
      setSelectedId(null)
    }
  }, [selectedId, selectedIndex])

  const featuredCount = initialItems.filter((item) => item.featured).length
  const locationCount = new Set(initialItems.map((item) => item.location).filter(Boolean)).size
  const latestYear = years.find((item) => item !== ALL_OPTION) || '2024'
  const lightboxItems = useMemo(
    () =>
      filteredItems.map((item) => ({
        id: item.documentId,
        src: item.imageUrl,
        alt: item.imageAlt,
        title: item.title,
        description: item.quote || item.description,
        category: item.category,
        shotDate: item.shotDate,
        location: item.location,
        device: item.device,
        photographer: item.photographer,
        tags: item.tags,
        downloadUrl: item.imageUrl,
      })),
    [filteredItems],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!lightboxOpen) return
    const active = filteredItems[selectedIndex]
    if (!active) return
    window.history.replaceState(null, '', `/gallery#${active.slug || active.documentId}`)
  }, [filteredItems, selectedIndex, lightboxOpen])

  const closeLightbox = () => {
    setSelectedId(null)
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/gallery')
    }
  }

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="route-hero"
      >
        <p className="route-kicker mb-3 rounded-full border border-gold/10 bg-gold/5 px-4 py-1">Kho Lưu Trữ Hình Ảnh</p>
        <h1 className="route-title mb-4 md:text-5xl">Thư Viện Ảnh</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Lưu giữ những khoảnh khắc trang nghiêm của các buổi pháp hội, những đóa sen thuần khiết và vẻ đẹp kiến trúc tại các đạo tràng Pháp Môn Tâm Linh.
        </p>
      </motion.div>

      {heroItem ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.85fr)]">
          <button
            type="button"
            onClick={() => setSelectedId(heroItem.documentId)}
            className="group relative overflow-hidden rounded-xl border border-gold/15 bg-black text-left shadow-elevated"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={heroItem.imageUrl}
                alt={heroItem.imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-end p-6 md:p-10">
                <div className="max-w-2xl">
                  <p className="ant-label text-gold/90">Chi tiết ảnh</p>
                  <h2 className="ant-title mt-4 text-3xl leading-tight text-white md:text-5xl">{heroItem.title}</h2>
                  <p className="mt-4 max-w-xl text-base italic leading-8 text-white/72">
                    {heroItem.quote || heroItem.description}
                  </p>
                </div>
                <div className="mt-8 grid gap-3 text-sm text-white/70 sm:grid-cols-3">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-gold" />
                    {formatDate(heroItem.shotDate)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-gold" />
                    {heroItem.location || 'Đang cập nhật địa điểm'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Camera className="size-4 text-gold" />
                    {heroItem.device || 'Thiết bị chưa ghi chú'}
                  </span>
                </div>
              </div>
            </div>
          </button>

          <div className="grid gap-4">
            {spotlightItems.map((item) => (
              <button
                key={item.documentId}
                type="button"
                onClick={() => setSelectedId(item.documentId)}
                className="surface-panel interactive-border rounded-xl group flex items-center gap-4 p-4 text-left"
              >
                <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.22em] text-gold/80">{item.category}</p>
                  <h3 className="ant-title mt-2 text-xl text-foreground">{item.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {item.description || item.quote || 'Ảnh tư liệu trong kho lưu trữ PMTL.'}
                  </p>
                </div>
              </button>
            ))}

            <Card className="surface-panel-muted rounded-xl">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="ant-label text-xs uppercase tracking-[0.22em] text-gold/80">Điểm nhấn</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 p-5 pt-2 text-sm">
                <Card className="rounded-lg border-border/60 bg-background/50 shadow-none">
                  <CardContent className="p-3">
                    <p className="text-muted-foreground">Ảnh nổi bật</p>
                    <p className="ant-title mt-1 text-2xl text-foreground">{featuredCount}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-lg border-border/60 bg-background/50 shadow-none">
                  <CardContent className="p-3">
                    <p className="text-muted-foreground">Bộ sưu tập</p>
                    <p className="ant-title mt-1 text-2xl text-foreground">{collections.length}</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_290px]">
        <div>
          <Card className="surface-panel sticky top-20 z-20 rounded-xl p-4 backdrop-blur">
            <CardContent className="grid gap-3 p-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tiêu đề, album, địa điểm..."
                  className="h-11 rounded-lg border-border bg-background/80 pl-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-border bg-background md:w-[150px]">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-border bg-background md:w-[128px]">
                    <SelectValue placeholder="Năm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {years.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item === ALL_OPTION ? 'Năm: Tất cả' : item}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-border bg-background md:w-[160px]">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="oldest">Cũ nhất</SelectItem>
                      <SelectItem value="featured">Ưu tiên nổi bật</SelectItem>
                      <SelectItem value="az">Tên A-Z</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => {
                    if (value === 'grid' || value === 'editorial') setViewMode(value)
                  }}
                  variant="outline"
                  size="sm"
                  className="col-span-1 justify-start rounded-lg border border-border bg-background p-1 md:col-span-1 md:justify-center"
                >
                  <ToggleGroupItem value="grid" className="rounded-md">
                    <Grid2X2 />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="editorial" className="rounded-md">
                    <LayoutGrid />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>

          {filteredItems.length ? (
            <div className={cn('mt-6 grid gap-5', viewMode === 'editorial' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4')}>
              {filteredItems.map((item, index) => (
                <GalleryCard
                  key={item.documentId}
                  item={item}
                  priority={index < 2}
                  editorial={viewMode === 'editorial' && index % 5 === 0}
                  onOpen={(next) => setSelectedId(next.documentId)}
                />
              ))}
            </div>
          ) : (
            <Card className="surface-panel mt-6 rounded-xl">
              <CardHeader className="text-center">
                <CardTitle className="ant-label text-xs uppercase tracking-[0.22em] text-gold/80">Không có dữ liệu phù hợp</CardTitle>
                <CardDescription className="ant-title mt-2 text-3xl text-foreground">
                  Thử đổi bộ lọc hoặc thêm ảnh mới trong admin
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8 text-center text-muted-foreground">
                Route này đọc dữ liệu trực tiếp từ collection type `gallery-item`. Khi admin thêm ảnh và publish, giao diện sẽ tự cập nhật theo chu kỳ cache.
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card className="surface-panel rounded-xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="ant-label text-xs uppercase tracking-[0.22em] text-gold/80">Lưu trữ nhanh</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 p-5 pt-2">
              {years.filter((item) => item !== ALL_OPTION).map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={year === item ? 'sacred' : 'outline'}
                  size="sm"
                  onClick={() => setYear(item)}
                  className="rounded-md"
                >
                  {item}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="surface-panel rounded-xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="ant-label text-xs uppercase tracking-[0.22em] text-gold/80">Bộ sưu tập nổi bật</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="flex flex-col gap-3">
                {collections.length ? (
                  collections.map(([name, total]) => (
                    <div key={name} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">{name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Bộ ảnh được tổng hợp từ CMS</p>
                      </div>
                      <Badge variant="sacred" className="rounded-md bg-gold/10 text-gold">{total} ảnh</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa có album nào được đặt tên riêng.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="surface-panel rounded-xl">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="ant-label text-xs uppercase tracking-[0.22em] text-gold/80">Gợi ý vận hành</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="flex flex-col gap-3 text-sm leading-7 text-muted-foreground">
                <p>Đặt `featured = true` cho ảnh cần xuất hiện ở hero.</p>
                <Separator className="bg-border/70" />
                <p>Dùng `album` để gom cụm ảnh cùng sự kiện hoặc chủ đề.</p>
                <Separator className="bg-border/70" />
                <p>Điền `keywords` bằng chuỗi phân tách dấu phẩy để tăng chất lượng tìm kiếm.</p>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <ImageLightbox
        items={lightboxItems}
        open={lightboxOpen}
        index={selectedIndex}
        onClose={closeLightbox}
        onIndexChange={(nextIndex) => {
          const target = filteredItems[nextIndex]
          if (target) setSelectedId(target.documentId)
        }}
        onTagClick={(tag) => {
          setQuery(tag)
          closeLightbox()
        }}
      />
    </div>
  )
}
