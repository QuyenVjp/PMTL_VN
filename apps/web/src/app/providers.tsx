'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { ReactNode, useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

// ── PostHog Analytics (tuỳ chọn — chỉ kích hoạt khi có NEXT_PUBLIC_POSTHOG_KEY) ──
// Cài đặt: npm install posthog-js
// Sau khi cài: uncomment khối bên dưới và xoá phần placeholder
function PostHogInit() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
    if (!key) return

    // Lazy load để không ảnh hưởng bundle khi chưa cấu hình
    import('posthog-js').then(({ default: posthog }) => {
      if (!posthog.__loaded) {
        posthog.init(key, {
          api_host: host,
          capture_pageview: true,
          capture_pageleave: true,
          autocapture: false,
          // Dùng cookie-only (không localStorage) để tuân thủ GDPR
          persistence: 'cookie',
          // Tắt tracking khi user từ chối consent (EU GDPR)
          cookieless_mode: 'on_reject',
          opt_out_capturing_by_default: false,
        })
      }
    }).catch(() => {})
  }, [])
  return null
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
          },
        },
      })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PostHogInit />
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

