import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Phạm Minh Tuấn Linh",
    template: "%s | Phạm Minh Tuấn Linh",
  },
  description: "Trang cá nhân của Phạm Minh Tuấn Linh",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://phamminhtuanlinh.com"),
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
