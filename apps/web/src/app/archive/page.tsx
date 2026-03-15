// app/archive/page.tsx — Archive index page (server)
import type { Metadata } from 'next'
import { getArchiveIndex } from '@/lib/api/archive'
import ArchiveGrid from '@/components/archive/ArchiveGrid'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import type { ArchiveYear } from '@/types/strapi'

export const metadata: Metadata = {
  title: 'Lưu Trữ Bài Viết | Phật Môn Tịnh Lữ',
  description: 'Kho lưu trữ toàn bộ bài viết theo năm và tháng.',
}

export const revalidate = 3600

export default async function ArchivePage() {
  let data: ArchiveYear[] = []
  try {
    data = await getArchiveIndex()
  } catch {
    // nếu lỗi hiển thị trang trống
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="py-24">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs font-medium tracking-widest uppercase mb-4">Kho Lưu Trữ</p>
            <h1 className="ant-title mb-5 text-4xl text-foreground md:text-5xl">Lưu Trữ Bài Viết</h1>
            <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
              Toàn bộ bài viết phân loại theo năm và tháng. Chọn tháng để xem danh sách bài.
            </p>
          </div>
          <ArchiveGrid data={data} />
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
