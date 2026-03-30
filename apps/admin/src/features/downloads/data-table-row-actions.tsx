import { CheckCircleIcon, EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { WorkspaceRowActions } from "@/components/workspace";
import type { DownloadItem } from "@/features/downloads/queries";
import { useDownloads } from "@/features/downloads/context";

export function DownloadsRowActions({ row }: { row: DownloadItem }) {
  const { setOpen, setCurrentRow } = useDownloads();

  const open = (dialog: "edit" | "detail" | "publish" | "unpublish" | "delete") => {
    setCurrentRow(row);
    setOpen(dialog);
  };

  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Chỉnh sửa",
          icon: PencilIcon,
          onClick: () => open("edit"),
        },
        {
          label: "Xem chi tiết",
          icon: EyeIcon,
          onClick: () => open("detail"),
        },
        ...(row.status === "DRAFT"
          ? [
              {
                label: "Xuất bản",
                icon: CheckCircleIcon,
                onClick: () => open("publish"),
              },
            ]
          : row.status === "PUBLISHED"
            ? [
                {
                  label: "Gỡ xuất bản",
                  icon: EyeOffIcon,
                  onClick: () => open("unpublish"),
                },
              ]
            : []),
        {
          label: "Xoá",
          icon: Trash2Icon,
          onClick: () => open("delete"),
          variant: "destructive" as const,
          separator: true,
        },
      ]}
    />
  );
}
