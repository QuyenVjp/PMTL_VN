// ─────────────────────────────────────────────────────────────
//  app/tag/[slug] — Server Component (posts by tag)
//  ISR: 1 hour revalidate
// ─────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import BlogPagination from '@/components/BlogPagination'
import { fetchTagBySlug, getAllTagSlugs } from '@/lib/api/blog-tags'
import { getPosts } from '@/lib/api/blog'
import { getStrapiMediaUrl } from '@/lib/strapi'
import { PAGINATION } from '@/lib/config/pagination'
import { Tag, ChevronLeft } from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllTagSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const tag = await fetchTagBySlug(slug)
    if (!tag) return { title: 'Thẻ không tìm thấy' }
    return {
      title: `#${tag.name} — Bài viết theo thẻ | Pháp Môn Tâm Linh`,
      description: tag.description ?? `Các bài viết Phật pháp được gắn thẻ "${tag.name}".`,
    }
  } catch {
    return { title: 'Bài viết theo thẻ' }
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page } = await searchParams
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))

  const [tag, postsRes] = await Promise.all([
    fetchTagBySlug(slug),
    getPosts({
      page: currentPage,
      pageSize: PAGINATION.BLOG_PAGE_SIZE,
      tagSlugs: [slug],
      revalidate: 3600,
    }),
  ])

  if (!tag) notFound()

  const posts = postsRes.data ?? []
  const totalPages = postsRes.meta?.pagination?.pageCount ?? 1
  const totalPosts = postsRes.meta?.pagination?.total ?? 0

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="py-12">
        <div className="container mx-auto px-6 max-w-5xl">

          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Tất cả bài viết
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Tag className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Thẻ bài viết</p>
                <h1 className="font-display text-2xl text-foreground">#{tag.name}</h1>
              </div>
            </div>
            {tag.description && (
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">{tag.description}</p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-2">{totalPosts} bài viết</p>
          </div>

          {/* Posts grid */}
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Chưa có bài viết nào với thẻ này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {posts.map((post) => {
                const thumbUrl = post.thumbnail ? getStrapiMediaUrl(post.thumbnail.url) : null
                return (
                  <article
                    key={post.documentId}
                    className="group relative flex flex-col rounded-2xl bg-card border border-border hover:border-gold/30 overflow-hidden transition-all hover:shadow-md"
                  >
                    <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-0"><span className="sr-only">Xem bài viết: {post.title}</span></Link>
                    <div className="relative z-10 aspect-[16/9] w-full bg-secondary overflow-hidden border-b border-border/50 pointer-events-none">
                      {thumbUrl ? (
                        <Image
                          src={thumbUrl}
                          alt={post.thumbnail?.alternativeText || post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gold/5">
                          <Tag className="w-10 h-10 text-gold/20" />
                        </div>
                      )}
                    </div>
                    <div className="relative z-10 p-4 flex flex-col flex-1 pointer-events-none">
                      <h2 className="font-display text-base text-foreground mb-2 leading-snug group-hover:text-gold transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-3 border-t border-border/50 pointer-events-auto">
                        {post.tags?.slice(0, 3).map((t) => (
                          <Link
                            key={t.documentId}
                            href={`/tag/${t.slug}`}
                            className={`relative z-20 text-[10px] px-2 py-0.5 rounded-full border transition-colors ${t.slug === slug ? 'bg-gold/10 text-gold border-gold/30' : 'bg-secondary text-muted-foreground border-border hover:border-gold/30 hover:text-gold'}`}
                          >
                            #{t.name}
                          </Link>
                        ))}
                        {post.publishedAt && (
                          <span className="ml-auto text-[10px] text-muted-foreground/60">
                            {formatDate(post.publishedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
