// components/hub/layouts/HubReferenceLayout.tsx
// Reference theme: academic, index-like, minimal decoration
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import type { HubPage } from '@/types/strapi'
import { Library, Download } from 'lucide-react'
import HubBlockRenderer from '../HubBlockRenderer'
import HubSection from '../HubSection'
import DownloadRow from '../DownloadRow'

interface HubReferenceLayoutProps {
  hubPage: HubPage
}

export default function HubReferenceLayout({ hubPage }: HubReferenceLayoutProps) {
  const hasDownloads = hubPage.downloads && hubPage.downloads.length > 0

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-card/70 to-background">
        {hubPage.coverImage && (() => {
          const imgSrc = getStrapiMediaUrl(
            hubPage.coverImage!.formats?.large?.url ?? hubPage.coverImage!.url
          )
          return imgSrc ? (
            <div className="pointer-events-none absolute inset-0 right-0 hidden w-1/2 opacity-[0.04] md:block">
              <Image
                src={imgSrc}
                alt={hubPage.title || 'Tra cứu'}
                fill
                className="object-cover object-right mix-blend-overlay grayscale"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
            </div>
          ) : null
        })()}

        <div className="container relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold/80">
              <Library className="w-3.5 h-3.5" /> Tra Cứu
            </div>

            <h1 className="mb-4 break-words font-display text-4xl leading-tight text-foreground md:text-5xl">
              {hubPage.title || 'Tu Thư Cổ'}
            </h1>

            {hubPage.description && (
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {hubPage.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-16 md:py-20 space-y-24">
        {/* ── Hub Sections (Index list/folders) ── */}
        {hubPage.sections && hubPage.sections.length > 0 && (
          <div className="space-y-16">
            {hubPage.sections.map((section) => (
              <HubSection key={section.id} section={section} />
            ))}
          </div>
        )}

        {/* ── Dynamic Blocks ── */}
        {hubPage.blocks && hubPage.blocks.length > 0 && (
          <section className="pt-8 border-t border-dashed border-border/70">
            <HubBlockRenderer blocks={hubPage.blocks} />
          </section>
        )}

        {/* ── Downloads Archives ── */}
        {hasDownloads && (
          <section className="pt-16 border-t-[3px] border-border">
            <div className="flex items-center gap-3 mb-8">
              <Download className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-sans font-bold text-xl md:text-2xl text-foreground">Kho Tàng Lưu Trữ</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
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
