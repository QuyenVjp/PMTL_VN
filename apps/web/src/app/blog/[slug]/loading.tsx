// loading.tsx cho /blog/[slug] — skeleton bài viết chi tiết
export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border bg-card/80" />
      <main className="py-5">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex gap-2 mb-8">
            {[60, 80, 120].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`h-3 w-${w === 60 ? '14' : w === 80 ? '20' : '32'} rounded bg-secondary animate-pulse`} />
                {i < 2 && <div className="w-3 h-3 rounded bg-secondary animate-pulse" />}
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 rounded-md bg-secondary animate-pulse" />
              <div className="h-6 w-16 rounded-md bg-secondary animate-pulse ml-auto" />
            </div>
            <div className="h-9 w-full rounded-lg bg-secondary animate-pulse" />
            <div className="h-9 w-3/4 rounded-lg bg-secondary animate-pulse" />
            <div className="flex gap-4">
              <div className="h-4 w-24 rounded bg-secondary animate-pulse" />
              <div className="h-4 w-20 rounded bg-secondary animate-pulse" />
            </div>
          </div>

          {/* Thumbnail */}
          <div className="rounded-xl bg-secondary/30 animate-pulse mb-10" style={{ aspectRatio: '16/9' }} />

          {/* Content */}
          <div className="space-y-3 mb-10">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`h-4 rounded bg-secondary animate-pulse`} style={{ width: i % 4 === 3 ? '60%' : '100%', animationDelay: `${i * 0.03}s` }} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
