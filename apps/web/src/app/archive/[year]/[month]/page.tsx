// app/archive/[year]/[month]/page.tsx — Archive year+month page (server)
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { getArchivePosts } from '@/lib/api/archive'
import ArchivePostList from '@/components/archive/ArchivePostList'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import type { CmsList, BlogPost } from '@/types/cms'

interface Params {
  year: string
  month: string
}

const MONTH_VI = [
  '', 'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
  'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai',
]

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { year: yearStr, month: monthStr } = await params
  const y = parseInt(yearStr, 10)
  const m = parseInt(monthStr, 10)
  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) return {}
  return {
    title: `Lưu Trữ ${MONTH_VI[m]} ${y} | Phật Môn Tịnh Lữ`,
  }
}

export default async function ArchiveMonthPage({ params }: { params: Promise<Params> }) {
  await connection()

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <Suspense fallback={<ArchiveMonthFallback />}>
        <ArchiveMonthContent params={params} />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyBanner />
    </div>
  )
}

async function ArchiveMonthContent({ params }: { params: Promise<Params> }) {
  const { year: yearStr, month: monthStr } = await params
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  if (isNaN(year) || isNaN(month) || year < 2000 || month < 1 || month > 12) {
    notFound()
  }

  let posts: CmsList<BlogPost> = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } },
  }

  try {
    posts = await getArchivePosts(year, month, 1, 20)
  } catch {
    // hiển thị trang trống
  }

  const monthLabel = `${MONTH_VI[month]} ${year}`

  return (
    <main className="py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="flex items-center gap-2 mb-10">
          <Link
            href={`/archive/${year}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Năm {year}
          </Link>
        </div>

        <div className="mb-10">
          <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">Kho Lưu Trữ</p>
          <h1 className="ant-title text-4xl text-foreground md:text-5xl">{monthLabel}</h1>
        </div>

        <ArchivePostList data={posts} year={year} month={month} />
      </div>
    </main>
  )
}

function ArchiveMonthFallback() {
  return (
    <main className="py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="panel-shell-strong p-8 text-center text-muted-foreground">
          Đang tải lưu trữ theo tháng...
        </div>
      </div>
    </main>
  )
}
