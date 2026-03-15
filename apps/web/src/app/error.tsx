'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, Home, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for monitoring
    console.error('[RootError]', error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        {/* Title & Message */}
        <div>
          <h1 className="font-display text-2xl text-foreground mb-2">Có lỗi xảy ra</h1>
          <p className="text-muted-foreground text-sm">
            Rất tiếc, đã xảy ra lỗi khi tải trang. Vui lòng thử lại hoặc quay về trang chủ.
          </p>
        </div>

        {/* Debug info (only in development) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-xs text-muted-foreground font-mono break-words">{error.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Home className="w-4 h-4" />
            Trang chủ
          </Link>
        </div>

        {/* Support link */}
        <p className="text-xs text-muted-foreground">
          Nếu vấn đề vẫn tiếp tục, vui lòng{' '}
          <a href="https://zalo.me" className="text-gold hover:underline">
            liên hệ hỗ trợ
          </a>
        </p>
      </div>
    </div>
  )
}
