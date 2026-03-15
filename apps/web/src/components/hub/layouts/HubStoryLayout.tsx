// components/hub/layouts/HubStoryLayout.tsx
// Story theme: narrative, warmth, image-heavy, testimonial
import Link from 'next/link'
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import type { HubPage } from '@/types/strapi'
import { BookOpen, Download } from 'lucide-react'
import HubBlockRenderer from '../HubBlockRenderer'
import HubSection from '../HubSection'
import DownloadRow from '../DownloadRow'

interface HubStoryLayoutProps {
  hubPage: HubPage
}

export default function HubStoryLayout({ hubPage }: HubStoryLayoutProps) {
  const hasCuratedPosts = hubPage.curated_posts && hubPage.curated_posts.length > 0
  const hasDownloads = hubPage.downloads && hubPage.downloads.length > 0

  return (
    <main className="min-h-screen bg-background">
      {/* ── HERO: Robust Cinematic Fallback ── */}
      {/* Cấu trúc đảm bảo: 
          1. Aspect ratio luôn ổn nhờ object-cover
          2. Không dính chữ vào ảnh do có overlay rất dày (bg-background/80)
          3. Giới hạn độ dài text tránh overflow */}
      <div className="relative overflow-hidden border-b border-gold/10 bg-gradient-to-b from-card/70 to-background">
        {hubPage.coverImage ? (() => {
          const imgSrc = getStrapiMediaUrl(
            hubPage.coverImage!.formats?.large?.url ?? hubPage.coverImage!.url
          )
          return imgSrc ? (
            <>
              <Image
                src={imgSrc}
                alt={hubPage.coverImage!.alternativeText ?? hubPage.title ?? 'Cover'}
                fill
                className="object-cover scale-105 opacity-[0.08] transition-transform duration-1000"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/80 to-background pointer-events-none" />
            </>
          ) : null
        })() : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold/10 via-background to-background" />
        )}

        <div className="container relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-gold">
            Chuyện Cộng Đồng
          </p>

          <h1 className="mb-4 break-words font-display text-4xl leading-tight text-foreground md:text-5xl">
            {hubPage.title || 'Chưa Đặt Tiêu Đề'}
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {hubPage.description || 'Nội dung mô tả đang được cập nhật...'}
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-24">
        {/* ── Featured Reading (Editorial grid) ── */}
        {hasCuratedPosts && hubPage.curated_posts!.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10">
              <span className="h-px bg-gold/30 w-12" />
              <h2 className="ant-title text-2xl tracking-tight text-foreground md:text-3xl">Từ Cộng Đồng</h2>
            </div>

            {/* Featured (first post) */}
            {(() => {
              const featured = hubPage.curated_posts![0]
              const thumbUrl = featured.thumbnail
                ? getStrapiMediaUrl(featured.thumbnail.formats?.large?.url ?? featured.thumbnail.url)
                : null
              return (
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group mb-8 block overflow-hidden rounded-xl border border-border bg-card transition-all duration-500 hover:border-gold/30 hover:shadow-ant"
                >
                  <div className="flex flex-col md:flex-row min-h-[300px]">
                    {thumbUrl ? (
                      <div className="md:w-1/2 relative bg-secondary">
                        <Image
                          src={thumbUrl}
                          alt={featured.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-card to-transparent/20 opacity-90 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="md:w-1/3 bg-secondary/30 flex items-center justify-center p-8 border-r border-border">
                        <BookOpen className="w-8 h-8 text-gold/20" />
                      </div>
                    )}

                    <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-card md:bg-transparent">
                      <p className="text-xs font-bold tracking-widest text-gold uppercase mb-3 drop-shadow-sm">
                        {featured.publishedAt ? new Date(featured.publishedAt).toLocaleDateString('vi-VN') : 'Mới nhất'}
                      </p>
                      <h3 className="ant-title mb-4 break-words text-2xl leading-snug text-foreground transition-colors group-hover:text-gold md:text-3xl">
                        {featured.title}
                      </h3>
                      {featured.excerpt && (
                        <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 mb-6">
                          {featured.excerpt}
                        </p>
                      )}

                      <p className="text-xs font-semibold uppercase tracking-widest text-gold/60 mt-auto flex items-center gap-2 group-hover:text-gold transition-all">
                        Đọc câu chuyện <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })()}

            {/* Secondary posts (next 2) */}
            {hubPage.curated_posts!.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {hubPage.curated_posts!.slice(1, 4).map((post) => {
                  const thumbUrl = post.thumbnail
                    ? getStrapiMediaUrl(post.thumbnail.formats?.small?.url ?? post.thumbnail.url)
                    : null
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-500 hover:border-gold/30 hover:bg-gold/5 hover:shadow-ant"
                    >
                      {thumbUrl && (
                        <div className="shrink-0 w-full h-48 relative overflow-hidden bg-muted">
                          <Image
                            src={thumbUrl}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <p className="text-[10px] font-bold tracking-widest text-gold/50 uppercase mb-3">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                        </p>
                        <h3 className="ant-title mb-4 line-clamp-3 text-lg leading-snug text-foreground transition-colors group-hover:text-gold md:text-xl">
                          {post.title}
                        </h3>
                        <p className="text-xs font-semibold text-muted-foreground mt-auto flex justify-end">
                          Đọc thêm →
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Dynamic Blocks ── */}
        {hubPage.blocks && hubPage.blocks.length > 0 && (
          <section>
            <HubBlockRenderer blocks={hubPage.blocks} />
          </section>
        )}

        {/* ── Hub Sections (Links) ── */}
        {hubPage.sections && hubPage.sections.length > 0 && (
          <div className="space-y-20 pt-10">
            {hubPage.sections.map((section) => (
              <HubSection key={section.id} section={section} />
            ))}
          </div>
        )}

        {/* ── Downloads ── */}
        {hasDownloads && (
          <section className="pt-20 border-t border-gold/10">
            <div className="flex items-center gap-4 mb-10">
              <span className="h-px bg-gold/30 w-12" />
              <h2 className="ant-title text-2xl text-foreground md:text-3xl">Học Tập Thêm</h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-ant">
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
