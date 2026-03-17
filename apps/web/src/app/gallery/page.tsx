import type { Metadata } from 'next'
import { connection } from 'next/server'

import Footer from '@/components/Footer'
import GalleryClient from '@/components/gallery/GalleryClient'
import HeaderServer from '@/components/HeaderServer'
import StickyBanner from '@/components/StickyBanner'
import { FALLBACK_GALLERY_ITEMS, fetchGalleryItems } from '@/lib/api/gallery'

export const metadata: Metadata = {
  title: 'Gallery Hình Ảnh | Pháp Môn Tâm Linh',
  description: 'Thư viện ảnh động về pháp hội, nghi lễ, hoa sen, kiến trúc cổ tự và những khoảnh khắc tu học của Pháp Môn Tâm Linh.',
}

export default async function GalleryPage() {
  await connection()

  let items = FALLBACK_GALLERY_ITEMS

  try {
    const cmsItems = await fetchGalleryItems()
    if (cmsItems.length) {
      items = cmsItems
    }
  } catch {
    // Fallback demo remains active when CMS is empty or unavailable.
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="route-shell">
        <div className="route-frame px-4 md:px-6">
          <GalleryClient initialItems={items} />
        </div>
      </main>
      <Footer />
      <StickyBanner />
    </div>
  )
}
