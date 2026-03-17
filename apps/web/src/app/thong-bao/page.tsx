import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import Breadcrumbs from '@/components/Breadcrumbs'
import NotificationsHubClient from '@/components/notifications/NotificationsHubClient'
import { fetchRecentNotifications } from '@/lib/push-server'

export default async function NotificationsPage() {
  const result = await fetchRecentNotifications(24).catch(() => ({ data: [] }))

  return (
    <div className="min-h-screen bg-background">
      <HeaderServer />
      <main className="route-shell">
        <div className="route-frame">
          <Breadcrumbs items={[{ label: 'Trung tâm thông báo' }]} />
          <NotificationsHubClient initialItems={result.data || []} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
