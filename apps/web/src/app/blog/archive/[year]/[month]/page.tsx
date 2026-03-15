import type { Metadata } from 'next'
import { Suspense } from 'react'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import BlogListClient from '@/components/BlogListClient'
import { getBlogArchive, getBlogArchiveIndex, getCategories } from '@/lib/api/blog'

export const revalidate = 3600 // 1h fallback

export const metadata: Metadata = {
  title: 'Blog Archive | Phật Môn Tịnh Lữ',
  description: 'Tra cứu bài viết khai thị của sư phụ theo tháng và năm',
}

interface PageProps {
  params: Promise<{ year: string; month: string }>
  searchParams: Promise<{
    page?: string
  }>
}

export default async function BlogArchivePage({ params, searchParams }: PageProps) {
  const { year, month } = await params
  const { page } = await searchParams

  const y = parseInt(year, 10)
  const m = parseInt(month, 10)
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))

  const [res, categories, archives] = await Promise.all([
    getBlogArchive(y, m, currentPage, 12),
    getCategories(),
    getBlogArchiveIndex(),
  ])

  const posts = res.data
  const totalPosts = res.meta?.pagination?.total ?? 0
  const totalPages = res.meta?.pagination?.pageCount ?? 1

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="py-16">
        <div className="container mx-auto px-6">
          {/* ── Header ── */}
          <div className="flex flex-col items-center mb-12">
            <p className="text-gold text-sm font-medium tracking-widest uppercase mb-3">
              Lưu Trữ Khai Thị
            </p>
            <h1 className="ant-title mb-4 text-4xl text-foreground md:text-5xl">
              Tháng {m} năm {y}
            </h1>
            <p className="text-muted-foreground text-lg">
              {totalPosts > 0
                ? `${totalPosts.toLocaleString('vi-VN')} bài giảng của Sư Phụ`
                : 'Chưa có bài viết nào'}
            </p>
          </div>

          <Suspense fallback={null}>
            <BlogListClient
              posts={posts}
              totalPosts={totalPosts}
              totalPages={totalPages}
              currentPage={currentPage}
              categories={categories}
              currentCategory=""
              currentSearch=""
              archives={archives}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
