import type { Metadata } from "next";
import Link from "next/link";
import { VowListClient } from "./vow-list-client";

export const metadata: Metadata = { title: "Phát nguyện" };

export default function PhatNguyenPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <nav className="text-sm text-gray-400 mb-1">
            <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
            <span className="mx-1">/</span>
            <span>Phát nguyện</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Nguyện của tôi</h1>
        </div>
        <Link
          href="/phat-nguyen/tao-moi"
          className="rounded-xl bg-amber-600 px-4 py-3 text-base font-semibold text-white hover:bg-amber-700 min-h-[48px] flex items-center"
        >
          + Tạo nguyện
        </Link>
      </header>
      <VowListClient />
    </main>
  );
}
