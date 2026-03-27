import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { getServerApiBaseUrl } from "../../../lib/api-base";

export const metadata: Metadata = {
  title: "Hỏi Đáp 161 | Lễ Phật Đại Sám Hối Văn ngày đặc biệt",
  description:
    "Tổng hợp cấu trúc quy tắc Q161 cho số biến Lễ Phật Đại Sám Hối Văn theo ngày đặc biệt, nhóm đối tượng và giới hạn phối hợp Ngôi Nhà Nhỏ.",
};

interface Q161RulePackResponse {
  sourceCode: string;
  reviewStatus: string;
  recitationCaps: Array<{ key: string; maxCount: number; scope: string }>;
  crossDayCapRules: Array<{ key: string; maxCount: number; window: string }>;
  audienceCapRules: Array<{ audience: string; maxCount: number }>;
  littleHouseCapRules: Array<{ dayType: string; capType: string; maxCount: number }>;
}

interface RuntimeStatusResponse {
  generatedAt: string;
  cacheMode: "live";
}

async function getQ161RulePack(): Promise<Q161RulePackResponse | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("wisdom:q161");
  cacheTag("calendar:q161-rule-pack");

  const apiBase = getServerApiBaseUrl();
  if (!apiBase) return null;

  try {
    const res = await fetch(`${apiBase}/wisdom-qa/rule-packs/q161`);
    if (!res.ok) return null;
    return (await res.json()) as Q161RulePackResponse;
  } catch {
    return null;
  }
}

async function getRuntimeStatus(): Promise<RuntimeStatusResponse> {
  const apiBase = getServerApiBaseUrl();
  if (!apiBase) {
    return { generatedAt: "1970-01-01T00:00:00.000Z", cacheMode: "live" };
  }

  try {
    const res = await fetch(`${apiBase}/calendar/advisory/runtime-status`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { generatedAt: "1970-01-01T00:00:00.000Z", cacheMode: "live" };
    }
    return (await res.json()) as RuntimeStatusResponse;
  } catch {
    return { generatedAt: "1970-01-01T00:00:00.000Z", cacheMode: "live" };
  }
}

async function Q161StaticPanel() {
  const data = await getQ161RulePack();

  if (!data) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Không lấy được dữ liệu Q161 từ API nội bộ.
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-900">Thông tin source</h2>
        <p className="mt-2 text-sm text-gray-700">
          Mã nguồn: <strong>{data.sourceCode}</strong> · Review status: <strong>{data.reviewStatus}</strong>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-semibold text-gray-900">Recitation caps</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {data.recitationCaps.slice(0, 6).map((cap) => (
              <li key={cap.key}>
                {cap.key}: {cap.maxCount} ({cap.scope})
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-semibold text-gray-900">Cross-day + Audience</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {data.crossDayCapRules.map((cap) => (
              <li key={cap.key}>
                {cap.key}: {cap.maxCount} ({cap.window})
              </li>
            ))}
            {data.audienceCapRules.slice(0, 3).map((cap) => (
              <li key={cap.audience}>
                {cap.audience}: {cap.maxCount}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="font-semibold text-gray-900">Little House caps</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          {data.littleHouseCapRules.slice(0, 6).map((cap) => (
            <li key={`${cap.dayType}-${cap.capType}`}>
              {cap.dayType} · {cap.capType}: {cap.maxCount}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}

async function Q161RuntimePanel() {
  const runtime = await getRuntimeStatus();
  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-sm font-semibold text-blue-900">Runtime advisory status</h2>
      <p className="mt-1 text-sm text-blue-800">Cache mode: {runtime.cacheMode}</p>
      <p className="text-xs text-blue-700">Generated at: {new Date(runtime.generatedAt).toLocaleString("vi-VN")}</p>
    </section>
  );
}

function SectionSkeleton() {
  return <div className="h-20 animate-pulse rounded-lg bg-gray-100" />;
}

export default function Q161Page() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8">
        <nav className="text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <span>Hỏi đáp 161</span>
        </nav>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Hỏi đáp 161 · Lễ Phật Đại Sám Hối Văn ngày đặc biệt
        </h1>
        <p className="mt-3 text-gray-600">
          Trang này dùng cache-components (`use cache`) và render theo mô hình static shell + streamed runtime panel.
        </p>
      </header>

      <Suspense fallback={<SectionSkeleton />}>
        <Q161StaticPanel />
      </Suspense>

      <div className="mt-6">
        <Suspense fallback={<SectionSkeleton />}>
          <Q161RuntimePanel />
        </Suspense>
      </div>
    </main>
  );
}
