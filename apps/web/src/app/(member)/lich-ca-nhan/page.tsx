import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getServerApiBaseUrl } from "@/lib/api-base";

export const metadata: Metadata = { title: "Lịch cá nhân" };

interface AdvisoryResponse {
  lunarDate?: string;
  solarDate?: string;
  dayType?: string;
  notes?: string[];
}

async function getTodayAdvisory(): Promise<AdvisoryResponse | null> {
  const apiBase = getServerApiBaseUrl();
  if (!apiBase) return null;
  try {
    const res = await fetch(`${apiBase}/calendar/advisory/today`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as AdvisoryResponse;
  } catch {
    return null;
  }
}

export default async function LichCaNhanPage() {
  await connection();
  const advisory = await getTodayAdvisory();
  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <header className="mb-6">
        <nav className="text-sm text-gray-400 mb-1">
          <a href="/dashboard" className="hover:text-gray-600">Trang chủ</a>
          <span className="mx-1">/</span>
          <span>Lịch cá nhân</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Lịch cá nhân</h1>
        <p className="mt-1 text-base text-gray-500">{today}</p>
      </header>

      {/* Today advisory */}
      <section className="space-y-3 mb-6">
        {advisory ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
            {advisory.lunarDate && (
              <p className="text-lg font-semibold text-amber-900">
                🗓️ {advisory.lunarDate}
              </p>
            )}
            {advisory.dayType && (
              <p className="text-base text-amber-800 font-medium">{advisory.dayType}</p>
            )}
            {advisory.notes && advisory.notes.length > 0 && (
              <ul className="space-y-1 mt-2">
                {advisory.notes.map((note, i) => (
                  <li key={i} className="text-base text-amber-800 flex gap-2">
                    <span>•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-base text-gray-400">
            Không có dữ liệu ngày hôm nay.
          </div>
        )}
      </section>

      {/* Quick links to practice modules */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Thực hành hôm nay
        </h2>
        <div className="space-y-2">
          {(
            [
              { href: "/tu-tap/bai-tap", label: "📿 Ghi buổi tu", desc: "Công khóa hằng ngày" },
              { href: "/tu-tap/nha-nho", label: "🏠 Ngôi Nhà Nhỏ", desc: "Quản lý vòng đời nhà" },
              { href: "/phat-nguyen", label: "🙏 Phát nguyện", desc: "Xem và cập nhật nguyện" },
              { href: "/phong-sanh", label: "🕊️ Phóng sanh", desc: "Ghi lại buổi phóng sanh" },
            ] as const
          ).map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 hover:border-amber-400 hover:bg-amber-50 transition-colors min-h-[60px]"
            >
              <div>
                <p className="text-lg font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
              <span className="text-gray-300 text-xl">›</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Notification settings link */}
      <div className="mt-6">
        <a
          href="/thong-bao"
          className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-base text-gray-600 hover:bg-gray-50 min-h-[48px]"
        >
          Thiết lập nhắc nhở →
        </a>
      </div>
    </main>
  );
}
