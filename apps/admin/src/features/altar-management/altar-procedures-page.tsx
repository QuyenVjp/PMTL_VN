import { useQuery, queryOptions } from "@tanstack/react-query";

import { adminClient } from "@/lib/api/admin-client.js";

import { altarMgmtKeys } from "./queries.js";

interface ProtocolTemplate {
  publicId?: string;
  id?: string;
  protocolType: string;
  titleVi: string;
  descriptionVi?: string | null;
  steps?: Array<{ title: string; description?: string | null }> | null;
  isActive?: boolean;
}

const protocolTemplatesOptions = queryOptions({
  queryKey: [...altarMgmtKeys.all, "protocol-templates"] as const,
  queryFn: () =>
    adminClient.get<ProtocolTemplate[]>("/admin/altar-management/protocol-templates"),
});

export function AltarProceduresPage() {
  const { data, isLoading, isError } = useQuery(protocolTemplatesOptions);
  const templates = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy trình bàn thờ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hướng dẫn và quy trình chuẩn cho việc chăm sóc bàn thờ. Dữ liệu lấy từ máy chủ.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Đang tải quy trình…
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
