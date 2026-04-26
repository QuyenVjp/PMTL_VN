import { useQuery } from "@tanstack/react-query";
import { BookOpenCheckIcon, EyeIcon, LockIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceScopeCards } from "@/components/workspace";
import { protocolTemplatesOptions } from "./queries.js";

export function AltarProceduresPage() {
  const { data, isLoading, isError } = useQuery(protocolTemplatesOptions());
  const templates = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy trình bàn thờ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hướng dẫn và quy trình chuẩn cho việc chăm sóc bàn thờ. Dữ liệu lấy từ máy chủ.
        </p>
      </div>

      <WorkspaceScopeCards
        items={[
          {
            title: "Static procedures",
            description: "Hiển thị quy trình đang được máy chủ công bố; không phải editor tạo mới quy trình.",
            badge: "Read-only",
            icon: BookOpenCheckIcon,
          },
          {
            title: "Admin scaffold chưa mở",
            description: "Bàn thờ thiếu contract/admin triple nên không thêm CRUD, publish hay reorder ở đây.",
            badge: "Blocked / stop",
            icon: LockIcon,
          },
          {
            title: "Không sửa member flow",
            description: "Admin chỉ xem hướng dẫn, còn trạng thái bàn thờ của thành viên vẫn thuộc engagement runtime.",
            badge: "Boundary",
            icon: EyeIcon,
          },
        ]}
      />

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border bg-card p-6">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-destructive">
          Không tải được quy trình bàn thờ.
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Chưa có quy trình nào được công bố.
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((tpl) => (
            <div
              key={tpl.publicId ?? tpl.id ?? tpl.protocolType}
              className="rounded-xl border bg-card p-6 space-y-4"
            >
              <div>
                <h2 className="text-lg font-semibold">{tpl.titleVi}</h2>
                {tpl.descriptionVi ? (
                  <p className="mt-1 text-sm text-muted-foreground">{tpl.descriptionVi}</p>
                ) : null}
              </div>
              {Array.isArray(tpl.steps) && tpl.steps.length > 0 ? (
                <ul className="space-y-3">
                  {tpl.steps.map((step, idx) => (
                    <li key={`${tpl.protocolType}-${idx}`} className="flex gap-3">
                      <span className="flex-shrink-0 flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{step.title}</p>
                        {step.description ? (
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
