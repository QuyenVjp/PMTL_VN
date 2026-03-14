import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { SiteShell } from "@/components/layout/site-shell";
import { publicEnv } from "@/lib/env/public-env";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: "PMTL_VN",
  description: "Monorepo architecture for Next.js 16 + Payload + PostgreSQL + Meilisearch",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="vi">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

