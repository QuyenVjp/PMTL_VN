'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarClock, MessageSquareMore, Newspaper, Sparkles } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'

type NotificationItem = {
  documentId: string
  kind: string
  title: string
  body: string
  url?: string | null
  createdAt?: string | null
}

const KIND_META: Record<string, { label: string; icon: typeof Bell }> = {
  community: { label: 'Diễn đàn', icon: MessageSquareMore },
  content_update: { label: 'Kho nội dung', icon: Newspaper },
  event_reminder: { label: 'Sự kiện & lịch tu', icon: CalendarClock },
  daily_chant: { label: 'Tu học hằng ngày', icon: Bell },
  broadcast: { label: 'Thông báo chung', icon: Sparkles },
}

const STORAGE_KEY = 'pmtl_read_notifications'

function formatTime(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getReadIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

function saveIds(ids: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 200)))
}

function normalizeNotificationUrl(url?: string | null) {
  if (!url) return '/thong-bao'
  if (url.startsWith('/shares/')) {
    const slug = url.replace('/shares/', '').trim()
    return slug ? `/shares?post=${encodeURIComponent(slug)}` : '/shares'
  }
  return url
}

export default function NotificationMenu({ mobile = false }: { mobile?: boolean }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([])

  useBodyScrollLock(open)

  useEffect(() => {
    setReadNotificationIds(getReadIds())
    fetch('/api/notifications?limit=8', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((data) => setItems(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setItems([]))
  }, [])

  const unreadCount = useMemo(
    () => items.filter((item) => !readNotificationIds.includes(item.documentId)).length,
    [items, readNotificationIds]
  )

  const markAsRead = (ids: string[]) => {
    const next = Array.from(new Set([...readNotificationIds, ...ids]))
    setReadNotificationIds(next)
    saveIds(next)
  }

  if (mobile) {
    return (
      <Link href="/thong-bao" className="flex items-center justify-between border-b border-border/50 px-2 py-3 text-base font-medium text-foreground">
        <span>Thông Báo</span>
        {unreadCount > 0 ? (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-2 text-xs font-semibold text-black">
            {unreadCount}
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <TooltipProvider>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="relative flex size-9 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground transition-all duration-200 hover:border-gold/25 hover:text-foreground"
                aria-label="Mở thông báo"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-black">
                    {Math.min(unreadCount, 9)}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Thông báo mới</TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          align="end"
          sideOffset={10}
          className="overlay-shell w-[calc(100vw-1rem)] max-w-[23.5rem] overflow-hidden p-0"
        >
          <DropdownMenuLabel className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold-dim">Thông báo</p>
                <p className="mt-1 text-xs text-muted-foreground">Chỉ hiện nhắc việc cần thiết, không làm phiền quá mức.</p>
              </div>
              {unreadCount > 0 ? (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-gold px-2 text-xs font-semibold text-black">
                  {unreadCount}
                </span>
              ) : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <ScrollArea
            className="h-[min(22rem,calc(100vh-9rem))] overscroll-contain"
            data-lenis-prevent
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="p-2">
              {items.length === 0 ? (
                <div className="rounded-md border border-dashed border-border/80 bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
                  Chưa có thông báo nào.
                </div>
              ) : (
                items.slice(0, 6).map((item) => {
                  const meta = KIND_META[item.kind] || { label: 'Thông báo', icon: Bell }
                  const Icon = meta.icon
                  const unread = !readNotificationIds.includes(item.documentId)
                  return (
                    <Link
                      key={item.documentId}
                      href={normalizeNotificationUrl(item.url)}
                      onClick={() => markAsRead([item.documentId])}
                      className="overlay-row"
                    >
                      <div className="overlay-icon-shell">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold-dim">
                            {meta.label}
                          </span>
                          {unread ? <span className="size-2 rounded-full bg-gold" /> : null}
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.body}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">{formatTime(item.createdAt)}</p>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </ScrollArea>

          <DropdownMenuSeparator />
          <div className="p-3">
            <Link
              href="/thong-bao"
              onClick={() => markAsRead(items.map((item) => item.documentId))}
              className="flex items-center justify-center rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-gold/25 hover:text-gold-dim"
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
