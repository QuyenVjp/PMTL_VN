import type { Metadata } from "next";
import { LogLifeReleaseForm } from "./log-life-release-form";

export const metadata: Metadata = { title: "Ghi lại buổi phóng sanh" };

export default function GhiLaiPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <nav className="text-sm text-gray-400 mb-1">
          <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
          <span className="mx-1">/</span>
          <a href="/phong-sanh" className="hover:text-gray-600">Phóng sanh</a>
          <span className="mx-1">/</span>
          <span>Ghi lại</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Ghi lại buổi phóng sanh</h1>
        <p className="mt-1 text-base text-gray-500">
          Ghi nhận để hồi hướng và theo dõi tiến độ nguyện.
        </p>
      </header>
      <LogLifeReleaseForm />
    </main>
  );
}
