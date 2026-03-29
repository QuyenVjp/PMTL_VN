import type { Metadata } from "next";
import { CreateVowForm } from "./create-vow-form";

export const metadata: Metadata = { title: "Tạo nguyện mới" };

export default function TaoMoiPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <nav className="text-sm text-gray-400 mb-1">
          <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
          <span className="mx-1">/</span>
          <a href="/phat-nguyen" className="hover:text-gray-600">Phát nguyện</a>
          <span className="mx-1">/</span>
          <span>Tạo mới</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Tạo nguyện mới</h1>
      </header>
      <CreateVowForm />
    </main>
  );
}
