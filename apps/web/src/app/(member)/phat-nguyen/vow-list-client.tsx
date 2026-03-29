"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { vowListOptions } from "@/features/vows-merit/queries";
import type { MemberVow } from "@/features/vows-merit/queries";

const VOW_TYPE_LABEL: Record<string, string> = {
  LIFE_RELEASE: "Phóng sanh",
  CHANTING: "Niệm kinh",
  SUTRA_READING: "Đọc kinh",
  CUSTOM: "Nguyện khác",
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mt-2 h-2.5 w-full rounded-full bg-gray-100">
      <div
        className="h-2.5 rounded-full bg-amber-500 transition-all"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

function VowCard({ vow }: { vow: MemberVow }) {
  const isCompleted = vow.status === "COMPLETED";
  return (
    <Link href={`/phat-nguyen/${vow.publicId}`} className="block">
      <article className={`rounded-xl border p-4 hover:border-amber-400 transition-colors ${isCompleted ? "border-gray-100 bg-gray-50 opacity-75" : "border-gray-200 bg-white"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-500">{VOW_TYPE_LABEL[vow.vowType]}</p>
            <p className="mt-0.5 text-lg font-semibold text-gray-900 line-clamp-2">{vow.description}</p>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-medium ${isCompleted ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"}`}>
            {isCompleted ? "Viên mãn" : "Đang giữ"}
          </span>
        </div>

        {vow.targetCount != null && (
          <>
            <p className="mt-2 text-sm text-gray-500">
              {vow.currentCount.toLocaleString("vi-VN")} / {vow.targetCount.toLocaleString("vi-VN")}
              {" "}· {vow.progressPercent}%
            </p>
            <ProgressBar percent={vow.progressPercent} />
          </>
        )}

        {vow.endDate && (
          <p className="mt-2 text-xs text-gray-400">
            Hạn: {new Date(vow.endDate).toLocaleDateString("vi-VN")}
          </p>
        )}
      </article>
    </Link>
  );
}

export function VowListClient() {
  const { data: active = [], isLoading: loadingActive } = useQuery(vowListOptions({ status: "ACTIVE" }));
  const { data: completed = [] } = useQuery(vowListOptions({ status: "COMPLETED" }));

  if (loadingActive) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {active.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-base text-gray-400">Chưa có nguyện nào đang giữ.</p>
          <Link
            href="/phat-nguyen/tao-moi"
            className="mt-3 inline-block rounded-xl bg-amber-600 px-5 py-3 text-base font-semibold text-white hover:bg-amber-700 min-h-[48px]"
          >
            Tạo nguyện đầu tiên
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {active.map((vow) => <VowCard key={vow.publicId} vow={vow} />)}
      </div>

      {completed.length > 0 && (
        <details className="rounded-xl border border-gray-200 bg-gray-50">
          <summary className="cursor-pointer px-4 py-3 text-base font-medium text-gray-600">
            Đã viên mãn ({completed.length})
          </summary>
          <div className="space-y-2 px-4 pb-4">
            {completed.map((vow) => <VowCard key={vow.publicId} vow={vow} />)}
          </div>
        </details>
      )}
    </div>
  );
}
