"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useUpdateVowProgress } from "@/features/vows-merit/mutations";
import { vowListOptions } from "@/features/vows-merit/queries";

// Log a life-release session by updating progress on the active vow.
// Also allows logging without a linked vow (note-only entry via count update).
const schema = z.object({
  vowPublicId: z.string().optional(),
  addCount: z.coerce.number().int().min(1, "Tối thiểu 1").max(10000),
  note: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export function LogLifeReleaseForm() {
  const router = useRouter();
  const updateProgress = useUpdateVowProgress();
  const { data: activeVows = [] } = useQuery(vowListOptions({ status: "ACTIVE" }));
  const lifeReleaseVows = activeVows.filter((v) => v.vowType === "LIFE_RELEASE");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vowPublicId: lifeReleaseVows[0]?.publicId ?? "",
      addCount: 1,
    },
  });

  const selectedVowId = watch("vowPublicId");
  const selectedVow = lifeReleaseVows.find((v) => v.publicId === selectedVowId);

  function onSubmit(values: FormValues) {
    if (!values.vowPublicId) {
      // No vow linked — just navigate back with a note (future: standalone log table)
      router.push("/phong-sanh");
      return;
    }
    updateProgress.mutate(
      { publicId: values.vowPublicId, addCount: values.addCount, note: values.note },
      { onSuccess: () => router.push("/phong-sanh") },
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
      {/* Link to existing vow */}
      {lifeReleaseVows.length > 0 ? (
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Nguyện phóng sanh liên kết
          </label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-3 text-lg bg-white focus:border-amber-400 focus:outline-none"
            {...register("vowPublicId")}
          >
            <option value="">— Không liên kết nguyện —</option>
            {lifeReleaseVows.map((v) => (
              <option key={v.publicId} value={v.publicId}>
                {v.description.slice(0, 60)}{v.description.length > 60 ? "..." : ""}
              </option>
            ))}
          </select>
          {selectedVow?.targetCount != null && (
            <p className="mt-1 text-sm text-gray-500">
              Tiến độ hiện tại: {selectedVow.currentCount.toLocaleString("vi-VN")} / {selectedVow.targetCount.toLocaleString("vi-VN")} ({selectedVow.progressPercent}%)
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
          Chưa có nguyện phóng sanh nào. Buổi này sẽ được ghi nhận không liên kết nguyện.{" "}
          <a href="/phat-nguyen/tao-moi" className="underline">Tạo nguyện mới?</a>
        </div>
      )}

      {/* Count */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          Số lần / quy mô buổi hôm nay
        </label>
        <input
          type="number"
          min={1}
          max={10000}
          className="w-32 rounded-lg border border-gray-300 px-3 py-3 text-2xl text-center font-bold focus:border-amber-400 focus:outline-none"
          {...register("addCount")}
        />
        {errors.addCount && <p className="mt-1 text-sm text-red-600">{errors.addCount.message}</p>}
      </div>

      {/* Note */}
      <div>
        <label className="block text-base text-gray-700 mb-1">
          Ghi chú (loại vật, địa điểm, nghi thức — tuỳ chọn)
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-amber-400 focus:outline-none resize-none"
          placeholder="Ví dụ: Cá lóc, sông Hương, niệm Đại Bi 7 biến..."
          {...register("note")}
        />
      </div>

      <button
        type="submit"
        disabled={updateProgress.isPending}
        className="w-full rounded-xl bg-amber-600 py-4 text-xl font-semibold text-white hover:bg-amber-700 disabled:opacity-60 min-h-[56px]"
      >
        {updateProgress.isPending ? "Đang lưu..." : "Ghi lại buổi phóng sanh"}
      </button>

      {updateProgress.isError && (
        <p className="text-center text-sm text-red-600">Lỗi khi lưu. Vui lòng thử lại.</p>
      )}
    </form>
  );
}
