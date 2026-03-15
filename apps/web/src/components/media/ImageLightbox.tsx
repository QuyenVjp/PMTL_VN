'use client'

import { useMemo } from 'react'
import { CalendarDays, Camera, MapPin, User } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Download from 'yet-another-react-lightbox/plugins/download'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export interface ImageLightboxItem {
  id: string
  src: string
  alt?: string
  title: string
  description?: string | null
  category?: string | null
  shotDate?: string | null
  location?: string | null
  device?: string | null
  photographer?: string | null
  tags?: string[]
  downloadUrl?: string
}

interface ImageLightboxProps {
  items: ImageLightboxItem[]
  open: boolean
  index: number
  onClose: () => void
  onIndexChange?: (nextIndex: number) => void
  onTagClick?: (tag: string) => void
}

function formatDate(date: string | null | undefined) {
  if (!date) return 'Chưa cập nhật'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function ImageLightbox({
  items,
  open,
  index,
  onClose,
  onIndexChange,
  onTagClick,
}: ImageLightboxProps) {
  const itemsBySrc = useMemo(
    () => new Map(items.map((item) => [item.src, item])),
    [items],
  )

  const slides = useMemo(
    () =>
      items.map((item) => ({
        src: item.src,
        alt: item.alt || item.title,
        title: item.title,
        description: item.description || undefined,
        download: {
          url: item.downloadUrl || item.src,
          filename: `pmtl-gallery-${item.id}.jpg`,
        },
      })),
    [items],
  )

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index >= 0 ? index : 0}
      slides={slides}
      plugins={[Fullscreen, Zoom, Thumbnails, Download]}
      controller={{ closeOnBackdropClick: true }}
      carousel={{ preload: 2 }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        wheelZoomDistanceFactor: 120,
        pinchZoomDistanceFactor: 120,
      }}
      thumbnails={{
        position: 'bottom',
        borderRadius: 8,
        vignette: false,
      }}
      styles={{
        container: { backgroundColor: 'rgba(15, 10, 7, 0.95)' },
      }}
      on={{
        view: ({ index: nextIndex }) => onIndexChange?.(nextIndex),
      }}
      render={{
        slideFooter: ({ slide }) => {
          const src = 'src' in slide ? String(slide.src ?? '') : ''
          const item = itemsBySrc.get(src)
          if (!item) return null

          return (
            <div className="pointer-events-auto mx-auto w-full max-w-3xl px-3 pb-3 md:px-0">
              <div className="rounded-lg border border-white/10 bg-black/55 p-4 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  {item.category ? <Badge variant="sacred">{item.category}</Badge> : null}
                </div>
                <h3 className="ant-title mt-3 text-2xl leading-tight text-white md:text-3xl">{item.title}</h3>
                {item.description ? (
                  <p className="mt-3 text-sm leading-7 text-white/75 md:text-base">{item.description}</p>
                ) : null}
                <Separator className="my-4 bg-white/10" />
                <div className="grid gap-2 text-sm text-white/80 md:grid-cols-2">
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-gold" />
                    {formatDate(item.shotDate)}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <MapPin className="size-4 text-gold" />
                    {item.location || 'Đang cập nhật'}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Camera className="size-4 text-gold" />
                    {item.device || 'Đang cập nhật'}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <User className="size-4 text-gold" />
                    {item.photographer || 'Ban Truyền Thông PMTL'}
                  </p>
                </div>
                {item.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onTagClick?.(tag)}
                        className="h-8 rounded-md border-white/20 bg-white/5 text-white/85 hover:border-gold/40 hover:text-gold"
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )
        },
      }}
    />
  )
}
