"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/form";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { gongkeByDateOptions } from "@/features/engagement/queries";
import { useUpsertGongke } from "@/features/engagement/mutations";

// Core daily practice pillars (advisory defaults per PMTL practice canon)
const CORE_ITEMS = [
  { key: "daiBi", label: "Chú Đại Bi" },
  { key: "tamKinh", label: "Bát Nhã Tâm Kinh" },
  { key: "samHoiVan", label: "Lễ Phật Đại Sám Hối Văn" },
];

const schema = z.object({
  busyMode: z.boolean().default(false),
  heartIncense: z.boolean().default(false),
  note: z.string().max(500).optional(),
  items: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      count: z.coerce.number().int().min(0).max(10000).default(0),
    }),
  ),
});

type FormValues = z.infer<typeof schema>;

export function GongkeForm() {
  // Calculate today client-side — safe in a Client Component (no prerender conflict)
  const date = new Date().toISOString().slice(0, 10);
  const { data: existing } = useQuery({ ...gongkeByDateOptions(date), retry: false });
  const upsert = useUpsertGongke();

  const { register, handleSubmit, watch, setValue, control, reset, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        busyMode: false,
        heartIncense: false,
        note: "",
        items: CORE_ITEMS.map((item) => ({ ...item, count: 0 })),
      },
    });

  const { fields } = useFieldArray({ control, name: "items" });
  const busyMode = watch("busyMode");

  // Populate form when existing log loads
  useEffect(() => {
    if (existing) {
      reset({
        busyMode: existing.busyMode,
        heartIncense: existing.heartIncense,
        note: existing.note ?? "",
        items: CORE_ITEMS.map((item) => ({
          ...item,
          count: existing.coreCounts[item.key] ?? 0,
        })),
      });
    }
  }, [existing, reset]);

  function onSubmit(values: FormValues) {
    const coreCounts: Record<string, number> = {};
    for (const item of values.items) {
      if (item.count > 0) coreCounts[item.key] = item.count;
    }
    upsert.mutate({ date, coreCounts, busyMode: values.busyMode, heartIncense: values.heartIncense, note: values.note });
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="space-y-6">
      {/* Busy mode toggle */}
      <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 cursor-pointer min-h-[56px]">
        <input
          type="checkbox"
          className="h-6 w-6 rounded accent-amber-600"
          {...register("busyMode")}
          onChange={(e) => {
            setValue("busyMode", e.target.checked);
            if (e.target.checked) setValue("heartIncense", true);
          }}
        />
        <span className="text-lg text-gray-800">
          Tôi bận hôm nay — chỉ thắp tâm hương
        </span>
      </label>

      {/* Heart incense (shown when busyMode OR manually) */}
      {busyMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-800">
          🕯️ Tâm hương đã được ghi nhận. Bạn vẫn giữ được nhịp tu dù bận rộn.
        </div>
      )}

      {/* Core counts — hidden when busy mode */}
      {!busyMode && (
        <fieldset className="space-y-3">
          <legend className="text-base font-semibold text-gray-700">Số biến hôm nay</legend>
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-3">
              <label className="flex-1 text-lg text-gray-800" htmlFor={`item-${field.key}`}>
                {field.label}
              </label>
              <input
                id={`item-${field.key}`}
                type="number"
                min={0}
                max={10000}
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-xl text-center font-bold text-gray-900 focus:border-amber-400 focus:outline-none"
                {...register(`items.${index}.count`)}
              />
            </div>
          ))}
          {errors.items && (
            <p className="text-sm text-red-600">Vui lòng kiểm tra lại số biến.</p>
          )}
        </fieldset>
      )}

      {/* Heart incense toggle (manual) */}
      {!busyMode && (
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            className="h-6 w-6 rounded accent-amber-600"
            {...register("heartIncense")}
          />
          <span className="text-base text-gray-700">Có thắp tâm hương hôm nay</span>
        </label>
      )}

      {/* Note */}
      <div>
        <label className="block text-base text-gray-700 mb-1" htmlFor="note">
          Ghi chú (tuỳ chọn)
        </label>
        <textarea
          id="note"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-amber-400 focus:outline-none resize-none"
          placeholder="Ghi thêm nếu có..."
          {...register("note")}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={upsert.isPending}
        className="w-full rounded-xl bg-amber-600 py-4 text-xl font-semibold text-white hover:bg-amber-700 disabled:opacity-60 min-h-[56px]"
      >
        {upsert.isPending ? "Đang lưu..." : "Lưu buổi tu"}
      </button>

      {upsert.isSuccess && (
        <p className="text-center text-base text-green-700">✓ Đã lưu buổi tu hôm nay.</p>
      )}
      {upsert.isError && (
        <p className="text-center text-base text-red-600">Lỗi khi lưu. Vui lòng thử lại.</p>
      )}
    </form>
  );
}
