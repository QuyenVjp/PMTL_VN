'use client'

import dynamic from 'next/dynamic'

const SharesClient = dynamic(() => import('@/components/shares/SharesClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-10 w-64 rounded-xl bg-secondary/60" />
        <div className="h-28 rounded-2xl bg-secondary/40" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-72 rounded-2xl bg-secondary/40" />
          <div className="h-72 rounded-2xl bg-secondary/40" />
        </div>
      </div>
    </div>
  ),
})

type SharesClientShellProps = {
  initialPage: number
}

export default function SharesClientShell({ initialPage }: SharesClientShellProps) {
  return <SharesClient initialPage={initialPage} />
}
