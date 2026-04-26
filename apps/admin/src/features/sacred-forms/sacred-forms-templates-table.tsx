import { useMemo, useState } from "react";
import { type ColumnDef, getCoreRowModel } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { EyeIcon, PowerIcon } from "lucide-react";

import { useSafeReactTable } from "@/lib/table/use-safe-react-table";
import {
  WorkspaceDataTable,
  WorkspaceDetailField,
  WorkspaceDetailStandardSections,
  WorkspaceDetailSheet,
  WorkspaceDetailSection,
  WorkspaceRowActions,
} from "@/components/workspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { templateListOptions, type TemplateListItem } from "./queries.js";
import { useToggleTemplate } from "./mutations.js";
import { FORM_TYPE_LABELS } from "./types.js";

function TemplateStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "secondary" : "outline"}>
      {isActive ? "Đang hoạt động" : "Tạm dừng"}
    </Badge>
  );
}

function TemplateRowActions({
  item,
  onDetail,
}: {
  item: TemplateListItem;
  onDetail: (item: TemplateListItem) => void;
}) {
  const toggle = useToggleTemplate();

  const actions = [
    {
      label: "Xem chi tiết",
      icon: EyeIcon,
      onClick: () => onDetail(item),
    },
    {
      label: item.isActive ? "Tắt hoạt động" : "Kích hoạt",
      icon: PowerIcon,
      onClick: () => {
        toggle.mutate({ publicId: item.id, isActive: !item.isActive });
      },
    },
  ];

  return <WorkspaceRowActions actions={actions} />;
}

export function SacredFormTemplatesTable() {
  const { data: envelope, isLoading } = useQuery(templateListOptions());
  const templates = useMemo(() => envelope?.data ?? [], [envelope]);
  const [detailItem, setDetailItem] = useState<TemplateListItem | null>(null);
  const toggle = useToggleTemplate();

  const templateColumns: ColumnDef<TemplateListItem>[] = useMemo(
    () => [
      { accessorKey: "titleVi", header: "Tên mẫu đơn" },
      {
        accessorKey: "formType",
        header: "Loại đơn",
        cell: ({ row }) => FORM_TYPE_LABELS[row.original.formType],
      },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => <TemplateStatusBadge isActive={row.original.isActive} />,
      },
      {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <TemplateRowActions item={row.original} onDetail={setDetailItem} />,
      },
    ],
    [],
  );

  const table = useSafeReactTable({
    data: templates,
    columns: templateColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <WorkspaceDataTable
        table={table}
        columns={templateColumns}
        isLoading={isLoading}
        emptyMessage="Chưa có mẫu đơn nào."
        onRowClick={setDetailItem}
      />
      <WorkspaceDetailSheet
        open={Boolean(detailItem)}
        onOpenChange={(open) => {
          if (!open) setDetailItem(null);
        }}
        title={detailItem?.titleVi ?? "Chi tiết mẫu đơn"}
        subtitle={detailItem ? FORM_TYPE_LABELS[detailItem.formType] : undefined}
        status={detailItem ? <TemplateStatusBadge isActive={detailItem.isActive} /> : undefined}
        primaryActions={
          detailItem ? (
            <Button
              size="sm"
              variant={detailItem.isActive ? "outline" : "default"}
              disabled={toggle.isPending}
              onClick={() => {
                toggle.mutate(
                  { publicId: detailItem.id, isActive: !detailItem.isActive },
                  {
                    onSuccess: () => {
                      setDetailItem({ ...detailItem, isActive: !detailItem.isActive });
                    },
                  },
                );
              }}
            >
              <PowerIcon data-icon="inline-start" />
              {detailItem.isActive ? "Tắt hoạt động" : "Kích hoạt"}
            </Button>
          ) : null
        }
      >
        {detailItem ? (
          <>
            <WorkspaceDetailSection title="Thông tin">
              <WorkspaceDetailField label="Tên tiếng Việt" value={detailItem.titleVi} />
              <WorkspaceDetailField label="Tên Hán tự" value={detailItem.titleZh} />
              <WorkspaceDetailField label="Loại đơn" value={FORM_TYPE_LABELS[detailItem.formType]} />
              <WorkspaceDetailField label="Ngày tạo" value={new Date(detailItem.createdAt).toLocaleDateString("vi-VN")} />
            </WorkspaceDetailSection>
            <WorkspaceDetailSection title="Mô tả">
              <WorkspaceDetailField label="Nội dung" value={detailItem.description} stacked />
            </WorkspaceDetailSection>
          </>
        ) : null}
      <WorkspaceDetailStandardSections />
      </WorkspaceDetailSheet>
    </>
  );
}
