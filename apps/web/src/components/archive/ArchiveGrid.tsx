import Link from 'next/link'
import type { ArchiveYear } from '@/types/strapi'

const MONTH_VI_SHORT = [
  '', 'Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6',
  'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12',
]

interface ArchiveGridProps {
  data: ArchiveYear[]
}

export default function ArchiveGrid({ data }: ArchiveGridProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Chưa có bài viết nào trong lưu trữ.
      </p>
    )
  }

  const featuredMonth = data[0]?.months?.[0]

  return (
    <div className="space-y-12">
      {featuredMonth && data[0] && (
        <section className="rounded-xl border border-border bg-gold/[0.03] p-8 shadow-ant">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/75">Mới nhất</p>
          <h2 className="ant-title mb-3 text-3xl text-foreground md:text-4xl">
            <Link href={`/archive/${data[0].year}/${featuredMonth.month}`} className="transition-colors hover:text-gold">
              {MONTH_VI_SHORT[featuredMonth.month]} <span className="text-gold/45">{data[0].year}</span>
            </Link>
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{featuredMonth.count} bài viết đã lưu trữ</span>
            <Link
              href={`/archive/${data[0].year}/${featuredMonth.month}`}
              className="ml-auto inline-flex items-center rounded-md border border-gold/25 px-4 py-2 text-xs font-semibold text-gold transition-all hover:bg-gold hover:text-black"
            >
              Mở lưu trữ →
            </Link>
          </div>
        </section>
      )}

      <div className="space-y-10">
        {data.map((yearData) => (
          <div key={yearData.year} className="rounded-xl border border-border bg-card p-6 shadow-ant">
            <div className="mb-6 flex items-end gap-6">
              <Link
                href={`/archive/${yearData.year}`}
                className="ant-title text-4xl text-foreground transition-colors hover:text-gold md:text-5xl"
              >
                {yearData.year}
              </Link>
              <div className="pb-1">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold/70">Toàn bộ tuyển tập</p>
                <span className="text-sm text-muted-foreground">{yearData.total} bài viết</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {yearData.months.map((m) => (
                <Link
                  key={m.month}
                  href={`/archive/${yearData.year}/${m.month}`}
                  className="group rounded-lg border border-border bg-gold/[0.02] px-4 py-4 transition-all hover:border-gold/30 hover:bg-gold/[0.05] hover:shadow-ant"
                >
                  <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/70 group-hover:text-gold">
                    {MONTH_VI_SHORT[m.month]}
                  </span>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="ant-number text-2xl text-foreground">{m.count}</span>
                    <span className="text-xs text-muted-foreground/60">bài viết</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
