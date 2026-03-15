'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Bell, CalendarClock, MessageSquareMore, Newspaper, Sparkles } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { PAGINATION, getPaginationRange } from '@/lib/config/pagination'
import type { PushJobRecord } from '@/lib/push-server'

const STORAGE_KEY = 'pmtl_read_notifications'
const KIND_META: Record<string, { label: string; icon: typeof Bell }> = {
  community: { label: 'Diễn đàn', icon: MessageSquareMore },
  content_update: { label: 'Kho nội dung', icon: Newspaper },
  event_reminder: { label: 'Sự kiện & lịch tu', icon: CalendarClock },
  daily_chant: { label: 'Tu học hằng ngày', icon: Bell },
  broadcast: { label: 'Thông báo chung', icon: Sparkles },
}
const FILTERS = ['Tất cả', 'Diễn đàn', 'Kho nội dung', 'Sự kiện & lịch tu', 'Tu học hằng ngày', 'Thông báo chung']

function formatTime(value?: string | null) {
  if (!value) return ''
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function readIds() {
  if (typeof window === 'undefined') return [] as string[]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return [] as string[]
  }
}

function saveIds(ids: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 300)))
}

function normalizeNotificationUrl(url?: string | null) {
  if (!url) return '/'
  if (url.startsWith('/shares/')) {
    const slug = url.replace('/shares/', '').trim()
    return slug ? `/shares?post=${encodeURIComponent(slug)}` : '/shares'
  }
  return url
}

export default function NotificationsHubClient({ initialItems }: { initialItems: PushJobRecord[] }) {
  const [activeFilter, setActiveFilter] = useState('Tất cả')
  const [currentPage, setCurrentPage] = useState(1)
  const [read, setRead] = useState<string[]>([])

  useEffect(() => {
    setRead(readIds())
  }, [])

  const filtered = useMemo(() => {
    if (activeFilter === 'Tất cả') return initialItems
    return initialItems.filter((item) => (KIND_META[item.kind]?.label || 'Thông báo') === activeFilter)
  }, [activeFilter, initialItems])

  const pageSize = PAGINATION.SEARCH_PAGE_SIZE
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  useEffect(() => {
    const ids = pageItems.map((item) => item.documentId)
    if (ids.length === 0) return
    const next = Array.from(new Set([...readIds(), ...ids]))
    setRead(next)
    saveIds(next)
  }, [safePage, activeFilter])

  return (
    <section className="space-y-6">
      <div className="route-hero-left border-b border-border/60 pb-5">
        <p className="route-kicker">Thông Báo</p>
        <h1 className="route-title text-3xl md:text-4xl lg:text-5xl">Danh sách thông báo</h1>
        <p className="route-copy">
          Giao diện đọc lại tối giản. Chỉ hiện những gì cần đọc, dễ bấm, dễ nhìn cho người lớn tuổi và không dồn dập.
        </p>
        <div className="pt-2">
          <Link href="/profile" className="section-link rounded-md border border-border bg-background px-4 py-2.5 hover:border-gold/25">
            Về hồ sơ & cài đặt nhận tin
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter)
              setCurrentPage(1)
            }}
            className={`filter-chip text-sm ${
              activeFilter === filter
                ? 'filter-chip-active'
                : 'filter-chip-idle'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overlay-shell overflow-hidden">
        <div className="divide-y divide-border/60">
          {pageItems.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">Chưa có thông báo trong nhóm này.</div>
          ) : (
            pageItems.map((item) => {
              const meta = KIND_META[item.kind] || { label: 'Thông báo', icon: Bell }
              const Icon = meta.icon
              const unread = !read.includes(item.documentId)
              return (
                <Link
                  key={item.documentId}
                  href={normalizeNotificationUrl(item.url)}
                  className="flex flex-col gap-3 px-5 py-4 transition hover:bg-secondary/20 md:flex-row md:items-start md:justify-between"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="overlay-icon-shell mt-0.5 size-11">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] uppercase tracking-[0.22em] text-gold-dim">{meta.label}</span>
                        {unread ? <span className="size-2.5 rounded-full bg-gold" /> : null}
                      </div>
                      <h2 className="mt-1 text-base font-semibold text-foreground md:text-lg">{item.title}</h2>
                      <p className="mt-1 max-w-3xl text-sm leading-7 text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                  <div className="shrink-0 whitespace-nowrap text-sm text-muted-foreground md:pl-4">{formatTime(item.createdAt)}</div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {totalPages > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  setCurrentPage((page) => Math.max(1, page - 1))
                }}
                className={safePage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {getPaginationRange(safePage, totalPages).map((item, index) => (
              <PaginationItem key={`${item}-${index}`}>
                {item === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={item === safePage}
                    onClick={(event) => {
                      event.preventDefault()
                      setCurrentPage(item)
                    }}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }}
                className={safePage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </section>
  )
}
