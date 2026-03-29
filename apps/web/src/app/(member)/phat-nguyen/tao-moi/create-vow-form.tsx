"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateVow } from "@/features/vows-merit/mutations";

const schema = z
  .object({
    vowType: z.enum(["LIFE_RELEASE", "CHANTING", "SUTRA_READING", "CUSTOM"]),
    description: z.string().min(5, "Tối thiểu 5 ký tự").max(2000),
    hasTarget: z.boolean().default(false),
    targetCount: z.coerce.number().int().min(1).optional(),
    startDate: z.string().min(1, "Bắt buộc"),
    endDate: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.hasTarget && !val.targetCount) {
      ctx.addIssue({ code: "custom", message: "Vui lòng nhập mục tiêu", path: ["targetCount"] });
    }
    if (val.endDate && val.endDate < val.startDate) {
      ctx.addIssue({ code: "custom", message: "Ngày hoàn nguyện phải sau ngày phát nguyện", path: ["endDate"] });
    }
  });

type FormValues = z.infer<typeof schema>;

const VOW_TYPES = [
  { value: "CHANTING", label: "Niệm kinh" },
  { value: "LIFE_RELEASE", label: "Phóng sanh" },
  { value: "SUTRA_READING", label: "Đọc kinh" },
  { value: "CUSTOM", label: "Nguyện khác" },
] as const;

export function CreateVowForm() {
  const router = useRouter();
  const create = useCreateVow();
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { vowType: "CHANTING", hasTarget: false, startDate: today },
  });

  const hasTarget = watch("hasTarget");

  function onSubmit(values: FormValues) {
    create.mutate(
      {
        vowType: values.vowType,
        description: values.description,
        targetCount: values.hasTarget ? values.targetCount : undefined,
        startDate: values.startDate,
        endDate: values.endDate || undefined,
      },
      {
        onSuccess: (vow) => router.push(`/phat-nguyen/${vow.publicId}`),
      },
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-5">
      {/* Vow type */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-2">Loại nguyện</label>
        <div className="grid grid-cols-2 gap-2">
          {VOW_TYPES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 cursor-pointer min-h-[48px] has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50">
              <input type="radio" value={value} {...register("vowType")} className="accent-amber-600" />
              <span className="text-base text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Nội dung nguyện *</label>
        <textarea
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-3 text-lg focus:border-amber-400 focus:outline-none resize-none"
          placeholder="Tôi nguyện..."
          {...register("description")}
        />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Target count */}
      <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <input type="checkbox" className="h-6 w-6 rounded accent-amber-600" {...register("hasTarget")} />
        <span className="text-base text-gray-700">Đặt mục tiêu số lần / số biến</span>
      </label>
      {hasTarget && (
        <div>
          <label className="block text-base text-gray-700 mb-1">Mục tiêu</label>
          <input
            type="number"
            min={1}
            className="w-36 rounded-lg border border-gray-300 px-3 py-3 text-xl font-bold focus:border-amber-400 focus:outline-none"
            {...register("targetCount")}
          />
          {errors.targetCount && <p className="mt-1 text-sm text-red-600">{errors.targetCount.message}</p>}
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-base text-gray-700 mb-1">Ngày phát nguyện *</label>
          <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-amber-400 focus:outline-none" {...register("startDate")} />
          {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-base text-gray-700 mb-1">Hạn hoàn nguyện</label>
          <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-3 text-base focus:border-amber-400 focus:outline-none" {...register("endDate")} />
          {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={create.isPending}
        className="w-full rounded-xl bg-amber-600 py-4 text-xl font-semibold text-white hover:bg-amber-700 disabled:opacity-60 min-h-[56px]"
      >
        {create.isPending ? "Đang tạo..." : "Phát nguyện"}
      </button>

      {create.isError && <p className="text-sm text-red-600 text-center">Lỗi khi tạo nguyện. Vui lòng thử lại.</p>}
    </form>
  );
}
