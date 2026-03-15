'use client'

import { useEffect } from 'react'
import Header from '@/components/Header' // Note: Error boundaries use client Header for simplicity
import Footer from '@/components/Footer'

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Blog Error Boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-16">
        {/* Note: Error boundary uses client Header for fallback safety */}
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-950/20 border border-red-500/50 rounded-lg p-8 space-y-4">
              <h1 className="text-2xl font-bold text-red-400">Lỗi tải Blog</h1>
              
              <div className="bg-black/30 rounded p-4 overflow-auto max-h-96">
                <p className="text-sm font-mono text-red-300/80 break-words whitespace-pre-wrap">
                  {error.message}
                </p>
              </div>

              {error.digest && (
                <p className="text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => reset()}
                  className="px-6 py-2 bg-gold text-black rounded-lg hover:bg-gold/90 transition-colors font-medium text-sm"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium text-sm"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
