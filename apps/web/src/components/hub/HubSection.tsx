// components/hub/HubSection.tsx — Server component
// Renders a single HubSection: heading + description + links grid
// Visual language: Phật giáo, trang nghiêm, nhịp điệu thị giác rõ ràng
import type { HubSection as HubSectionType } from '@/types/strapi'
import HubLinkCard from './HubLinkCard'
import { BookOpen, FolderOpen, Flame, LayoutGrid } from 'lucide-react'

interface HubSectionProps {
  section: HubSectionType
  theme?: 'teaching' | 'practice' | 'story' | 'reference' | null
}

export default function HubSection({ section, theme }: HubSectionProps) {
  // Config header theo theme
  const getHeaderStyle = () => {
    switch (theme) {
      case 'story': return {
        badgePrefix: <Flame className="w-3.5 h-3.5" />,
        badgeText: 'Hồi Ức / Chuyện Kể',
        divider: 'h-px bg-gradient-to-r from-gold/30 via-gold/10 to-transparent max-w-sm',
        headingClass: 'italic font-serif'
      }
      case 'teaching': return {
        badgePrefix: <BookOpen className="w-3.5 h-3.5" />,
        badgeText: 'Giáo Pháp',
        divider: 'h-px bg-gold/20 w-full',
        headingClass: ''
      }
      case 'practice': return {
        badgePrefix: <div className="h-2 w-2 rounded-sm border border-gold/60" />,
        badgeText: 'Tu Tập',
        divider: 'h-1 w-12 rounded-md bg-gold/30',
        headingClass: 'tracking-tight'
      }
      case 'reference': return {
        badgePrefix: <FolderOpen className="w-3.5 h-3.5" />,
        badgeText: 'Tra Cứu',
        divider: 'h-px bg-border/80 w-full',
        headingClass: ''
      }
      default: return {
        badgePrefix: <LayoutGrid className="w-3 h-3" />,
        badgeText: 'Chuyên Mục',
        divider: 'h-px bg-gradient-to-r from-gold/20 via-gold/10 to-transparent',
        headingClass: ''
      }
    }
  }

  const style = getHeaderStyle()

  return (
    <section>
      {/* ── Section Header — có nhịp điệu, badge, divider ── */}
      <div className="mb-8">
        {/* eyebrow badge */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gold/60">{style.badgePrefix}</span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/60">
            {style.badgeText}
          </p>
        </div>

        {/* heading chính */}
        <h2 className={`ant-title mb-2 pl-4 text-xl leading-snug text-foreground md:text-2xl ${style.headingClass}`}>
          {section.heading}
        </h2>

        {/* description dưới heading */}
        {section.description && (
          <p className="mb-4 max-w-prose border-l border-gold/20 pl-4 text-sm leading-relaxed text-muted-foreground">
            {section.description}
          </p>
        )}

        {/* divider bespoke */}
        <div className={`mt-4 ${style.divider}`} />
      </div>

      {/* ── Links Grid / Structural Layout ── */}
      {section.links && section.links.length > 0 ? (
        <div className={
          theme === 'story' ? 'grid grid-cols-1 md:grid-cols-2 gap-8' :
            theme === 'reference' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3' :
              theme === 'practice' ? 'flex flex-col gap-4' :
                'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' // Default / teaching
        }>
          {section.links.map((link, index) => (
            <div key={link.id} className={theme === 'practice' ? 'flex items-center gap-4 rounded-lg border border-border bg-card p-4' : ''}>
              {theme === 'practice' && (
                <div className="ant-number flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gold/5 text-gold/60">
                  {index + 1}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <HubLinkCard link={link} theme={theme} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/60 italic pl-4">Chưa có liên kết nào.</p>
      )}
    </section>
  )
}
