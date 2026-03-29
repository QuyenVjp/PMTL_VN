import type { Metadata } from "next";
import { LittleHouseClient } from "./little-house-client";

export const metadata: Metadata = { title: "Ngôi Nhà Nhỏ" };

export default function NhaNhoPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <nav className="text-sm text-gray-400 mb-1">
          <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
          <span className="mx-1">/</span>
          <span>Ngôi Nhà Nhỏ</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Ngôi Nhà Nhỏ</h1>
        <p className="mt-1 text-base text-gray-500">
          Giao diện gần giấy — ghi lại từng nhà theo đúng trình tự.
        </p>
      </header>
      <LittleHouseClient />
    </main>
  );
}
