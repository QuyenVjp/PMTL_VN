import type { Metadata } from "next";
import { GongkeForm } from "./gongke-form";

export const metadata: Metadata = { title: "Ghi buổi tu hôm nay" };

export default function BaiTapPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <nav className="text-sm text-gray-400 mb-1">
          <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
          <span className="mx-1">/</span>
          <span>Ghi buổi tu</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Công khóa hôm nay</h1>
      </header>
      {/* GongkeForm calculates today client-side to avoid prerender date issues */}
      <GongkeForm />
    </main>
  );
}
