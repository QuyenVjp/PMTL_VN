import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SpeculationRules } from "./speculation-rules";

export const metadata: Metadata = {
  title: {
    default: "Pháp Môn Tâm Linh Việt Nam",
    template: "%s | PMTL Việt Nam",
  },
  description: "Nền tảng học Phật pháp và thực hành tu học dành cho người Việt.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://phapmontamlinh-quantheambotat.vn",
  ),
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8b5e3c",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        {children}
        {/* Speculation Rules for elderly-first UX: prerender critical content */}
        <SpeculationRules />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW registered:', registration.scope);
                    },
                    function(err) {
                      console.log('SW registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
