// ─────────────────────────────────────────────────────────────
//  /blog/[slug] — Server Component (dynamic blog post)
//  ISR: fallback revalidate 1 hour — instant via /api/revalidate webhook
// ─────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import { getPostBySlug, getAllPostSlugs, getRelatedPosts, getPostBySlugForMetadata } from '@/lib/api/blog'
import { getSeriesData } from '@/lib/api/series'
import { getStrapiMediaUrl } from '@/lib/strapi'
import Breadcrumbs from '@/components/Breadcrumbs'
import ViewTracker from '@/components/ViewTracker'
import { ArrowRightIcon } from '@/components/icons/ZenIcons'
import ShareButtons from './ShareButtons'
import CommentsSection from '@/components/comments/CommentsSection'
import SeriesNav from '@/components/blog/SeriesNav'
import BlogPostEngagement from '@/components/blog/BlogPostEngagement'
import Sidebar from '@/components/layout/Sidebar'
export const revalidate = 3600 // 1h fallback — webhook clears cache instantly on admin publish

interface Props {
  params: Promise<{ slug: string }>
}

/** Pre-generate known slugs at build time */
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

/** Dynamic SEO metadata per post */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    // Use lighter fetch for metadata (faster, only fetches needed fields)
    const post = await getPostBySlugForMetadata(slug)
    if (!post) return { title: 'Bài không tồn tại' }

    const seoData = post.seo
    const seoTitle = seoData?.metaTitle || post.title
    const seoDesc = seoData?.metaDescription || post.content.replace(/<[^>]*>/g, '').substring(0, 160)

    // SEO Images
    const seoImage = seoData?.metaImage
    const thumbUrl = post.thumbnail ? getStrapiMediaUrl(post.thumbnail.url) : null
    const finalImageUrl = seoImage ? getStrapiMediaUrl(seoImage.url) : thumbUrl

    return {
      title: seoTitle,
      description: seoDesc,
      keywords: seoData?.keywords,
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        type: 'article',
        publishedTime: post.publishedAt || post.createdAt,
        ...(finalImageUrl ? { images: [{ url: finalImageUrl }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDesc,
        ...(finalImageUrl ? { images: [finalImageUrl] } : {}),
      },
      alternates: {
        canonical: post.seo?.canonicalURL || undefined
      }
    }
  } catch {
    return {}
  }
}

/** Extract YouTube video ID from various YouTube URL formats */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// SOURCE_META removed as it's no longer used in simplified schema.

// LanguageBadge removed as it's no longer in schema

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  // Fetch related posts + series data concurrently
  const [related, seriesData] = await Promise.all([
    post.related_posts?.length ? Promise.resolve(post.related_posts) : getRelatedPosts(post, 4),
    post.seriesKey ? getSeriesData(post.seriesKey, post.slug) : Promise.resolve(null),
  ])

  const thumbnailUrl = post.thumbnail
    ? getStrapiMediaUrl(post.thumbnail.formats?.large?.url ?? post.thumbnail.url)
    : null

  const youtubeId = post.video_url ? getYouTubeId(post.video_url) : null
  const oembedHtml =
    typeof post.oembed?.oembed?.html === 'string' && post.oembed.oembed.html.length > 0
      ? post.oembed.oembed.html
      : null
  const sourceName = post.sourceName ?? null
  const sourceUrl = post.sourceUrl ?? null
  const sourceTitle = post.sourceTitle ?? null

  const firstCat = post.categories?.[0]
  const categoryName = firstCat?.name ?? 'Khai Thị'
  const categoryHref = firstCat ? `/category/${firstCat.slug}` : '/blog'

  return (
    <div className="min-h-screen bg-background selection:bg-gold/20 selection:text-gold">
      <HeaderServer />
      <ViewTracker documentId={post.documentId} slug={post.slug} />
      <main className="py-5">
        <div className="container mx-auto px-6 ">

          <Breadcrumbs
            items={[
              { label: 'Blog', href: '/blog' },
              { label: categoryName, href: categoryHref },
              { label: post.title }
            ]}
          />

          {/* ── Series navigation ── */}
          {post.seriesKey && (
            <SeriesNav post={post} seriesData={seriesData} />
          )}

          <div className="flex flex-col lg:flex-row gap-10 mt-6">
            <div className="flex-1 min-w-0">
              {/* ── Header meta ── */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {/* Category */}
                  <Link
                    href={categoryHref}
                    className="px-2.5 py-1 rounded-md bg-gold/10 text-xs font-medium text-gold capitalize hover:bg-gold/20 transition-colors"
                  >
                    {categoryName}
                  </Link>

                  {/* Source reference badge */}
                  {sourceName && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-muted-foreground`}>
                      Nguồn: <code className="font-mono opacity-80">{sourceName}</code>
                    </span>
                  )}

                  {/* Featured */}
                  {post.featured && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-xs font-medium text-amber-400">
                      Nổi bật
                    </span>
                  )}

                  {/* Date */}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title */}
                <h1 className="ant-title mb-3 text-3xl leading-tight text-foreground md:text-4xl">
                  {post.title}
                </h1>

                {/* Tựa gốc tiếng Trung hoặc ngôn ngữ gốc */}
                {sourceTitle && (
                  <p className="text-muted-foreground/70 text-lg mb-3 font-light tracking-wide">
                    {sourceTitle}
                  </p>
                )}

                {/* Author + stats row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>Ban biên tập</span>
                  <span>{post.views.toLocaleString('vi-VN')} lượt xem</span>
                  {post.likes > 0 && (
                    <span>{post.likes} thích</span>
                  )}
                </div>
                <div className="mt-4">
                  <BlogPostEngagement documentId={post.documentId} />
                </div>
              </div>

              {/* ── Thumbnail ── */}
              {thumbnailUrl && !youtubeId && (
                <div className="rounded-xl overflow-hidden mb-10 bg-secondary/30">
                  <Image
                    src={thumbnailUrl}
                    alt={post.thumbnail?.alternativeText ?? post.title}
                    width={post.thumbnail?.width ?? 1200}
                    height={post.thumbnail?.height ?? 800}
                    className="w-full h-auto"
                    priority
                  />
                </div>
              )}

              {/* ── YouTube embed ── */}
              {youtubeId && (
                <div className="rounded-xl overflow-hidden mb-10 aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                    title={post.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              )}

              {/* ── Non-YouTube video URL ── */}
              {post.video_url && !youtubeId && (
                <div className="rounded-xl overflow-hidden mb-10 bg-black">
                  <video
                    src={post.video_url}
                    controls
                    poster={thumbnailUrl ?? undefined}
                    className="w-full max-h-[500px]"
                  />
                </div>
              )}

              {/* ── Rich embed fallback ── */}
              {oembedHtml && !post.video_url && !youtubeId && (
                <div className="rounded-xl overflow-hidden mb-10 border border-border bg-card p-3 md:p-4">
                  <div
                    className="prose prose-sm max-w-none [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-lg"
                    dangerouslySetInnerHTML={{ __html: oembedHtml }}
                  />
                </div>
              )}

              {/* ── Audio player ── */}
              {post.audio_url && (
                <div className="mb-8 p-4 rounded-xl bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Nghe bài khai thị</p>
                  <audio src={post.audio_url} controls className="w-full" />
                </div>
              )}

              {/* ── Content (HTML from CKEditor) ── */}
              <article
                className="prose dark:prose-invert prose-gold max-w-none mb-10 whitespace-pre-wrap
              prose-headings:font-serif prose-headings:text-foreground
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-a:text-gold hover:prose-a:underline
              prose-strong:text-foreground
              prose-blockquote:border-gold/30 prose-blockquote:text-muted-foreground
              prose-img:rounded-lg "
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* ── Gallery ── */}
              {post.gallery && post.gallery.length > 0 && (
                <div className="mb-10">
                  <h3 className="ant-title mb-4 text-lg text-foreground">Hình ảnh minh họa</h3>
                  <div className={`grid gap-3 ${post.gallery.length === 1 ? 'grid-cols-1' : post.gallery.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                    {post.gallery.map((img) => {
                      const imgUrl = getStrapiMediaUrl(img.formats?.medium?.url ?? img.url)
                      if (!imgUrl) return null
                      return (
                        <div key={img.id} className="rounded-lg overflow-hidden aspect-video bg-secondary">
                          <Image
                            src={imgUrl}
                            alt={img.alternativeText ?? ''}
                            width={400}
                            height={225}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Original Link / Source URL ── */}
              {sourceUrl && (
                <div className="mb-10">
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md border border-gold/20 bg-primary/10 px-4 py-2.5 text-sm font-medium text-gold transition-all shadow-sm hover:bg-gold hover:text-black"
                  >
                    <ArrowRightIcon className="w-4 h-4 translate-y-px" />
                    Xem bài viết gốc
                  </a>
                  <p className="mt-2 text-[10px] text-muted-foreground italic">
                    Link dẫn đến trang web chính thống của Pháp Môn Tâm Linh
                  </p>
                </div>
              )}

              {/* ── Tags ── */}
              {post.tags && post.tags.length > 0 && (
                <div className="mb-10 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tag/${tag.slug}`}
                        className="rounded-md bg-secondary px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Related posts ── */}
              {related.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="ant-title mb-6 text-lg text-foreground">Bài viết liên quan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {related.map((rp) => {
                      const rpThumb = rp.thumbnail
                        ? getStrapiMediaUrl(rp.thumbnail.formats?.small?.url ?? rp.thumbnail.url)
                        : null
                      return (
                        <Link
                          key={rp.id}
                          href={`/blog/${rp.slug}`}
                          className="flex gap-3 p-4 rounded-xl bg-card border border-border hover:border-gold/30 transition-all group"
                        >
                          {rpThumb && (
                            <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-secondary">
                              <Image
                                src={rpThumb}
                                alt={rp.thumbnail?.alternativeText ?? rp.title}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">
                              {new Date(rp.publishedAt ?? rp.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                            <h4 className="text-sm font-medium text-foreground group-hover:text-gold transition-colors leading-snug line-clamp-3">
                              {rp.title}
                            </h4>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Share Buttons ── */}
              <ShareButtons
                url={`/blog/${post.slug}`}
                content={post.content}
              />

              {/* ── Comments section ── */}
              <Suspense fallback={null}>
                <CommentsSection
                  slug={post.slug}
                  allowComments={(post as any).allowComments !== false}
                />
              </Suspense>

              {/* ── Back link ── */}
              <div className="mt-12">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-gold hover:underline text-sm"
                >
                  ← Quay lại danh sách bài viết
                </Link>
              </div>
            </div>
            {/* ── Sidebar ── */}
            <Sidebar />
          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
