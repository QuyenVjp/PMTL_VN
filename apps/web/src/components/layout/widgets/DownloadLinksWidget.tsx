// components/layout/widgets/DownloadLinksWidget.tsx — Server component
import { DownloadIcon } from 'lucide-react'
import type { QuickLink } from '@/types/strapi'

interface DownloadLinksWidgetProps {
  links: QuickLink[]
}

export default function DownloadLinksWidget({ links }: DownloadLinksWidgetProps) {
  const validLinks = (links ?? []).filter((link) => link?.url)
  if (validLinks.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-gold/80">
        <DownloadIcon className="w-3.5 h-3.5" />
        Tài liệu tải về
      </h3>
      <ul className="space-y-2">
        {validLinks.map((link, i) => (
          <li key={i}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-[1.25rem] bg-background/70 px-4 py-3 text-sm text-foreground transition-colors hover:bg-background"
            >
              <DownloadIcon className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50 group-hover:text-gold/60 transition-colors" />
              <span className="line-clamp-1">{link.title?.trim() || `Tài liệu ${i + 1}`}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
