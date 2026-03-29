"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { littleHouseListOptions } from "@/features/engagement/queries";
import { useCreateLittleHouse, useAdvanceLittleHouse } from "@/features/engagement/mutations";
import type { LittleHouse } from "@/features/engagement/queries";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Đang chuẩn bị",
  SIGNED: "Đã ký tên",
  CHANTED: "Đã niệm xong",
  BURNED: "Đã đốt",
};
const STATUS_NEXT_LABEL: Record<string, string> = {
  SIGNED: "Ký tên →",
  CHANTED: "Niệm xong →",
  BURNED: "Đốt nhà →",
};

// ─── Create form ──────────────────────────────────────────────────────────────
const createSchema = z.object({
  recipient: z.string().min(1, "Bắt buộc").max(200),
  sheetsCount: z.coerce.number().int().min(1).max(999).default(1),
  specialCase: z.boolean().default(false),
});
type CreateForm = z.infer<typeof createSchema>;

function CreateHouseForm({ onDone }: { onDone: () => void }) {
  const create = useCreateLittleHouse();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { sheetsCount: 1, specialCase: false },
  });

  function onSubmit(values: CreateForm) {
    create.mutate(values, { onSuccess: onDone });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">Tạo Ngôi Nhà Nhỏ mới</h3>
      <div>
        <label className="block text-base text-gray-700 mb-1">Tên người nhận *</label>
        <input
          type="text"
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-lg focus:border-amber-400 focus:outline-none"
          placeholder="Ví dụ: Ông Nguyễn Văn A"
          {...register("recipient")}
        />
        {errors.recipient && <p className="mt-1 text-sm text-red-600">{errors.recipient.message}</p>}
      </div>
      <div>
        <label className="block text-base text-gray-700 mb-1">Số tờ</label>
        <input
          type="number"
          min={1}
          max={999}
          className="w-24 rounded-lg border border-gray-300 px-3 py-3 text-xl text-center font-bold focus:border-amber-400 focus:outline-none"
          {...register("sheetsCount")}
        />
      </div>
      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <input type="checkbox" className="h-6 w-6 rounded accent-amber-600" {...register("specialCase")} />
        <span className="text-base text-gray-700">Trường hợp đặc biệt (cần xác nhận trước khi chuyển trạng thái)</span>
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={create.isPending}
          className="flex-1 rounded-xl bg-amber-600 py-3 text-lg font-semibold text-white hover:bg-amber-700 disabled:opacity-60 min-h-[52px]"
        >
          {create.isPending ? "Đang tạo..." : "Tạo nhà"}
        </button>
        <button type="button" onClick={onDone} className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-600 min-h-[52px]">
          Huỷ
        </button>
      </div>
      {create.isError && <p className="text-sm text-red-600">Lỗi khi tạo. Vui lòng thử lại.</p>}
    </form>
  );
}

// ─── Advance step ─────────────────────────────────────────────────────────────
function AdvanceButton({ house }: { house: LittleHouse }) {
  const [showBurnForm, setShowBurnForm] = useState(false);
  const [burnDate, setBurnDate] = useState(new Date().toISOString().slice(0, 16));
  const [postBurnNote, setPostBurnNote] = useState("");
  const advance = useAdvanceLittleHouse();

  const nextStatus = house.allowedNextStatuses[0] as "SIGNED" | "CHANTED" | "BURNED" | undefined;
  if (!nextStatus) return null;

  function doAdvance() {
    if (!nextStatus) return;
    if (nextStatus === "BURNED") {
      setShowBurnForm(true);
      return;
    }
    advance.mutate({
      publicId: house.publicId,
      nextStatus,
      ...(house.specialCase ? { specialCaseConfirmed: true } : {}),
    });
  }

  function doBurn() {
    advance.mutate({
      publicId: house.publicId,
      nextStatus: "BURNED",
      burnDate: new Date(burnDate).toISOString(),
      postBurnNote: postBurnNote || undefined,
      ...(house.specialCase ? { specialCaseConfirmed: true } : {}),
    });
    setShowBurnForm(false);
  }

  if (showBurnForm) {
    return (
      <div className="mt-3 space-y-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
        <p className="text-sm font-semibold text-orange-800">Xác nhận đốt nhà</p>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Ngày đốt</label>
          <input type="datetime-local" value={burnDate} onChange={(e) => setBurnDate(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm" />
        </div>
        <textarea rows={2} value={postBurnNote} onChange={(e) => setPostBurnNote(e.target.value)}
          placeholder="Ghi chú sau đốt (tuỳ chọn)"
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm resize-none" />
        <div className="flex gap-2">
          <button onClick={doBurn} disabled={advance.isPending}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60 min-h-[40px]">
            Xác nhận đốt
          </button>
          <button onClick={() => setShowBurnForm(false)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm min-h-[40px]">
            Huỷ
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={doAdvance}
      disabled={advance.isPending}
      className="mt-2 w-full rounded-lg border border-amber-400 bg-amber-50 py-2 text-base font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-60 min-h-[44px]"
    >
      {STATUS_NEXT_LABEL[nextStatus] ?? nextStatus}
    </button>
  );
}

// ─── Main client component ────────────────────────────────────────────────────
export function LittleHouseClient() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);

  const { data: houses = [], isLoading } = useQuery(littleHouseListOptions(filter ? { status: filter } : {}));

  const active = houses.filter((h) => h.status !== "BURNED");
  const burned = houses.filter((h) => h.status === "BURNED");

  if (isLoading) {
    return <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {showCreate ? (
        <CreateHouseForm onDone={() => setShowCreate(false)} />
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full rounded-xl bg-amber-600 py-4 text-xl font-semibold text-white hover:bg-amber-700 min-h-[56px]"
        >
          + Tạo Ngôi Nhà Nhỏ mới
        </button>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[undefined, "DRAFT", "SIGNED", "CHANTED", "BURNED"].map((s) => (
          <button
            key={s ?? "all"}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm min-h-[36px] ${filter === s ? "bg-amber-600 text-white" : "border border-gray-300 text-gray-600"}`}
          >
            {s ? STATUS_LABEL[s] : "Tất cả"}
          </button>
        ))}
      </div>

      {/* Active houses */}
      {active.length === 0 && burned.length === 0 && (
        <p className="text-center text-base text-gray-400 py-8">Chưa có Ngôi Nhà Nhỏ nào.</p>
      )}

      <div className="space-y-3">
        {active.map((house) => (
          <article key={house.publicId} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold text-gray-900">{house.recipient}</p>
                <p className="text-sm text-gray-500">
                  {house.sheetsCount} tờ
                  {house.specialCase && " · Đặc biệt"}
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                {STATUS_LABEL[house.status]}
              </span>
            </div>
            <AdvanceButton house={house} />
          </article>
        ))}
      </div>

      {/* Collapsed burned history */}
      {burned.length > 0 && (
        <details className="rounded-xl border border-gray-200 bg-gray-50">
          <summary className="cursor-pointer px-4 py-3 text-base font-medium text-gray-600">
            Đã đốt ({burned.length})
          </summary>
          <div className="space-y-2 px-4 pb-4">
            {burned.map((house) => (
              <div key={house.publicId} className="flex items-center justify-between py-2 border-t border-gray-100">
                <span className="text-base text-gray-700">{house.recipient}</span>
                <span className="text-sm text-gray-400">
                  {house.burnDate ? new Date(house.burnDate).toLocaleDateString("vi-VN") : "—"}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
