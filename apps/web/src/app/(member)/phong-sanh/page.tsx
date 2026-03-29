import type { Metadata } from "next";
import Link from "next/link";
import { PhongSanhClient } from "./phong-sanh-client";

export const metadata: Metadata = { title: "Sổ tay phóng sanh" };

export default function PhongSanhPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-400 mb-1">
            <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
            <span className="mx-1">/</span>
            <span>Phóng sanh</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Sổ tay phóng sanh</h1>
        </div>
        <Link
          href="/phong-sanh/ghi-lai"
          className="rounded-xl bg-amber-600 px-4 py-3 text-base font-semibold text-white hover:bg-amber-700 min-h-[48px] flex items-center"
        >
          + Ghi lại
        </Link>
      </header>

      {/* Advisory note per LIFE-RELEASE-RITUAL-CHECKLIST.md canon */}
      <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        🕊️ Mỗi lần phóng sanh là một lần gieo nhân lành. Ghi lại để theo dõi nguyện và hồi hướng.
      </div>

      <PhongSanhClient />
    </main>
  );
}
