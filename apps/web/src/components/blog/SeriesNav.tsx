// components/blog/SeriesNav.tsx — Server Component
// Hiển thị metadata chuyên đề + điều hướng Trước/Tiếp trong chuỗi bài.
import Link from 'next/link'
import { BookOpenIcon, MapPinIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { SeriesData, BlogPost } from '@/types/strapi'

interface SeriesNavProps {
  post: BlogPost
  seriesData: SeriesData | null
}

export default function SeriesNav({ post, seriesData }: SeriesNavProps) {
  if (!post.seriesKey) return null

  const prev = seriesData?.meta.prev ?? null
  const next = seriesData?.meta.next ?? null
  const allPosts = seriesData?.data ?? []
  const totalInSeries = allPosts.length

  return (
    <div className="mb-8 rounded-2xl bg-gold/5 border border-gold/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gold/10 flex items-center gap-3">
        <BookOpenIcon className="w-4 h-4 text-gold shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">Chuyên đề</p>
          <p className="font-display text-base text-foreground leading-snug">{post.seriesKey}</p>
        </div>
        {post.seriesNumber && totalInSeries > 0 && (
          <span className="ml-auto shrink-0 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-1">
            Bài {post.seriesNumber} / {totalInSeries}
          </span>
        )}
      </div>

      {/* Event meta */}
      {(post.eventDate || post.location) && (
        <div className="px-5 py-3 flex flex-wrap gap-x-5 gap-y-1 border-b border-gold/10">
          {post.eventDate && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="w-3.5 h-3.5 text-gold/60" />
              {new Date(post.eventDate).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          )}
          {post.location && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPinIcon className="w-3.5 h-3.5 text-gold/60" />
              {post.location}
            </span>
          )}
        </div>
      )}

      {/* Prev / Next */}
      {(prev || next) && (
        <div className="grid grid-cols-2 divide-x divide-gold/10">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-gold/5 transition-colors group"
            >
              <ChevronLeftIcon className="w-4 h-4 mt-0.5 shrink-0 text-gold/60 group-hover:text-gold transition-colors" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Bài {prev.seriesNumber ?? ''}
                </p>
                <p className="text-sm text-foreground/80 group-hover:text-foreground line-clamp-2 transition-colors">
                  {prev.title}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-gold/5 transition-colors group text-right"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">
                  Bài {next.seriesNumber ?? ''}
                </p>
                <p className="text-sm text-foreground/80 group-hover:text-foreground line-clamp-2 transition-colors">
                  {next.title}
                </p>
              </div>
              <ChevronRightIcon className="w-4 h-4 mt-0.5 shrink-0 text-gold/60 group-hover:text-gold transition-colors" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  )
}
