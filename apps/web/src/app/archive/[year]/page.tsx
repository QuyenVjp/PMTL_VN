// app/archive/[year]/page.tsx — Archive year overview (server)
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeftIcon } from 'lucide-react'
import { getArchiveIndex, getArchivePosts } from '@/lib/api/archive'
import ArchiveGrid from '@/components/archive/ArchiveGrid'
import ArchivePostList from '@/components/archive/ArchivePostList'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import type { ArchiveYear, StrapiList, BlogPost } from '@/types/strapi'

interface Params {
  year: string
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { year: yearStr } = await params
  const y = parseInt(yearStr, 10)
  if (isNaN(y)) return {}
  return { title: `Lưu Trữ Năm ${y} | Phật Môn Tịnh Lữ` }
}

export const revalidate = 3600

export default async function ArchiveYearPage({ params }: { params: Promise<Params> }) {
  const { year: yearStr } = await params
  const year = parseInt(yearStr, 10)
  if (isNaN(year) || year < 2000) notFound()

  let index: ArchiveYear[] = []
  let posts: StrapiList<BlogPost> = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 12, pageCount: 0, total: 0 } },
  }

  try {
    ;[index, posts] = await Promise.all([getArchiveIndex(), getArchivePosts(year, undefined, 1, 20)])
  } catch {
    // hiển thị trang trống
  }

  const yearData = index.filter((y) => y.year === year)

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="py-24">
        <div className="container max-w-4xl mx-auto px-6">
          <Link
            href="/archive"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-10"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Tổng hợp lưu trữ
          </Link>

          <div className="mb-14">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-3">Kho Lưu Trữ</p>
            <h1 className="ant-title text-4xl text-foreground md:text-5xl">Năm {year}</h1>
          </div>

          {yearData.length > 0 && (
            <div className="mb-14">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">Theo tháng</p>
              <ArchiveGrid data={yearData} />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">Tất cả bài viết</p>
            <ArchivePostList data={posts} year={year} />
          </div>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
