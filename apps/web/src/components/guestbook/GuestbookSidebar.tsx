'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarDaysIcon } from 'lucide-react'
import type { ArchiveStat } from '@/lib/api/guestbook'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface GuestbookSidebarProps {
  archives: ArchiveStat[]
  currentYear?: number
  currentMonth?: number
}

export default function GuestbookSidebar({ archives, currentYear, currentMonth }: GuestbookSidebarProps) {
  // Gom nhóm theo năm
  const byYear = archives.reduce((acc, stat) => {
    if (!acc[stat.year]) acc[stat.year] = []
    acc[stat.year].push(stat)
    return acc
  }, {} as Record<number, ArchiveStat[]>)

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  return (
    <aside className="w-full shrink-0 lg:w-72 lg:sticky lg:top-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid w-full gap-4"
      >
        <Card className="rounded-2xl border border-border bg-card shadow-ant transition-colors duration-300 hover:border-gold/25">
          <CardHeader className="p-5 pb-4">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-md bg-secondary/50">
                <CalendarDaysIcon className="text-gold-dim" />
              </div>
              <CardTitle className="text-xl">Đi nhanh theo tháng</CardTitle>
            </div>
            <Separator className="bg-border/70" />
          </CardHeader>

          <CardContent className="flex flex-col gap-5 p-5 pt-0">
            {/* Link Xem tất cả */}
            <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
              <Link
                href="/guestbook"
                className={cn(
                  'block text-sm font-semibold transition-all duration-200',
                  !currentYear
                    ? 'text-gold-dim underline decoration-gold/40 underline-offset-4'
                    : 'text-muted-foreground hover:text-gold-dim hover:underline hover:decoration-gold/40 hover:underline-offset-4'
                )}
              >
                ← Tất Cả Lưu Bút & Hỏi Đáp
              </Link>
            </motion.div>

            {years.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-6 text-center text-sm italic text-muted-foreground"
              >
                Chưa có dữ liệu lưu trữ.
              </motion.p>
            ) : (
              <div className="flex flex-col gap-4">
                {years.map((y, idx) => (
                  <motion.div
                    key={y}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="flex flex-col gap-3"
                  >
                    <motion.p whileHover={{ x: 2 }} className="flex items-center gap-2 text-sm font-bold text-foreground/90">
                      <span className="size-2 rounded-sm bg-gold-dim" />
                      {y}
                    </motion.p>
                    <div className="grid grid-cols-2 gap-2 border-l-2 border-gold/20 pl-4">
                      {byYear[y]
                        .sort((a, b) => b.month - a.month)
                        .map((m, midx) => {
                          const isActive = currentYear === y && currentMonth === m.month
                          return (
                            <motion.div
                              key={`${y}-${m.month}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 + idx * 0.05 + midx * 0.02 }}
                            >
                              <Link
                                href={`/guestbook/archive/${y}/${m.month}`}
                                className={cn(
                                  'flex items-center justify-between rounded-md border px-3 py-2 text-xs font-medium transition-all duration-200',
                                  isActive
                                    ? 'border-gold/40 bg-gold/15 text-gold-dim'
                                    : 'border-border/40 text-muted-foreground hover:border-gold/30 hover:bg-secondary/35 hover:text-foreground'
                                )}
                              >
                                <span>Tháng {m.month}</span>
                                <Badge variant="secondary" className="rounded px-1.5 py-0 text-[10px] font-medium">
                                  {m.count}
                                </Badge>
                              </Link>
                            </motion.div>
                          )
                        })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-gold/15 bg-gold/5 p-5">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold-dim">Gợi ý đặt câu hỏi</h4>
          <p className="text-xs leading-relaxed text-muted-foreground/90">
            Một câu hỏi tốt nên ngắn, nêu đúng bối cảnh tu học và tránh gom quá nhiều vấn đề trong cùng một lưu bút.
          </p>
        </div>
      </motion.div>
    </aside>
  )
}
