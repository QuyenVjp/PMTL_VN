// components/hub/layouts/HubPracticeLayout.tsx
// Practice theme: clear, structured, instructional
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi-helpers'
import type { HubPage } from '@/types/strapi'
import { CheckCircle2, Download } from 'lucide-react'
import HubBlockRenderer from '../HubBlockRenderer'
import HubSection from '../HubSection'
import DownloadRow from '../DownloadRow'

interface HubPracticeLayoutProps {
  hubPage: HubPage
}

export default function HubPracticeLayout({ hubPage }: HubPracticeLayoutProps) {
  const hasDownloads = hubPage.downloads && hubPage.downloads.length > 0

  return (
    <main className="min-h-screen bg-background">
      {/* ── HERO: Start-aligned, Instructional Tone, Heavy dimming ── */}
      <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-card/70 to-background">
        {hubPage.coverImage && (() => {
          const imgSrc = getStrapiMediaUrl(
            hubPage.coverImage!.formats?.large?.url ?? hubPage.coverImage!.url
          )
          return imgSrc ? (
            <>
              <div className="absolute inset-0">
                <Image
                  src={imgSrc}
                  alt={hubPage.title || 'Thực hành'}
                  fill
                  className="object-cover opacity-[0.08] mix-blend-overlay dark:mix-blend-luminosity grayscale-[50%]"
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none" />
            </>
          ) : null
        })()}

        <div className="container relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-20">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-gold">
            <CheckCircle2 className="w-4 h-4" />
            Hướng Dẫn Thực Hành
          </p>

          <h1 className="mb-4 max-w-2xl break-words font-display text-4xl leading-tight text-foreground md:text-5xl">
            {hubPage.title || '[Chưa Cập Nhật Tên]'}
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {hubPage.description || 'Nội dung hướng dẫn chi tiết đang chờ duyệt...'}
          </p>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-6 py-16 md:py-24 space-y-20">
        {/* ── Dynamic Blocks (instruction steps/text) ── */}
        {hubPage.blocks && hubPage.blocks.length > 0 && (
          <section>
            <HubBlockRenderer blocks={hubPage.blocks} />
          </section>
        )}

        {/* ── Hub Sections (Tools, Checklists) ── */}
        {hubPage.sections && hubPage.sections.length > 0 && (
          <div className="space-y-16">
            {hubPage.sections.map((section) => (
              <HubSection key={section.id} section={section} />
            ))}
          </div>
        )}

        {/* ── Downloads (Practice sheets) ── */}
        {hasDownloads && (
          <section className="pt-20 border-t border-border/50">
            <div className="flex items-center gap-3 mb-10">
              <span className="h-6 w-1.5 rounded-sm bg-gold" />
              <h2 className="ant-title text-2xl text-foreground md:text-3xl">Mẫu Biểu Thiết Yếu</h2>
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
