'use client'

import { motion } from 'framer-motion'
import { CalendarIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  year: number
  month: number
  total: number
}

export default function GuestbookArchiveHeader({ year, month, total }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 flex flex-col items-center text-center"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-gold/75">Lưu Trữ Theo Tháng</p>
      <h1 className="ant-title mb-5 text-4xl text-foreground md:text-5xl">Sổ Lưu Bút & Hỏi Đáp</h1>

      <Card className="w-full max-w-xs rounded-md border-gold/25 bg-card shadow-none">
        <CardContent className="flex items-center gap-3 p-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-gold/15">
            <CalendarIcon className="text-gold" />
          </div>
          <div className="text-left">
            <p className="text-xl font-semibold text-foreground">
              Tháng {month.toString().padStart(2, '0')} năm {year}
            </p>
            <p className="text-sm text-muted-foreground">{total} lưu bút đã ghi nhận</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
