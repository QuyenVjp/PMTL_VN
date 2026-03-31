"use client";

import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { vowDetailOptions } from "@/features/vows-merit/queries";
import { useUpdateVowProgress, useFulfillVow } from "@/features/vows-merit/mutations";

const progressSchema = z.object({
  addCount: z.coerce.number().int().min(1, "Tối thiểu 1").max(10000),
  note: z.string().max(500).optional(),
});
type ProgressForm = z.infer<typeof progressSchema>;

const VOW_TYPE_LABEL: Record<string, string> = {
  LIFE_RELEASE: "Phóng sanh",
  CHANTING: "Niệm kinh",
  SUTRA_READING: "Đọc kinh",
  CUSTOM: "Nguyện khác",
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-3 w-full rounded-full bg-gray-100">
      <div className="h-3 rounded-full bg-amber-500 transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}

export function VowDetailClient({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id } = use(paramsPromise);
  const { data: vow, isLoading, isError } = useQuery(vowDetailOptions(id));
  const updateProgress = useUpdateVowProgress();
  const fulfill = useFulfillVow();
  const [showFulfillConfirm, setShowFulfillConfirm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgressForm>({
    resolver: zodResolver(progressSchema),
    defaultValues: { addCount: 1 },
  });

  if (isLoading) {
    return <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />)}</div>;
  }

  if (isError || !vow) {
    return <p className="text-center text-base text-red-500 py-8">Không tìm thấy nguyện này.</p>;
  }

  const isActive = vow.status === "ACTIVE";

  function onProgress(values: ProgressForm) {
    if (!vow) return;
    updateProgress.mutate({ publicId: vow.publicId, addCount: values.addCount, note: values.note }, {
      onSuccess: () => reset({ addCount: 1 }),
    });
  }

  function doFulfill() {
    if (!vow) return;
    fulfill.mutate({ publicId: vow.publicId }, { onSuccess: () => setShowFulfillConfirm(false) });
  }

  return (
    <div className="space-y-5">
      {/* Vow header */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-gray-500">{VOW_TYPE_LABEL[vow.vowType]}</p>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${vow.status === "COMPLETED" ? "bg-green-100 text-green-700" : vow.status === "VOIDED" ? "bg-gray-100 text-gray-500" : "bg-amber-100 text-amber-800"}`}>
            {vow.status === "COMPLETED" ? "Viên mãn" : vow.status === "VOIDED" ? "Đã huỷ" : "Đang giữ"}
          </span>
        </div>
        <p className="mt-2 text-lg font-semibold text-gray-900">{vow.description}</p>
        {vow.startDate && (
          <p className="mt-2 text-sm text-gray-400">
            Từ {new Date(vow.startDate).toLocaleDateString("vi-VN")}
            {vow.endDate && ` → ${new Date(vow.endDate).toLocaleDateString("vi-VN")}`}
          </p>
        )}
      </div>

      {/* Progress */}
      {vow.targetCount != null && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-base font-medium text-gray-700">Tiến độ</p>
            <p className="text-2xl font-bold text-amber-700">{vow.progressPercent}%</p>
          </div>
          <ProgressBar percent={vow.progressPercent} />
          <p className="mt-2 text-sm text-gray-500">
            {vow.currentCount.toLocaleString("vi-VN")} / {vow.targetCount.toLocaleString("vi-VN")}
          </p>
        </div>
      )}

      {/* Update progress form (active only) */}
      {isActive && (
        <form onSubmit={(e) => void handleSubmit(onProgress)(e)} className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-4">
          <h3 className="text-base font-semibold text-amber-900">Ghi tiến độ</h3>
          <div className="flex items-center gap-3">
            <label className="text-base text-gray-700">Thêm</label>
            <input
              type="number"
              min={1}
              max={10000}
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-xl text-center font-bold focus:border-amber-400 focus:outline-none"
              {...register("addCount")}
            />
            <label className="text-base text-gray-700">lần</label>
          </div>
          {errors.addCount && <p className="text-sm text-red-600">{errors.addCount.message}</p>}
          <input
            type="text"
            placeholder="Ghi chú (tuỳ chọn)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-amber-400 focus:outline-none"
            {...register("note")}
          />
          <button
            type="submit"
            disabled={updateProgress.isPending}
            className="w-full rounded-xl bg-amber-600 py-3 text-lg font-semibold text-white hover:bg-amber-700 disabled:opacity-60 min-h-[52px]"
          >
            {updateProgress.isPending ? "Đang lưu..." : "Ghi tiến độ"}
          </button>
          {updateProgress.isSuccess && <p className="text-center text-sm text-green-700">✓ Đã cập nhật tiến độ.</p>}
        </form>
      )}

      {/* Fulfill */}
      {isActive && (
        <div>
          {!showFulfillConfirm ? (
            <button
              onClick={() => setShowFulfillConfirm(true)}
              className="w-full rounded-xl border border-green-400 bg-green-50 py-3 text-lg font-semibold text-green-800 hover:bg-green-100 min-h-[52px]"
            >
              Viên mãn nguyện này
            </button>
          ) : (
            <div className="rounded-xl border border-green-300 bg-green-50 p-4 space-y-3">
              <p className="text-base font-medium text-green-800">Xác nhận viên mãn?</p>
              <p className="text-sm text-green-700">Hành động này không thể hoàn tác.</p>
              <div className="flex gap-3">
                <button
                  onClick={doFulfill}
                  disabled={fulfill.isPending}
                  className="flex-1 rounded-xl bg-green-600 py-3 text-base font-semibold text-white hover:bg-green-700 disabled:opacity-60 min-h-[48px]"
                >
                  {fulfill.isPending ? "Đang xử lý..." : "Xác nhận viên mãn"}
                </button>
                <button
                  onClick={() => setShowFulfillConfirm(false)}
                  className="rounded-xl border border-gray-300 px-4 py-3 text-base min-h-[48px]"
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Merit transfer info */}
      {vow.totalTransferPercent > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">
            Đã hồi hướng: <strong className="text-gray-900">{vow.totalTransferPercent}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}
