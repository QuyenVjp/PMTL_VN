// components/hub/HubLinkCard.tsx — Server component
// Renders a single hub link — Visual: Phật giáo, vàng/trầm, tĩnh mà sang
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLinkIcon, ArrowRightIcon } from 'lucide-react'
import type { HubLink } from '@/types/strapi'
import { getStrapiMediaUrl } from '@/lib/strapi'
import { cn } from '@/lib/utils'

interface HubLinkCardProps {
  link: HubLink
  theme?: 'teaching' | 'practice' | 'story' | 'reference' | null
}

export default function HubLinkCard({ link, theme }: HubLinkCardProps) {
  const thumbnailUrl = link.thumbnail
    ? getStrapiMediaUrl(link.thumbnail.formats?.small?.url ?? link.thumbnail.url)
    : null

  const normalizedUrl = (link.url ?? '').trim()
  const isExternal = link.kind === 'external' || /^https?:\/\//i.test(normalizedUrl)
  const internalHref =
    normalizedUrl.startsWith('/')
      ? normalizedUrl
      : /^[A-Za-z0-9/_-]+$/.test(normalizedUrl)
        ? `/${normalizedUrl}`
        : null

  // Card personality theo theme
  const getThemeClass = () => {
    switch (theme) {
      case 'story': return 'rounded-xl border-border hover:border-gold/25 hover:shadow-ant'
      case 'teaching': return 'rounded-sm border-gold/20 hover:border-gold/60'
      case 'practice': return 'rounded-xl border-border bg-stone-50/50 dark:bg-stone-900/20'
      case 'reference': return 'rounded-lg border-border hover:bg-secondary/50'
      default: return 'rounded-xl border-border'
    }
  }

  const wrapperClass = cn(
    'group flex flex-col overflow-hidden border bg-card transition-all duration-300 hover:shadow-ant',
    getThemeClass()
  )

  const inner = (
    <>
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="relative w-full aspect-video overflow-hidden bg-muted">
          <Image
            src={thumbnailUrl}
            alt={link.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* vignette nhẹ khi hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4">

        {/* context tag nếu không có thumbnail */}
        {!thumbnailUrl && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold/50 mb-2">
            {isExternal ? 'Liên Kết Ngoài' : internalHref ? 'Bài Viết' : 'Liên Kết CMS'}
          </span>
        )}

        {/* title — phân cấp rõ */}
        <h3 className="ant-title mb-1.5 text-sm leading-snug text-foreground transition-colors group-hover:text-gold line-clamp-2 md:text-base">
          {link.title}
        </h3>

        {/* subtitle / description */}
        {link.description && (
          <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-3 mb-3 flex-1 italic">
            {link.description}
          </p>
        )}

        {/* CTA — sang, nhẹ */}
        <div
          className={cn(
            'inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors mt-auto pt-3 border-t border-border/40',
            'text-muted-foreground/50 group-hover:text-gold'
          )}
        >
          {isExternal ? (
            <>
              Xem thêm <ExternalLinkIcon className="w-3 h-3" />
            </>
          ) : (
            <>
              Đọc tiếp <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </div>
      </div>
    </>
  )

  if (!normalizedUrl || (!isExternal && !internalHref)) {
    return <div className={wrapperClass}>{inner}</div>
  }

  return isExternal ? (
    <a
      href={normalizedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={wrapperClass}
    >
      {inner}
    </a>
  ) : (
    <Link href={internalHref as string} className={wrapperClass}>
      {inner}
    </Link>
  )
}
