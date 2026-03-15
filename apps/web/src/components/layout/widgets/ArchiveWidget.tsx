// components/layout/widgets/ArchiveWidget.tsx — Server component
// Compact archive list: years with expandable months
import Link from 'next/link'
import { ArchiveIcon } from 'lucide-react'
import { getArchiveIndex } from '@/lib/api/archive'

const MONTH_VI_SHORT = [
  '', 'Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6',
  'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12',
]

export default async function ArchiveWidget() {
  let data: Awaited<ReturnType<typeof getArchiveIndex>> = []
  try {
    data = await getArchiveIndex()
  } catch {
    return null
  }

  if (data.length === 0) return null

  // Max 3 years in sidebar
  const years = data.slice(0, 3)

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-gold/80">
        <ArchiveIcon className="w-3.5 h-3.5" />
        Lưu trữ
      </h3>

      <div className="space-y-4">
        {years.map((y) => (
          <div key={y.year} className="rounded-xl bg-secondary/30 px-4 py-4">
            <Link
              href={`/archive/${y.year}`}
              className="mb-3 flex items-center justify-between text-sm font-medium text-foreground transition-colors hover:text-gold"
            >
              <span>{y.year}</span>
              <span className="text-xs text-muted-foreground/70">{y.total} bài</span>
            </Link>
            <div className="flex flex-wrap gap-2">
              {y.months.map((m) => (
                <Link
                  key={m.month}
                  href={`/archive/${y.year}/${m.month}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-all hover:border-gold/25 hover:text-foreground"
                  title={`${MONTH_VI_SHORT[m.month]} — ${m.count} bài`}
                >
                  {MONTH_VI_SHORT[m.month]}
                  <span className="text-[9px] text-muted-foreground/50">{m.count}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/archive"
        className="block text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Xem toàn bộ lưu trữ →
      </Link>
    </div>
  )
}
