"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & {
    digest?: string;
  };
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_ENABLED === "true") {
      void import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error);
      });
    }
  }, [error]);

  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#111827",
          color: "#f9fafb",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: "640px", textAlign: "center" }}>
          <h1 style={{ marginBottom: "12px" }}>CMS tam thoi gap loi</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Loi da duoc gui len error monitoring. Hay thu tai lai sau khi worker va CMS on dinh lai.
          </p>
        </main>
      </body>
    </html>
  );
}
