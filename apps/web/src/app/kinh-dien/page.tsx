import type { Metadata } from 'next'
import { connection } from 'next/server'

import Footer from '@/components/Footer'
import HeaderServer from '@/components/HeaderServer'
import StickyBanner from '@/components/StickyBanner'
import SutraLibraryClient from '@/components/sutra/SutraLibraryClient'
import { fetchSutraList } from '@/lib/api/sutra'

export const metadata: Metadata = {
  title: 'Kinh Điển Đại Thừa | Pháp Môn Tâm Linh',
  description: 'Kho kinh điển đại thừa có phân tập/phẩm, lưu tiến độ đọc, bookmark và chú giải thuật ngữ ngay trong văn bản.',
}

export default async function SutraLibraryPage() {
  await connection()
  const sutras = await fetchSutraList().catch(() => [])

  return (
    <div className="min-h-screen bg-background">
      <StickyBanner />
      <HeaderServer />
      <main className="route-shell">
        <div className="route-frame px-4 md:px-6">
          <section className="panel-shell-strong mb-8 p-6 md:p-8">
            <p className="route-kicker">Kinh điển đại thừa</p>
            <h1 className="route-title mt-3 md:text-5xl">Thư viện Kinh</h1>
            <p className="route-copy mt-3 max-w-3xl text-sm leading-7 md:text-base">
              Đọc theo tập/phẩm, lưu lại vị trí đang đọc, đánh dấu bookmark và tra chú giải ngay trên văn bản để đồng tu tiện học, tiện ôn.
            </p>
          </section>
          <SutraLibraryClient items={sutras} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
