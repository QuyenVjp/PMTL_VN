import type { Metadata } from "next";
import Link from "next/link";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Trang chủ tu học" };

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Trang chủ tu học 🙏</h1>
      </header>

      {/* Quick actions — 3 primary practice lanes */}
      <section aria-label="Hành động nhanh">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Bắt đầu hôm nay
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/tu-tap/bai-tap"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 min-h-[56px] hover:border-amber-400 hover:bg-amber-50 transition-colors"
          >
            <span className="text-2xl">📿</span>
            <span className="text-lg font-medium text-gray-900">Ghi buổi tu</span>
          </Link>
          <Link
            href="/tu-tap/nha-nho"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 min-h-[56px] hover:border-amber-400 hover:bg-amber-50 transition-colors"
          >
            <span className="text-2xl">🏠</span>
            <span className="text-lg font-medium text-gray-900">Ngôi Nhà Nhỏ</span>
          </Link>
          <Link
            href="/phong-sanh"
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 min-h-[56px] hover:border-amber-400 hover:bg-amber-50 transition-colors"
          >
            <span className="text-2xl">🕊️</span>
            <span className="text-lg font-medium text-gray-900">Phóng sanh</span>
          </Link>
        </div>
      </section>

      {/* Client component for live merit summary */}
      <DashboardClient />

      {/* Secondary links */}
      <nav aria-label="Điều hướng tu học" className="grid grid-cols-2 gap-2">
        <Link href="/phat-nguyen" className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 hover:bg-gray-50 text-center">Phát nguyện</Link>
        <Link href="/lich-ca-nhan" className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 hover:bg-gray-50 text-center">Lịch cá nhân</Link>
        <Link href="/tu-tap/lich-su" className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 hover:bg-gray-50 text-center">Lịch sử tu học</Link>
        <a href="/me/activation" className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-700 hover:bg-gray-50 text-center">Ghi triệu chứng</a>
      </nav>
    </main>
  );
}
