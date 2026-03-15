import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Footer from '@/components/Footer'
import HeaderServer from '@/components/HeaderServer'
import StickyBanner from '@/components/StickyBanner'
import SutraReaderClient from '@/components/sutra/SutraReaderClient'
import { fetchSutraBySlug } from '@/lib/api/sutra'

interface Props {
  params: Promise<{ sutraSlug: string }>
  searchParams: Promise<{ chapter?: string }>
}

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sutraSlug } = await params
  const data = await fetchSutraBySlug(sutraSlug).catch(() => null)
  if (!data) {
    return {
      title: 'Kinh điển',
    }
  }
  return {
    title: `${data.sutra.title} | Kinh Điển Đại Thừa`,
    description: data.sutra.shortExcerpt || data.sutra.description || 'Đọc kinh điển đại thừa có lưu tiến độ và chú giải.',
  }
}

export default async function SutraReaderPage({ params, searchParams }: Props) {
  const [{ sutraSlug }, { chapter }] = await Promise.all([params, searchParams])
  const data = await fetchSutraBySlug(sutraSlug).catch(() => null)
  if (!data) notFound()

  return (
    <div className="min-h-screen bg-background">
      <StickyBanner />
      <HeaderServer />
      <main className="py-8 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <section className="mb-6 rounded-xl border border-gold/15 bg-card/70 p-5 md:p-6">
            <p className="ant-label text-gold">Kinh điển đại thừa</p>
            <h1 className="ant-title mt-2 text-3xl text-foreground md:text-4xl">{data.sutra.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
              {data.sutra.description || data.sutra.shortExcerpt || 'Đọc theo tập/phẩm, lưu tiến độ và tra thích nghĩa ngay trên văn bản.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {data.sutra.translatorHan ? <span>Hán dịch: {data.sutra.translatorHan}</span> : null}
              {data.sutra.translatorViet ? <span>Việt dịch: {data.sutra.translatorViet}</span> : null}
              {data.sutra.reviewer ? <span>Khảo dịch: {data.sutra.reviewer}</span> : null}
            </div>
          </section>
          <SutraReaderClient data={data} initialChapterDocumentId={chapter} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

