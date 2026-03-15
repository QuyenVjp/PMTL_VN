import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import StickyBanner from '@/components/StickyBanner'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background selection:bg-gold/20 selection:text-gold flex flex-col">
      <HeaderServer />
      {children}
      <Footer />
      <StickyBanner />
    </div>
  )
}
