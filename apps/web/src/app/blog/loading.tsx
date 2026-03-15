// loading.tsx cho /blog — hiện skeleton ngay trong khi Server Component đang fetch
export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header placeholder */}
      <div className="h-16 border-b border-border bg-card/80" />

      <main className="py-16">
        <div className="container mx-auto px-6">
          {/* Header skeleton */}
          <div className="flex flex-col items-center mb-12 gap-3">
            <div className="h-4 w-24 rounded-full bg-secondary animate-pulse" />
            <div className="h-10 w-64 rounded-lg bg-secondary animate-pulse" />
            <div className="h-5 w-48 rounded bg-secondary animate-pulse" />
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar skeleton */}
            <aside className="lg:w-72 shrink-0 space-y-5">
              <div className="h-10 rounded-lg bg-secondary animate-pulse" />
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="h-14 bg-secondary/50 animate-pulse" />
                <div className="p-3 space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-8 rounded-lg bg-secondary animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
                  ))}
                </div>
              </div>
            </aside>

            {/* List skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-5 w-40 rounded bg-secondary animate-pulse mb-6" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-5 rounded-xl border border-border bg-card animate-pulse" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-24 h-24 rounded-lg bg-secondary" />
                    <div className="flex-1 space-y-2.5">
                      <div className="flex gap-2">
                        <div className="h-4 w-16 rounded bg-secondary" />
                        <div className="h-4 w-20 rounded bg-secondary" />
                      </div>
                      <div className="h-5 w-3/4 rounded bg-secondary" />
                      <div className="h-4 w-full rounded bg-secondary" />
                      <div className="h-4 w-2/3 rounded bg-secondary" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
