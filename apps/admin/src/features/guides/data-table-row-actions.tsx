import { CheckCircleIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { WorkspaceRowActions } from "@/components/workspace";
import type { GuideItem } from "@/features/guides/queries";
import { useGuides } from "@/features/guides/context";

export function GuidesRowActions({ row }: { row: GuideItem }) {
  const { setOpen, setCurrentRow } = useGuides();

  const open = (dialog: "edit" | "publish" | "delete") => {
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
        ...(row.status === "DRAFT"
          ? [
              {
                label: "Xuất bản",
                icon: CheckCircleIcon,
                onClick: () => open("publish"),
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
