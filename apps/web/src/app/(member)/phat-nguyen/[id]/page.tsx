import type { Metadata } from "next";
import { VowDetailClient } from "./vow-detail-client";

export const metadata: Metadata = { title: "Chi tiết nguyện" };

export default function VowDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <nav className="text-sm text-gray-400 mb-1">
          <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
          <span className="mx-1">/</span>
          <a href="/phat-nguyen" className="hover:text-gray-600">Phát nguyện</a>
          <span className="mx-1">/</span>
          <span>Chi tiết</span>
        </nav>
      </header>
      <VowDetailClient paramsPromise={params} />
    </main>
  );
}
