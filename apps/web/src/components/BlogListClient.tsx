'use client'

// ─────────────────────────────────────────────────────────────
//  components/BlogListClient.tsx — Responsive Blog List + Filter
//  Mobile: Filter dạng bottom sheet (slide up), ảnh full-width uncropped
//  Desktop: Sidebar cổ điển bên trái
// ─────────────────────────────────────────────────────────────

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon, SearchIcon } from '@/components/icons/ZenIcons'
import { getStrapiMediaUrl } from '@/lib/strapi'
import type { BlogPost, Category } from '@/types/strapi'
import type { BlogArchiveStat } from '@/lib/api/blog'
import BlogPagination from '@/components/BlogPagination'
import { Loader2, SlidersHorizontal, X, ExternalLink, ChevronDown, Check } from 'lucide-react'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'

const EXTERNAL_LINKS = [
  { label: 'Website Toàn Cầu (心灵法门)', href: 'https://xinlingfamen.info' },
  { label: 'Blog Đài Trưởng Lư', href: 'https://xlch.org' },
  { label: 'Đài Đông Phương Úc', href: 'https://xlch.org' },
  { label: 'Zalo Group XLFM', href: 'https://zalo.me' },
  { label: 'YouTube Channel', href: 'https://youtube.com' },
]

interface BlogListClientProps {
  posts: BlogPost[]
  totalPosts: number
  totalPages: number
  currentPage: number
  categories: Category[]
  currentCategory: string
  currentSearch: string
  archives: BlogArchiveStat[]
}

export default function BlogListClient({
  posts,
  totalPosts,
  totalPages,
  currentPage,
  categories,
  currentCategory,
  currentSearch,
  archives,
}: BlogListClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Mobile filter bottom sheet state
  const [filterOpen, setFilterOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Đóng sheet khi click overlay
  useEffect(() => {
    if (!filterOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFilterOpen(false) }
    document.addEventListener('keydown', handleKey)
    // Tắt scroll body khi sheet mở
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [filterOpen])

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== '') { params.set(key, value) } else { params.delete(key) }
      params.delete('page')
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [pathname, searchParams, router]
  )

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => { updateParam('q', e.target.value) },
    [updateParam]
  )

  const handleCategoryClick = (slug: string) => {
    updateParam('category', slug === currentCategory ? null : slug)
    setFilterOpen(false) // Đóng sheet sau khi chọn
  }

  const clearFilters = () => {
    startTransition(() => { router.push(pathname, { scroll: false }) })
    setFilterOpen(false)
  }

  const hasFilter = currentCategory !== '' || currentSearch !== ''
  const activeCategory = categories.find(c => c.slug === currentCategory)

  // ── Filter Panel Content (dùng lại cho cả sidebar và bottom sheet) ──
  const FilterPanel = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          defaultValue={currentSearch}
          onChange={handleSearch}
          placeholder="Tìm bài viết, mã nguồn..."
          className="toolbar-search pl-4 pr-12"
        />
        <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {currentSearch && (
          <button
            onClick={() => updateParam('q', null)}
            className="absolute right-10 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-md bg-secondary text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>

      {/* Category Accordion (dành riêng desktop) / Pills (dành riêng mobile) */}
      <div className="hidden lg:block">
        <Accordion type="single" collapsible defaultValue="categories" className="w-full">
          <AccordionItem value="categories" className="border-b-0">
            <AccordionTrigger className="py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-gold-dim hover:no-underline">
              Danh Mục
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-0">
              <ScrollArea className="h-[280px] pr-4 -mr-4">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { updateParam('category', null); onClose?.() }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${currentCategory === ''
                      ? 'filter-chip-active'
                      : 'filter-chip-idle'
                      }`}
                  >
                    Tất cả
                    {currentCategory === '' && <Check className="w-4 h-4" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${currentCategory === cat.slug
                        ? 'filter-chip-active'
                        : 'filter-chip-idle'
                        }`}
                    >
                      {cat.name}
                      {currentCategory === cat.slug && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="lg:hidden">
        <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Danh Mục</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { updateParam('category', null); onClose?.() }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${currentCategory === ''
              ? 'filter-chip-active'
              : 'filter-chip-idle'
              }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${currentCategory === cat.slug
                ? 'filter-chip-active'
                : 'filter-chip-idle'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tra cứu lưu trữ khai thị */}
      {archives.length > 0 && (
        <div className="hidden lg:block">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="archives" className="border-b-0">
              <AccordionTrigger className="py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-gold-dim hover:no-underline">
                Lưu Trữ
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0">
                <ScrollArea className="h-[250px] pr-4 -mr-4">
                  <div className="flex flex-col gap-3 pl-1">
                    {archives.map((arch) => (
                      <div key={arch.year} className="panel-shell-muted rounded-xl px-3 py-3">
                        <p className="mb-2 text-sm font-semibold text-foreground/85">{arch.year}</p>
                        <div className="grid grid-cols-2 gap-2 border-l border-gold/15 pl-2">
                          {arch.months.map((m) => (
                            <Link
                              key={`${arch.year}-${m.month}`}
                              href={`/blog/archive/${arch.year}/${m.month}`}
                              className="flex justify-between rounded-md border border-border/70 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-gold/25 hover:bg-secondary/70 hover:text-foreground"
                            >
                              <span>Th.{m.month}</span>
                              <span className="opacity-60">{m.count}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* External Links */}
      <div>
        <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Liên Kết</p>
        <div className="space-y-1">
          {EXTERNAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary/60"
            >
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">{link.label}</span>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-gold-dim" />
            </a>
          ))}
        </div>
      </div>

      {hasFilter && (
        <button
          onClick={clearFilters}
          className="w-full rounded-lg border border-gold/20 py-2 text-sm text-gold-dim transition-colors hover:bg-gold/5"
        >
          × Xóa toàn bộ bộ lọc
        </button>
      )}
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-8">

      {/* ── MOBILE: Sticky filter bar ── */}
      <div className="sticky top-14 z-30 -mx-4 flex items-center gap-3 border-b border-border bg-background/88 px-4 py-3 backdrop-blur-md lg:hidden">
        {/* Search compact */}
        <div className="relative flex-1">
          <input
            type="text"
            defaultValue={currentSearch}
            onChange={handleSearch}
            placeholder="Tìm bài viết..."
            className="toolbar-search pl-4 pr-10"
          />
          <SearchIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setFilterOpen(true)}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${hasFilter
            ? 'filter-chip-active'
            : 'filter-chip-idle'
            }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {hasFilter ? `${activeCategory?.name ?? 'Lọc'}` : 'Bộ lọc'}
          {hasFilter && <span className="h-1.5 w-1.5 rounded-sm bg-gold" />}
        </button>
      </div>

      {/* ── MOBILE: Bottom Sheet Overlay ── */}
      <AnimatePresence>
        {filterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Sheet */}
            <motion.div
              ref={sheetRef}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="overlay-shell fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t lg:hidden"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-sm bg-border" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <div>
                  <h3 className="ant-title text-base text-foreground">Bộ Lọc & Tìm Kiếm</h3>
                  <p className="text-[11px] text-muted-foreground">{totalPosts.toLocaleString('vi-VN')} bài viết</p>
                </div>
                <button
                  onClick={() => setFilterOpen(false)}
                  className="flex size-8 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Content */}
              <div className="p-5 pb-10">
                <FilterPanel onClose={() => setFilterOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP: Sidebar ── */}
      <aside className="hidden lg:block lg:w-72 shrink-0">
        <div className="sticky top-24">
          <div className="panel-shell p-5">
            <h3 className="ant-title mb-4 text-base text-foreground">Bộ Lọc & Tìm Kiếm</h3>
            <FilterPanel />
          </div>
        </div>
      </aside>

      {/* ── Post List ── */}
      <div className="flex-1 min-w-0">
        {/* Results bar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
            <span>
              <span className="text-foreground font-medium">{posts.length}</span>
              {' '}/ <span className="text-foreground font-medium">{totalPosts.toLocaleString('vi-VN')}</span> bài
            </span>
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="ml-1 text-gold hover:underline text-xs"
              >
                × Xóa lọc
              </button>
            )}
          </p>
          <span className="text-xs text-muted-foreground/60">Trang {currentPage}/{totalPages}</span>
        </div>

        {/* Active filter chip (mobile) */}
        {hasFilter && (
          <div className="lg:hidden flex flex-wrap gap-2 mb-4">
            {activeCategory && (
              <span className="filter-chip-active flex items-center gap-1 rounded-md px-2.5 py-1 text-xs">
                {activeCategory.name}
                <button onClick={() => updateParam('category', null)} className="hover:text-foreground transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentSearch && (
              <span className="filter-chip-idle flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-foreground">
                &ldquo;{currentSearch.substring(0, 20)}&rdquo;
                <button onClick={() => updateParam('q', null)} className="hover:text-primary transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Post cards */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">Không tìm thấy bài viết phù hợp</p>
              <button
                onClick={clearFilters}
                className="mt-3 text-gold hover:underline text-sm"
              >
                Xem tất cả
              </button>
            </div>
          ) : (
            posts.map((post, i) => {
              const thumbMedia = post.thumbnail ?? post.gallery?.[0]
              // Ưu tiên medium → large → original để full-width đẹp, tránh vỡ
              const thumbUrl = thumbMedia
                ? getStrapiMediaUrl(
                  thumbMedia.formats?.medium?.url ??
                  thumbMedia.formats?.large?.url ??
                  thumbMedia.url
                )
                : null

              return (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className={`panel-shell panel-hover group overflow-hidden transition-all ${post.featured
                    ? 'border-gold/30 bg-primary/[0.03]'
                    : ''
                    }`}
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    {/* Full-width Image — hiển thị trước tiêu đề trên mobile, sau tiêu đề trên desktop */}
                    {thumbUrl && (
                      <div className="w-full border-b border-border/60 bg-secondary/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbUrl}
                          alt={thumbMedia?.alternativeText ?? post.title}
                          className="w-full h-auto object-contain max-h-96 sm:max-h-[480px]
                                     group-hover:scale-[1.01] transition-transform duration-700 ease-out"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    )}

                    {/* Card body */}
                    <div className="p-4 sm:p-6 flex flex-col gap-3">
                      {/* Meta badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {post.featured && (
                            <span className="subtle-badge">
                              Nổi bật
                            </span>
                          )}
                          <span className="subtle-badge">
                            {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                          {(post as any).sourceName && (
                            <span className="subtle-badge font-mono lowercase">
                              {(post as any).sourceName}
                            </span>
                          )}
                          {post.categories?.[0] && (
                            <span className="subtle-badge capitalize">
                              {post.categories[0].name}
                            </span>
                          )}
                        <span className="text-[10px] text-muted-foreground ml-auto opacity-60">
                          {post.views.toLocaleString('vi-VN')} lượt xem
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="ant-title text-base leading-snug text-foreground transition-colors group-hover:text-gold-dim sm:text-lg">
                        {post.title}
                      </h2>

                      {(post as any).sourceTitle && (
                        <p className="text-xs text-muted-foreground/60 font-light italic -mt-1">
                          {(post as any).sourceTitle}
                        </p>
                      )}

                      {/* Summary */}
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {(post.excerpt || post.content || '').replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-1.5 pt-1 text-sm font-medium text-gold-dim transition-colors group-hover:text-gold-dim">
                        Đọc tiếp
                        <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.article>
              )
            })
          )}
        </div>

        {/* Phân trang */}
        <BlogPagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  )
}
