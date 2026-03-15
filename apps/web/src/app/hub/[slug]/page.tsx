// app/hub/[slug]/page.tsx — Hub page (Server Component)
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { getHubBySlug } from '@/lib/api/hub'
import HubPageComponent from '@/components/hub/HubPageComponent'
import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'

interface Params {
  slug: string
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const hub = await getHubBySlug(slug)
    if (!hub) return {}
    return {
      title: `${hub.title} | Pháp Môn Tịnh Lư`,
      description: hub.description ?? undefined,
    }
  } catch {
    return {}
  }
}

export default async function HubPage({ params }: { params: Promise<Params> }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <Suspense fallback={<HubPageFallback />}>
        <HubPageContent params={params} />
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <StickyBanner />
    </div>
  )
}

async function HubPageContent({ params }: { params: Promise<Params> }) {
  await connection()

  const { slug } = await params
  let hub
  try {
    hub = await getHubBySlug(slug)
  } catch {
    notFound()
  }

  if (!hub) notFound()

  return (
    <HubPageComponent hubPage={hub} />
  )
}

function HubPageFallback() {
  return (
    <main className="route-shell">
      <div className="route-frame py-16">
        <div className="panel-shell-strong p-8 text-center text-muted-foreground">
          Đang tải nội dung chuyên mục...
        </div>
      </div>
    </main>
  )
}
