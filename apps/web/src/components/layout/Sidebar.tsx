// components/layout/Sidebar.tsx — Server component
// CMS-configurable sidebar: conditionally renders widgets based on SidebarConfig
import { Suspense, type ReactNode } from 'react'
import { getSidebarConfig } from '@/lib/api/sidebar'
import SearchWidget from './widgets/SearchWidget'
import CategoryWidget from './widgets/CategoryWidget'
import ArchiveWidget from './widgets/ArchiveWidget'
import LatestCommentsWidget from './widgets/LatestCommentsWidget'
import DownloadLinksWidget from './widgets/DownloadLinksWidget'
import SocialLinksWidget from './widgets/SocialLinksWidget'
import { Card as UICard, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Fallback: show all widgets if CMS config is unavailable
const DEFAULT_CONFIG = {
  showSearch: true,
  showCategoryTree: true,
  showArchive: true,
  showLatestComments: true,
  showDownloadLinks: false,
  downloadLinks: [],
  socialLinks: [],
  qrImages: null,
}

export default async function Sidebar() {
  const config = (await getSidebarConfig()) ?? DEFAULT_CONFIG

  const Card = ({ children }: { children: ReactNode }) => (
    <UICard className="overflow-hidden rounded-2xl border border-border bg-card shadow-ant">
      <CardContent className="p-6">{children}</CardContent>
    </UICard>
  )

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 space-y-5">
        {/* Search */}
        {config.showSearch && (
          <Card>
            <SearchWidget />
          </Card>
        )}

        {/* Category tree */}
        {config.showCategoryTree && (
          <Card>
            <Suspense fallback={<Skeleton className="h-20 rounded-xl" />}>
              <CategoryWidget />
            </Suspense>
          </Card>
        )}

        {/* Archive */}
        {config.showArchive && (
          <Card>
            <Suspense fallback={<Skeleton className="h-24 rounded-xl" />}>
              <ArchiveWidget />
            </Suspense>
          </Card>
        )}

        {/* Latest comments */}
        {config.showLatestComments && (
          <Card>
            <Suspense fallback={<Skeleton className="h-20 rounded-xl" />}>
              <LatestCommentsWidget />
            </Suspense>
          </Card>
        )}

        {/* Download links */}
        {config.showDownloadLinks && config.downloadLinks?.length > 0 && (
          <Card>
            <DownloadLinksWidget links={config.downloadLinks} />
          </Card>
        )}

        {/* Social links + QR */}
        {(config.socialLinks?.length > 0 || config.qrImages?.length) && (
          <Card>
            <SocialLinksWidget
              socialLinks={config.socialLinks ?? []}
              qrImages={config.qrImages}
            />
          </Card>
        )}
      </div>
    </aside>
  )
}
