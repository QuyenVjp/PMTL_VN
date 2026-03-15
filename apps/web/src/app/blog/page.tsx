// ─────────────────────────────────────────────────────────────
//  /blog — Server Component
//  Phân trang & lọc theo URL searchParams:
//    ?page=2&category=khai-thi&q=buong xa
//  ISR: fallback revalidate 1 hour — instant via /api/revalidate webhook
// ─────────────────────────────────────────────────────────────

import type { Metadata } from 'next'
import { Suspense } from 'react'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import BlogListClient from '@/components/BlogListClient'
import { getPosts, getCategories, getBlogArchiveIndex } from '@/lib/api/blog'
import { PAGINATION } from '@/lib/config/pagination'

// Keep blog listing fresh in production even when webhook revalidation is not configured.
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Blog & Chia Sẻ | Khai Thị Của Sư Phụ',
  description: 'Tổng hợp hàng vạn bài khai thị, giải đáp thắc mắc và chia sẻ từ pháp hội Pháp Môn Tâm Linh.',
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    q?: string
  }>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { page, category, q } = await searchParams
  // Đọc params từ URL
  const currentPage = Math.max(1, parseInt(page ?? '1', 10))
  const currentCategory = category ?? ''
  const currentSearch = q ?? ''

  // Fetch song song: bài viết và danh mục
  const [res, categories, archives] = await Promise.all([
    getPosts({
      page: currentPage,
      pageSize: PAGINATION.BLOG_PAGE_SIZE,
      categorySlug: currentCategory || undefined,
      search: currentSearch || undefined,
      revalidate: currentSearch ? 0 : 60, // search không cache, browse thì ISR ngắn
    }),
    getCategories(),
    getBlogArchiveIndex(),
  ])

  const posts = res.data
  const totalPosts = res.meta?.pagination?.total ?? 0
  const totalPages = res.meta?.pagination?.pageCount ?? 1

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="route-shell">
        <div className="route-frame">
          {/* ── Header ── */}
          <div className="route-hero">
            <p className="route-kicker mb-3">
              Blog &amp; Chia Sẻ
            </p>
            <h1 className="route-title mb-4">
              Kho Tàng Khai Thị
            </h1>
            <p className="route-copy">
              {totalPosts > 0
                ? `${totalPosts.toLocaleString('vi-VN')} bài giảng của Sư Phụ`
                : 'Tổng hợp khai thị của Sư Phụ'}
            </p>
          </div>

          {posts.length === 0 && !currentSearch && !currentCategory ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg mb-2">Chưa có bài viết nào</p>
              <p className="text-sm">Hãy tạo bài viết trong Strapi Admin</p>
            </div>
          ) : (
            <Suspense fallback={null}>
              <BlogListClient
                posts={posts}
                totalPosts={totalPosts}
                totalPages={totalPages}
                currentPage={currentPage}
                categories={categories}
                currentCategory={currentCategory}
                currentSearch={currentSearch}
                archives={archives}
              />
            </Suspense>
          )}
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
