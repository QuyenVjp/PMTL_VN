'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import type { BlogPost, StrapiEvent } from '@/types/strapi'
import type { ProgressMap, TodayChantResponse } from '@/lib/api/chanting'
import {
  findNextPendingChantItem,
  loadLocalChantProgress,
  summarizeChantProgress,
} from '@/lib/chanting-progress'
import { BookOpen, CalendarDays, ChevronRight, Flame, Moon, ScrollText } from 'lucide-react'
import { formatDateVN, timeAgo, truncate } from '@/lib/strapi-helpers'

interface Props {
  todayChant: TodayChantResponse
  isoDate: string
  solarLabel: string
  lunarLabel: string
  recommendedPosts: BlogPost[]
  upcomingEvents: StrapiEvent[]
}

export default function TodayPracticeOverview({
  todayChant,
  isoDate,
  solarLabel,
  lunarLabel,
  recommendedPosts,
  upcomingEvents,
}: Props) {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ProgressMap>({})
  const [progressLoaded, setProgressLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProgress() {
      if (user) {
        try {
          const res = await fetch(`/api/practice-log?date=${isoDate}&planSlug=${todayChant.planSlug}`, {
            cache: 'no-store',
          })
          const data = res.ok ? await res.json() : null
          if (!cancelled) {
            setProgress(data?.itemsProgress ?? {})
            setProgressLoaded(true)
          }
          return
        } catch {}
      }

      if (!cancelled) {
        setProgress(loadLocalChantProgress(isoDate, todayChant.planSlug))
        setProgressLoaded(true)
      }
    }

    void loadProgress()

    return () => {
      cancelled = true
    }
  }, [isoDate, todayChant.planSlug, user])

  const summary = useMemo(
    () => summarizeChantProgress(todayChant.items, progress),
    [progress, todayChant.items]
  )
  const nextItem = useMemo(
    () => findNextPendingChantItem(todayChant.items, progress),
    [progress, todayChant.items]
  )
  const primaryPost = recommendedPosts[0] ?? null

  return (
    <section className="mb-10 space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-gold">
            <CalendarDays className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Hôm Nay</span>
          </div>
          <p className="text-lg font-semibold text-foreground">{solarLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">{lunarLabel}</p>
          {todayChant.todayEvents.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {todayChant.todayEvents.slice(0, 3).map((event) => (
                <span
                  key={event.documentId}
                  className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400"
                >
                  {event.title}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Không có ngày vía hoặc sự kiện âm lịch đặc biệt.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-gold">
            <Flame className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Công Khóa</span>
          </div>
          <p className="text-lg font-semibold text-foreground">
            {summary.completedItems}/{summary.totalItems} bài
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.totalTarget > 0
              ? `${summary.completedTarget}/${summary.totalTarget} biến mục tiêu`
              : `${summary.totalCount} biến đã ghi nhận`}
          </p>
          {progressLoaded && nextItem ? (
            <Link
              href={`/niem-kinh?plan=${todayChant.planSlug}&item=${nextItem.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold transition-colors hover:text-amber-500"
            >
              Tiếp tục: {nextItem.title}
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              {progressLoaded ? 'Hôm nay đã hoàn tất toàn bộ công khóa.' : 'Đang tải tiến độ tu học...'}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-gold">
            <Moon className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Sắp Tới</span>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 2).map((event) => (
                <Link
                  key={event.documentId}
                  href={`/events/${event.slug}`}
                  className="block rounded-lg border border-border/70 bg-background/60 px-3 py-2 transition-colors hover:border-gold/30"
                >
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateVN(event.date)}{event.location ? ` · ${event.location}` : ''}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có sự kiện sắp tới được đăng tải.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-gold">
            <BookOpen className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Bài Nên Đọc Hôm Nay</span>
          </div>
          {primaryPost ? (
            <div className="space-y-3">
              <Link href={`/blog/${primaryPost.slug}`} className="block rounded-xl border border-border/80 bg-background/60 p-4 transition-colors hover:border-gold/30">
                <p className="text-lg font-semibold text-foreground">{primaryPost.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {truncate(primaryPost.excerpt || primaryPost.content, 180)}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {primaryPost.publishedAt ? `Cập nhật ${timeAgo(primaryPost.publishedAt)}` : 'Bài đọc gợi ý theo ngày hôm nay'}
                </p>
              </Link>
              {recommendedPosts.length > 1 && (
                <div className="grid gap-2 md:grid-cols-2">
                  {recommendedPosts.slice(1, 3).map((post) => (
                    <Link
                      key={post.documentId}
                      href={`/blog/${post.slug}`}
                      className="rounded-lg border border-border/70 bg-background/50 px-3 py-3 transition-colors hover:border-gold/25"
                    >
                      <p className="text-sm font-medium text-foreground">{post.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{truncate(post.excerpt || post.content, 90)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có bài đọc gợi ý cho ngày hôm nay.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-gold">
            <ScrollText className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Nhịp Tu Học</span>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Mở công khóa tại trang này, niệm đến đâu thì hệ thống sẽ giữ đúng tiến độ hôm nay.</p>
            <p>Nếu đang đăng nhập, tiến độ được đồng bộ qua bản ghi tu học. Nếu chưa đăng nhập, tiến độ vẫn được ghi nhớ trên trình duyệt này.</p>
            <p>Trong ngày có sự kiện âm lịch đặc biệt, bài khai thị liên kết và công khóa ưu tiên sẽ được đưa lên phía trên.</p>
          </div>
          <div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-foreground">
            {nextItem ? `Bước tiếp theo: ${nextItem.title}` : 'Hôm nay anh đã hoàn thành toàn bộ các bài đang có.'}
          </div>
        </div>
      </div>
    </section>
  )
}
