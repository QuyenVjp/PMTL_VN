import type { Metadata } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import { Source_Serif_4, Be_Vietnam_Pro } from 'next/font/google'
import Providers from './providers'
import { Toaster } from "@/components/ui/sonner"
import './globals.css'
import { SmoothScroll } from '@/components/SmoothScroll'
import WebVitalsReporter from '@/components/observability/WebVitalsReporter'

const fontDisplay = Source_Serif_4({
  subsets: ['vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const fontBody = Be_Vietnam_Pro({
  subsets: ['vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://phapmontamlinh.vn'),
  title: {
    default: 'Pháp Môn Tâm Linh | Hộ Trì Phật Pháp',
    template: '%s | Pháp Môn Tâm Linh',
  },
  description:
    'Pháp Môn Tâm Linh - Hộ trì Phật pháp, tu học tâm linh. Niệm kinh, phóng sinh, bạch thoại Phật pháp.',
  keywords: [
    'Pháp Môn Tâm Linh',
    'Phật pháp',
    'Niệm kinh',
    'Tu tập',
    'Quán Âm Đường',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pháp Môn Tâm Linh',
  },
  openGraph: {
    title: 'Pháp Môn Tâm Linh',
    description: 'Hộ trì Phật pháp, tu học tâm linh',
    type: 'website',
    locale: 'vi_VN',
  },
  icons: {
    icon: '/images/PMTL-LOGO.png',
    shortcut: '/images/PMTL-LOGO.png',
    apple: '/images/PMTL-LOGO.png',
  },
}

const isProd = process.env.NODE_ENV === 'production'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="min-h-screen bg-background antialiased font-body" suppressHydrationWarning>
        <Suspense fallback={null}>
          <Providers>
            <SmoothScroll>
              <WebVitalsReporter />
              {children}
              <Toaster position="top-center" />
            </SmoothScroll>
          </Providers>
        </Suspense>

        {isProd ? (
          <Script id="sw-register" strategy="afterInteractive">{`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `}</Script>
        ) : (
          <Script id="sw-unregister" strategy="afterInteractive">{`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (const registration of registrations) {
                    registration.unregister();
                  }
                });
                if (window.caches) {
                  caches.keys().then(function(keys) {
                    return Promise.all(keys.map(function(key) {
                      return caches.delete(key);
                    }));
                  });
                }
              });
            }
          `}</Script>
        )}
      </body>
    </html>
  )
}
