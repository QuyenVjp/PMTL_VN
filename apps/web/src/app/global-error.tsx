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
    console.error("Global error boundary triggered", {
      digest: error.digest,
      message: error.message,
      stack: error.stack,
    });

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
          background: "#f7f3ed",
          color: "#162116",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: "640px", textAlign: "center" }}>
          <h1 style={{ marginBottom: "12px" }}>He thong tam thoi gap loi</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Loi da duoc ghi nhan de theo doi production. Vui long thu tai lai trang sau it phut.
          </p>
        </main>
      </body>
    </html>
  );
}
