// app/library/page.tsx — Server Component
// Fetch data server-side, truyền xuống LibraryClient để render
import type { Metadata } from 'next'
import { fetchDownloads, DOWNLOAD_CATEGORIES, type DownloadItem } from '@/lib/api/downloads'
import LibraryClient from '@/components/library/LibraryClient'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'

export const metadata: Metadata = {
  title: 'Thư Viện Tài Liệu | Phật Môn Tịnh Lữ',
  description: 'Tổng hợp kinh điển, khai thị, audio, video và tài liệu tu học của Pháp Môn Tâm Linh. Tất cả miễn phí.',
}

export const revalidate = 3600

export default async function LibraryPage() {
  let allItems: DownloadItem[] = []

  try {
    const result = await fetchDownloads({ pageSize: 100 })
    allItems = result.items
  } catch {
    // hiển thị trang trống nếu lỗi
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="route-shell">
        <div className="route-frame">
          <LibraryClient initialItems={allItems} categories={[...DOWNLOAD_CATEGORIES]} />
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
