// components/layout/widgets/SocialLinksWidget.tsx — Server component
import Image from 'next/image'
import { getStrapiMediaUrl } from '@/lib/strapi'
import { resolveIconToken } from '@/lib/ui-icons'
import type { CmsSocialLink, StrapiMedia, UiIconValue } from '@/types/strapi'

interface SocialLinksWidgetProps {
  socialLinks: CmsSocialLink[]
  qrImages?: StrapiMedia[] | null
}

// Map iconName to a simple SVG path or a recognizable character fallback
function SocialIcon({ icon, legacyName }: { icon: UiIconValue; legacyName?: string | null }) {
  const token = String(resolveIconToken(icon) ?? legacyName ?? '').toLowerCase()
  if (!token) return null
  const n = token
  if (n.includes('facebook')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    )
  }
  if (n.includes('youtube')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M21.8 8.001a2.75 2.75 0 0 0-1.934-1.949C18.2 5.6 12 5.6 12 5.6s-6.2 0-7.866.452A2.75 2.75 0 0 0 2.2 8.001 28.82 28.82 0 0 0 1.75 12a28.82 28.82 0 0 0 .45 3.999 2.75 2.75 0 0 0 1.934 1.946C5.8 18.4 12 18.4 12 18.4s6.2 0 7.866-.455a2.75 2.75 0 0 0 1.934-1.946A28.82 28.82 0 0 0 22.25 12a28.82 28.82 0 0 0-.45-3.999zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    )
  }
  if (n.includes('zalo')) {
    return <span className="text-xs font-bold leading-none">ZL</span>
  }
  // Generic fallback
  return <span className="text-xs font-medium leading-none">{token.slice(0, 2).toUpperCase()}</span>
}

export default function SocialLinksWidget({ socialLinks, qrImages }: SocialLinksWidgetProps) {
  const normalizedSocialLinks = (socialLinks ?? [])
    .filter((link) => link?.url)
    .map((link, index) => {
      const fallbackLabel = (() => {
        try {
          return new URL(link.url).hostname.replace(/^www\./, '')
        } catch {
          return `Kênh ${index + 1}`
        }
      })()

      return {
        ...link,
        label: link.label?.trim() || fallbackLabel,
      }
    })

  const hasSocial = normalizedSocialLinks.length > 0
  const hasQr = qrImages && qrImages.length > 0

  if (!hasSocial && !hasQr) return null

  return (
    <div>
      {hasSocial && (
        <>
          <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-gold/80">
            Mạng xã hội
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {normalizedSocialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                title={link.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:text-foreground"
              >
                <SocialIcon icon={link.icon} legacyName={link.iconName} />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </>
      )}

      {hasQr && (
        <>
          <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-gold/80">
            QR tham gia
          </h3>
          <div className="flex flex-wrap gap-3">
            {qrImages!.map((img) => {
              const rawUrl = img.formats?.thumbnail?.url ?? img.url
              const src = rawUrl ? getStrapiMediaUrl(rawUrl) : null
              if (!src) return null
              return (
                <div key={img.id} className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-white">
                  <Image
                    src={src}
                    alt={img.alternativeText ?? 'QR Code'}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
