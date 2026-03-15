import type { Metadata } from 'next'
import Link from 'next/link'

import Footer from '@/components/Footer'
import HeaderServer from '@/components/HeaderServer'
import StickyBanner from '@/components/StickyBanner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchSutraDictionary } from '@/lib/api/sutra'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Từ Điển Thuật Ngữ Kinh Điển | Pháp Môn Tâm Linh',
  description: 'Tra cứu thuật ngữ và chú giải dùng chung cho các bộ kinh đại thừa.',
}

export default async function SutraDictionaryPage() {
  const entries = await fetchSutraDictionary().catch(() => [])

  return (
    <div className="min-h-screen bg-background">
      <StickyBanner />
      <HeaderServer />
      <main className="py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <section className="mb-6 rounded-xl border border-gold/15 bg-card/70 p-6">
            <p className="ant-label text-gold">Từ điển thuật ngữ</p>
            <h1 className="ant-title mt-2 text-4xl text-foreground">Tra Cứu Chú Giải Dùng Chung</h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
              Tổng hợp thích nghĩa từ toàn bộ thư viện kinh. Khi đọc có thể hover/tap marker để xem nhanh ngay trong văn bản.
            </p>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            {entries.map((entry) => (
              <Card key={entry.documentId} className="surface-panel rounded-xl">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="sacred">#{entry.markerKey}</Badge>
                    {entry.sutra ? (
                      <Badge variant="secondary">
                        <Link href={`/kinh-dien/${entry.sutra.slug}`}>{entry.sutra.title}</Link>
                      </Badge>
                    ) : null}
                  </div>
                  <CardTitle className="text-2xl">{entry.term}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-7 text-muted-foreground">{entry.meaning}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

