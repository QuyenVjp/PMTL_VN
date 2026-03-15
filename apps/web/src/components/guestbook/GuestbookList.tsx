// components/guestbook/GuestbookList.tsx — Client component
'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2Icon, ShieldCheckIcon } from 'lucide-react'
import type { GuestbookEntry, GuestbookList as GuestbookListType } from '@/types/cms'
import { getCmsMediaUrl } from '@/lib/cms'
import GuestbookForm from './GuestbookForm'
import { useGuestbookList } from '@/lib/query/guestbook'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface GuestbookListProps {
  initialData: GuestbookListType
  year?: number
  month?: number
}

function timeDisplay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function EntryCard({ entry }: { entry: GuestbookEntry }) {
  const avatarUrl = entry.avatar
    ? getCmsMediaUrl(entry.avatar.formats?.thumbnail?.url ?? entry.avatar.url)
    : null

  const initials = entry.authorName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl border border-border bg-card p-6 shadow-ant transition-all duration-300 hover:border-gold/25 md:p-8"
    >
      {/* Author row */}
      <div className="mb-5 flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="shrink-0"
        >
          <Avatar className="size-14 rounded-xl border border-gold/25">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={entry.authorName} loading="lazy" className="object-cover" /> : null}
            <AvatarFallback className="rounded-xl bg-gold/10 text-xs font-bold text-gold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="ant-title mb-2 text-lg leading-tight text-foreground">{entry.authorName}</p>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {entry.entryType === 'question' && (
              <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-[10px] uppercase tracking-tight text-amber-700">
                Câu Hỏi
              </Badge>
            )}
            {entry.questionCategory && (
              <Badge variant="outline" className="border-gold/20 bg-gold/10 text-[10px] text-gold">
                {entry.questionCategory}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70">
            {entry.country && <span className="font-medium">{entry.country}</span>}
            {entry.country && ' · '}
            <time dateTime={entry.createdAt}>{timeDisplay(entry.createdAt)}</time>
          </p>
        </div>
      </div>

      {/* Message — journal page style */}
      <p className="mb-6 whitespace-pre-wrap text-base font-[400] leading-relaxed text-foreground/80">
        {entry.message}
      </p>

      {/* Admin reply — nếu isOfficialReply thì viền vàng và badge */}
      {entry.adminReply && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Alert
            className={entry.isOfficialReply ? 'rounded-md border-gold/30 bg-gold/5' : 'rounded-md border-border bg-secondary/20'}
          >
            <ShieldCheckIcon className={entry.isOfficialReply ? 'text-gold' : 'text-muted-foreground'} />
            <AlertTitle className={entry.isOfficialReply ? 'text-xs uppercase tracking-[0.12em] text-gold' : 'text-xs uppercase tracking-[0.12em] text-muted-foreground'}>
              {entry.badge || (entry.isOfficialReply ? 'Ban Quản Trị' : 'Trả lời')}
            </AlertTitle>
            <AlertDescription className={entry.isOfficialReply ? 'whitespace-pre-wrap text-sm leading-relaxed text-foreground/80' : 'whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground'}>
              {entry.adminReply}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function GuestbookList({ initialData, year, month }: GuestbookListProps) {
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const { data = initialData, isLoading, isFetching } = useGuestbookList({
    initialData: page === 1 ? initialData : undefined,
    year,
    month,
    page,
    pageSize: 20,
  })

  const fetchPage = useCallback((nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleFormSuccess = useCallback(() => {
    setShowForm(false)
    setPage(1)
  }, [])

  const { data: entries, meta } = data
  const { pageCount, total } = meta.pagination

  return (
    <div>
      {/* Write button */}
      {!year && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={{ y: -10 }}
                  animate={{ y: 0 }}
                  className="rounded-2xl border border-gold/20 bg-card p-6 shadow-ant"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="ant-title text-lg text-foreground">Viết một lưu bút mới</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowForm(false)}
                    >
                      Đóng
                    </Button>
                  </div>
                  <GuestbookForm onSuccess={handleFormSuccess} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-ant">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Bàn viết cộng đồng</p>
                    <p className="mt-1 text-sm text-muted-foreground">Để lại lời nhắn, cảm ngộ hoặc một câu hỏi ngắn.</p>
                  </div>
                  <Button variant="outlineGlow" size="pill" onClick={() => setShowForm(true)}>
                    Ghi lưu bút
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Total count */}
      {total > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 text-sm font-medium text-muted-foreground"
        >
          {total.toLocaleString('vi-VN')} lưu bút đã được ghi lại
        </motion.p>
      )}

      {/* Entries */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <Loader2Icon className="w-8 h-8 text-gold" />
          </motion.div>
          <p className="text-sm text-muted-foreground mt-4">Đang tải...</p>
        </motion.div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-md border border-border/60 bg-secondary/15 py-20 text-center"
        >
          <p className="text-muted-foreground text-sm">
            Chưa có lưu bút nào{year ? ` trong tháng ${month}/${year}` : ''}. Hãy là người đầu tiên ghi lại hành trình của bạn.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-col gap-5"
          >
            {isFetching && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center">
                <div className="rounded-md border border-gold/20 bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
                  Đang cập nhật...
                </div>
              </div>
            )}
            {entries.map((entry, idx) => (
              <motion.div
                key={entry.documentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <EntryCard entry={entry} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-3"
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || isFetching}
          >
            Trước
          </Button>
          <Card className="rounded-md border-border/80 bg-muted/20 shadow-none">
            <CardContent className="px-4 py-2 text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-semibold">{page}</span> / <span className="text-foreground font-semibold">{pageCount}</span>
            </CardContent>
          </Card>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fetchPage(page + 1)}
            disabled={page >= pageCount || isFetching}
          >
            Tiếp
          </Button>
        </motion.div>
      )}
    </div>
  )
}
