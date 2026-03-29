import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Lịch sử tu học" };

export default function LichSuPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <nav className="text-sm text-gray-400 mb-1">
          <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
          <span className="mx-1">/</span>
          <span>Lịch sử tu học</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử tu học</h1>
      </header>
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-base text-gray-400">Đang xây dựng — Phase 2.</p>
        <Link href="/tu-tap/bai-tap" className="mt-4 inline-block rounded-xl bg-amber-600 px-5 py-3 text-base font-semibold text-white hover:bg-amber-700 min-h-[48px]">
          Ghi buổi tu hôm nay
        </Link>
      </div>
    </main>
  );
}
