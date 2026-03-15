// app/guestbook/archive/[year]/[month]/page.tsx — Guestbook archive page (Server Component)
import type { Metadata } from 'next'
import { getGuestbookArchive, getGuestbookArchiveList, type ArchiveStat } from '@/lib/api/guestbook'
import GuestbookList from '@/components/guestbook/GuestbookList'
import GuestbookSidebar from '@/components/guestbook/GuestbookSidebar'
import GuestbookArchiveHeader from '@/components/guestbook/GuestbookArchiveHeader'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import type { GuestbookList as GuestbookListType } from '@/types/strapi'

export const metadata: Metadata = {
  title: 'Lưu Trữ Sổ Lưu Bút | Phật Môn Tịnh Lữ',
  description: 'Tra cứu sổ lưu bút và thắc mắc theo tháng/năm.',
}

const fallback: GuestbookListType = {
  data: [],
  meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
}

export default async function GuestbookArchivePage({
  params
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const { year, month } = await params

  const y = parseInt(year, 10)
  const m = parseInt(month, 10)

  let initialData: GuestbookListType = fallback
  let archives: ArchiveStat[] = []

  try {
    const [entriesReq, archivesReq] = await Promise.all([
      getGuestbookArchive(y, m, 1, 20),
      getGuestbookArchiveList()
    ])
    initialData = entriesReq
    archives = archivesReq
  } catch {
    // hiển thị trống nếu lỗi
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="py-24">
        <div className="container mx-auto px-6">

          {/* Client component xử lý motion animation + archive badge */}
          <GuestbookArchiveHeader year={y} month={m} total={initialData.meta.pagination.total} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 w-full min-w-0">
              <GuestbookList initialData={initialData} year={y} month={m} />
            </div>

            {/* Sidebar Archive */}
            <div>
              <GuestbookSidebar archives={archives} currentYear={y} currentMonth={m} />
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
