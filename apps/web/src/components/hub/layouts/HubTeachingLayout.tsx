// components/hub/layouts/HubTeachingLayout.tsx
// Teaching theme: scholarly, typography-first, reading hall
import Link from 'next/link'
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import type { HubPage } from '@/types/strapi'
import { BookMarked, Download } from 'lucide-react'
import HubBlockRenderer from '../HubBlockRenderer'
import HubSection from '../HubSection'
import DownloadRow from '../DownloadRow'

interface HubTeachingLayoutProps {
  hubPage: HubPage
}

export default function HubTeachingLayout({ hubPage }: HubTeachingLayoutProps) {
  const hasCuratedPosts = hubPage.curated_posts && hubPage.curated_posts.length > 0
  const hasDownloads = hubPage.downloads && hubPage.downloads.length > 0

  return (
    <main className="min-h-screen bg-background">
      {/* ── HERO: Scholarly, centered, heavily muted textural background ── */}
      {/* Cấu trúc Fallback: Cover Image bị làm xám (grayscale), mix-blend thành textute nền,
          không bao giờ cướp thị giác hay cản chữ dù có noise đến đâu. */}
      <div className="relative overflow-hidden border-b border-gold/10 bg-gradient-to-b from-card/75 to-background">
        {hubPage.coverImage && (() => {
          const imgSrc = getStrapiMediaUrl(
            hubPage.coverImage!.formats?.large?.url ?? hubPage.coverImage!.url
          )
          return imgSrc ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={imgSrc}
                alt={hubPage.title}
                fill
                className="object-cover opacity-[0.06] grayscale contrast-125 mix-blend-multiply dark:mix-blend-screen pointer-events-none"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>
          ) : null
        })()}

        <div className="container relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center md:py-20">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md border border-gold/20 bg-background/50">
            <BookMarked className="w-5 h-5 text-gold/70" />
          </div>

          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">
            Tài Liệu Học Pháp
          </p>

          <h1 className="mb-4 max-w-3xl break-words font-display text-4xl leading-tight text-foreground md:text-5xl">
            {hubPage.title || '[Không có tiêu đề]'}
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {hubPage.description || 'Mô tả bộ tài liệu đang được cập nhật...'}
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-24">
        {/* ── Featured Reading (1-column elegant rows) ── */}
        {hasCuratedPosts && (
          <section>
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className="h-px bg-gold/20 flex-1 max-w-[100px]" />
              <h2 className="ant-title text-2xl tracking-tight text-foreground md:text-3xl">Bài Đọc Nổi Bật</h2>
              <span className="h-px bg-gold/20 flex-1 max-w-[100px]" />
            </div>

            <div className="space-y-6 md:space-y-8">
              {hubPage.curated_posts!.map((post) => {
                const thumbUrl = post.thumbnail
                  ? getStrapiMediaUrl(post.thumbnail.formats?.small?.url ?? post.thumbnail.url)
                  : null
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col items-start gap-6 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-gold/25 hover:shadow-ant md:items-center md:p-8 sm:flex-row"
                  >
                    {thumbUrl && (
                      <div className="shrink-0 w-full sm:w-48 aspect-video sm:aspect-square relative overflow-hidden bg-muted rounded border border-border">
                        <Image
                          src={thumbUrl}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 group-hover:grayscale-0 grayscale-[30%] transition-all duration-700"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <p className="text-[10px] font-bold tracking-widest text-gold/50 uppercase mb-3 flex items-center gap-2">
                        <span className="h-1 w-1 rounded-sm bg-gold/30" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Bài viết mới'}
                      </p>
                      <h3 className="ant-title mb-4 line-clamp-2 text-xl leading-snug text-foreground transition-colors group-hover:text-gold md:text-2xl">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Dynamic Blocks ── */}
        {hubPage.blocks && hubPage.blocks.length > 0 && (
          <section>
            <HubBlockRenderer blocks={hubPage.blocks} />
          </section>
        )}

        {/* ── Hub Sections (Categories/Topics) ── */}
        {hubPage.sections && hubPage.sections.length > 0 && (
          <div className="space-y-24 pt-8">
            {hubPage.sections.map((section) => (
              <HubSection key={section.id} section={section} />
            ))}
          </div>
        )}

        {/* ── Downloads Shelf (functional) ── */}
        {hasDownloads && (
          <section className="pt-24 border-t border-gold/10">
            <div className="flex flex-col items-center text-center mb-12">
              <Download className="w-6 h-6 text-gold mb-4 opacity-50" />
              <h2 className="ant-title text-2xl text-foreground md:text-3xl">Tài Liệu Tải Xuống</h2>
              <p className="text-sm text-muted-foreground mt-3">Miễn phí và dành cho tất cả mọi người.</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-ant">
              {hubPage.downloads!.map((item) => (
                <DownloadRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
