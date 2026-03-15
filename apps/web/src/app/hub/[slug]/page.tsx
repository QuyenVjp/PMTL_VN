// app/hub/[slug]/page.tsx — Hub page (Server Component)
import type { Metadata } from 'next'
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

export const revalidate = 3600

export default async function HubPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  let hub
  try {
    hub = await getHubBySlug(slug)
  } catch {
    notFound()
  }

  if (!hub) notFound()

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      {/* HubPageComponent tu render <main> ben trong */}
      <HubPageComponent hubPage={hub} />
      <Footer />
      <StickyBanner />
    </div>
  )
}
