import { Metadata } from 'next'
import Footer from '@/components/Footer'
import HeaderServer from '@/components/HeaderServer'
import StickyBanner from '@/components/StickyBanner'
import SharesClientShell from './SharesClientShell'

export const metadata: Metadata = {
  title: 'Người Thật Việc Thật - Chia sẻ cộng đồng | Phật Pháp Mật Tông',
  description: 'Những chia sẻ người thật việc thật từ đồng tu khắp thế giới — Hãy cùng lan tỏa năng lượng thiện lành và truyền cảm hứng tu học.',
}

export default async function SharesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; category?: string; sort?: string }>
}) {
  const { page = '1' } = await searchParams;

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <SharesClientShell
        initialPage={parseInt(page, 10)}
      />
      <Footer />
      <StickyBanner />
    </div>
  )
}
