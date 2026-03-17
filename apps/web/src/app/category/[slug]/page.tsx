// ─────────────────────────────────────────────────────────────
//  /category/[slug] — Category page
// ─────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { getCategoryBySlug, getCategories, getCategoryBreadcrumb } from '@/lib/api/categories'
import { getCmsMediaUrl } from '@/lib/cms'
import { cachedCmsFetch } from '@/lib/cms/server-cache'
import { logger } from '@/lib/logger'
import Breadcrumbs from '@/components/Breadcrumbs'
import type { BlogPost, CmsList, Category } from '@/types/cms'

interface Props {
  params: Promise<{ slug: string }>
}

// generateMetadata updated for simplified schema
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const result = await cachedCmsFetch<CmsList<Category>>(`/categories`, {
    filters: { slug: { $eq: slug } },
    pagination: { page: 1, pageSize: 1 },
  }, {
    profile: 'minutes',
    tags: [`category-${slug}`],
  })
  const cat = result?.data?.[0]
  return {
    title: cat ? `${cat.name} — Pháp Môn Tâm Linh` : 'Chủ đề',
    description: cat?.description || (cat ? `Các bài viết thuộc chủ đề ${cat.name}` : undefined),
  }
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`
  return `${Math.floor(diffDays / 365)} năm trước`
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, allCats] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
  ])

  if (!category) notFound()

  const breadcrumb = getCategoryBreadcrumb(allCats, slug)

  // Fetch posts (filter by dynamic categories relation or category enum)
  let posts: BlogPost[] = []
  let total = 0
  try {
    const res = await cachedCmsFetch<CmsList<BlogPost>>('/blog-posts', {
      filters: {
        categories: { slug: { $eq: slug } }
      },
      sort: ['publishedAt:desc'],
      populate: ['thumbnail', 'gallery', 'categories'],
      pagination: { page: 1, pageSize: 24 },
    }, {
      profile: 'minutes',
      tags: [`category-${slug}`],
    })
    posts = res.data
    total = res.meta?.pagination?.total ?? 0
  } catch (error) {
    logger.error('Failed to fetch category posts', { error, slug })
  }

  const subCategories = allCats.filter((c) => c.parent?.id === category.id)

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />

      <main className="route-shell">
        <div className="route-frame">
          {/* ─── Header ─── */}
          <section className="route-hero">
            <Breadcrumbs
              centered
              items={breadcrumb.map((crumb) => ({
                label: crumb.name,
                href: `/category/${crumb.slug}`
              }))}
            />

            <p className="route-kicker mb-4">
              {breadcrumb.length > 1 ? 'Chủ đề con' : 'Chủ đề'}
            </p>
            <h1 className="route-title mb-5">
              {category.name}
            </h1>
            {category.description && (
              <p className="route-copy mx-auto">
                {category.description}
              </p>
            )}
            <p className="route-meta">{total} bài viết</p>
          </section>

          {/* ─── Sub-categories ─── */}
          {subCategories.length > 0 && (
            <section className="mb-12 border-b border-border/50 pb-8">
              <p className="card-eyebrow mb-4 text-center text-muted-foreground">Chủ đề con</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.slug}`}
                    className="filter-chip filter-chip-idle text-sm"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ─── Posts ─── */}
          {posts.length > 0 ? (
            <section className="space-y-6">
              {/* Featured first post — editorial spotlight */}
              {(() => {
                const post = posts[0]
                const thumb = post.thumbnail || (post.gallery?.length ? post.gallery[0] : null)
                const thumbUrl = thumb
                  ? getCmsMediaUrl(thumb.formats?.medium?.url || thumb.formats?.small?.url || thumb.url)
                  : null
                return (
                  <Link
                    href={`/blog/${post.slug}`}
                    className="panel-shell panel-hover group flex flex-col overflow-hidden"
                  >
                    <div className="relative aspect-video md:w-2/5 md:aspect-auto overflow-hidden bg-secondary/20 shrink-0">
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 40vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-secondary/20" />
                      )}
                      {post.featured && (
                        <div className="absolute top-3 left-3">
                          <span className="rounded-md bg-gold px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-black">Nổi bật</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-6 md:p-8 flex-1">
                      <p className="card-eyebrow mb-3">Mới nhất</p>
                      <h2 className="font-display text-xl md:text-2xl text-foreground group-hover:text-gold-dim transition-colors mb-3 line-clamp-3 leading-snug">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-5">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                      </p>
                      <span className="text-xs text-muted-foreground/70">
                        {post.publishedAt ? timeAgo(post.publishedAt) : ''}
                      </span>
                    </div>
                  </Link>
                )
              })()}

              {/* Remaining posts */}
              {posts.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {posts.slice(1).map((post) => {
                    const thumb = post.thumbnail || (post.gallery && post.gallery.length > 0 ? post.gallery[0] : null)
                    const thumbUrl = thumb
                      ? getCmsMediaUrl(thumb.formats?.medium?.url || thumb.formats?.small?.url || thumb.url)
                      : null
                    return (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="panel-shell panel-hover group flex flex-col overflow-hidden"
                      >
                        <div className="relative aspect-video overflow-hidden bg-secondary/20">
                          {thumbUrl ? (
                            <Image
                              src={thumbUrl}
                              alt={post.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-secondary/10" />
                          )}
                          <div className="absolute top-2.5 left-2.5 flex gap-1">
                            {post.featured && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">Nổi bật</span>
                            )}
                            {post.sourceName && (
                              <span className="subtle-badge normal-case tracking-normal text-secondary-foreground">
                                {post.sourceName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col flex-1 p-5">
                          <h3 className="font-display text-sm md:text-base text-foreground group-hover:text-gold-dim transition-colors mb-2 line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
                            {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <span>Ban biên tập</span>
                            <span>{post.publishedAt ? timeAgo(post.publishedAt) : ''}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </section>
          ) : (
            <section className="text-center py-16">
              <p className="text-muted-foreground mb-2">Chưa có bài viết nào trong chủ đề này</p>
              <Link href="/blog" className="inline-block mt-3 text-sm text-gold-dim hover:underline">
                Xem tất cả bài viết →
              </Link>
            </section>
          )}
        </div>
      </main>

      <Footer />
      <StickyBanner />
    </div>
  )
}
