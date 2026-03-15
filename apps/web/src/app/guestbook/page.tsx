// app/guestbook/page.tsx — Guestbook main page (Server Component)
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { getGuestbookEntries, getGuestbookArchiveList, type ArchiveStat } from '@/lib/api/guestbook'
import GuestbookPageHeader from '@/components/guestbook/GuestbookPageHeader'
import GuestbookList from '@/components/guestbook/GuestbookList'
import GuestbookSidebar from '@/components/guestbook/GuestbookSidebar'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'
import type { GuestbookList as GuestbookListType } from '@/types/cms'

export const metadata: Metadata = {
  title: 'Sổ Lưu Bút & Hỏi Đáp | Phật Môn Tịnh Lữ',
  description: 'Nơi các thiện hữu giao lưu, hỏi đáp và chia sẻ kinh nghiệm tu học trên con đường Phật Pháp.',
}

const fallback: GuestbookListType = {
  data: [],
  meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
}

export default async function GuestbookPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <Suspense fallback={<GuestbookPageFallback />}>
        <GuestbookPageContent />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyBanner />
    </div>
  )
}

async function GuestbookPageContent() {
  await connection()

  let initialData: GuestbookListType = fallback
  let archives: ArchiveStat[] = []

  try {
    const [entriesReq, archivesReq] = await Promise.all([
      getGuestbookEntries(1, 20),
      getGuestbookArchiveList()
    ])
    initialData = entriesReq
    archives = archivesReq
  } catch {
    // hiển thị trang trống nếu lỗi
  }

  return (
    <main className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <GuestbookPageHeader />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
          <div className="order-2 lg:order-1">
            <GuestbookSidebar archives={archives} />
          </div>

          <div className="order-1 min-w-0 lg:order-2">
            <GuestbookList initialData={initialData} />
          </div>
        </div>
      </div>
    </main>
  )
}

function GuestbookPageFallback() {
  return (
    <main className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="panel-shell-strong p-8 text-center text-muted-foreground">
          Đang tải sổ lưu bút...
        </div>
      </div>
    </main>
  )
}
