"use client";

import { useQuery } from "@tanstack/react-query";
import { meritSummaryOptions } from "@/features/engagement/queries";

export function DashboardClient() {
  const { data, isLoading, isError } = useQuery(meritSummaryOptions());

  if (isLoading) {
    return (
      <section className="space-y-3">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return null;
  }

  const lanes = [
    { label: "Buổi tu", value: data.gongke.last30Days, unit: "/ 30 ngày" },
    { label: "Nguyện đang giữ", value: data.vows.active, unit: "nguyện" },
    { label: "Nhà Nhỏ đã đốt", value: data.littleHouse.burned, unit: "nhà" },
    { label: "Sám hối", value: data.repentance.last30Days, unit: "lần / 30 ngày" },
  ];

  return (
    <section aria-label="Tóm tắt công đức cá nhân">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Tóm tắt cá nhân
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {lanes.map(({ label, value, unit }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-4 text-center"
          >
            <p className="text-3xl font-bold text-amber-700">{value}</p>
            <p className="mt-1 text-xs text-gray-500 leading-tight">
              {label}
              <br />
              <span className="text-gray-400">{unit}</span>
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400 text-center">
        Dữ liệu cá nhân, hoàn toàn riêng tư.
      </p>
    </section>
  );
}
