import { Metadata } from 'next'
import SharesClient from '@/components/shares/SharesClient'
import { fetchPosts } from '@/lib/api/community'
import { getAllTags } from '@/lib/api/blog'
import { getCategories } from '@/lib/api/categories'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Người Thật Việc Thật - Chia sẻ cộng đồng | Phật Pháp Mật Tông',
  description: 'Những chia sẻ người thật việc thật từ đồng tu khắp thế giới — Hãy cùng lan tỏa năng lượng thiện lành và truyền cảm hứng tu học.',
}

export default async function SharesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string; sort?: string }>
}) {
  const { page = '1', search, category, sort } = await searchParams;

  // Note: we fetch on the server to prevent initial client heavy load
  const res = await fetchPosts({
    page: parseInt(page, 10),
    search,
    category,
    sort,
    pageSize: 12,
  }).catch(() => null);
  const [tagRes, categoryRes] = await Promise.all([
    getAllTags().catch(() => []),
    getCategories().catch(() => []),
  ]);
  const categoryOptions = Array.from(
    new Set(
      categoryRes
        .map((item) => item.name?.trim())
        .filter((item): item is string => Boolean(item))
    )
  );

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <SharesClient
        initialPosts={res?.posts || []}
        initialTotal={res?.total || 0}
        initialPage={parseInt(page, 10)}
        availableTags={tagRes.map((tag) => tag.name).filter(Boolean)}
        categoryOptions={categoryOptions}
      />
      <Footer />
      <StickyBanner />
    </div>
  )
}
