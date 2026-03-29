import type { Metadata } from "next";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function DangNhapPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
          <p className="mt-2 text-base text-gray-500">Đang xây dựng — Phase 2.</p>
        </div>
      </div>
    </main>
  );
}
