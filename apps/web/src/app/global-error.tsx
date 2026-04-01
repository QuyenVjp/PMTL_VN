"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="vi">
      <body className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <h2 className="mb-2 text-2xl font-semibold">Đã xảy ra lỗi ngoài dự kiến</h2>
          <p className="mb-6 text-sm opacity-80">
            Hệ thống đã ghi nhận lỗi. Vui lòng thử lại sau vài giây.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md border border-white/30 px-4 py-2 text-sm"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
