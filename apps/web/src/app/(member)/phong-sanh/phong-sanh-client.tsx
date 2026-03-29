"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { vowListOptions } from "@/features/vows-merit/queries";

export function PhongSanhClient() {
  const { data: vows = [], isLoading } = useQuery(vowListOptions({ status: "ACTIVE" }));
  const lifeReleaseVows = vows.filter((v) => v.vowType === "LIFE_RELEASE");

  const { data: completed = [] } = useQuery(vowListOptions({ status: "COMPLETED" }));
  const completedRelease = completed.filter((v) => v.vowType === "LIFE_RELEASE");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active life-release vows */}
      {lifeReleaseVows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-base text-gray-400">Chưa có nguyện phóng sanh nào đang giữ.</p>
          <Link
            href="/phat-nguyen/tao-moi"
            className="mt-3 inline-block rounded-xl bg-amber-600 px-5 py-3 text-base font-semibold text-white hover:bg-amber-700 min-h-[48px]"
          >
            Phát nguyện phóng sanh mới
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Đang giữ nguyện
          </h2>
          {lifeReleaseVows.map((vow) => (
            <Link key={vow.publicId} href={`/phat-nguyen/${vow.publicId}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-amber-400 transition-colors">
              <p className="text-lg font-semibold text-gray-900 line-clamp-2">{vow.description}</p>
              {vow.targetCount != null && (
                <>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{ width: `${Math.min(vow.progressPercent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {vow.currentCount.toLocaleString("vi-VN")} / {vow.targetCount.toLocaleString("vi-VN")} · {vow.progressPercent}%
                  </p>
                </>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Quick log action */}
      <Link
        href="/phong-sanh/ghi-lai"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-4 text-lg font-medium text-amber-800 hover:bg-amber-100 min-h-[56px]"
      >
        🕊️ Ghi lại buổi phóng sanh hôm nay
      </Link>

      {/* Completed */}
      {completedRelease.length > 0 && (
        <details className="rounded-xl border border-gray-200 bg-gray-50">
          <summary className="cursor-pointer px-4 py-3 text-base font-medium text-gray-600">
            Đã viên mãn ({completedRelease.length})
          </summary>
          <div className="space-y-2 px-4 pb-4">
            {completedRelease.map((vow) => (
              <Link key={vow.publicId} href={`/phat-nguyen/${vow.publicId}`} className="block py-2 border-t border-gray-100 text-base text-gray-600 hover:text-gray-900">
                {vow.description}
              </Link>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
