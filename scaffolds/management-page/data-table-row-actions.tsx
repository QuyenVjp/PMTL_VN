/**
 * SCAFFOLD — data-table-row-actions.tsx
 *
 * Constitution §3 row action order:
 *   1. "Xem chi tiết"  — always FIRST, opens detail sheet
 *   2. Quick status toggle (optional, e.g. "Xuất bản")
 *   3. "Xoá"           — always LAST, separated by divider
 *
 * Max 3 actions. All edit/publish/unpublish go inside the detail sheet.
 * Never build a custom DropdownMenu — always use WorkspaceRowActions.
 */
import { CheckCircleIcon, EyeIcon, Trash2Icon } from "lucide-react";

import { WorkspaceRowActions } from "@/components/workspace";
import type { [Feature]Item } from "@/features/[features]/queries";
import { use[Feature]s } from "@/features/[features]/context";

export function [Feature]sRowActions({ row }: { row: [Feature]Item }) {
  const { setOpen, setCurrentRow } = use[Feature]s();

  const open = (dialog: "detail" | "publish" | "delete") => {
    setCurrentRow(row);
    setOpen(dialog);
  };

  return (
    <WorkspaceRowActions
      actions={[
        {
          label: "Xem chi tiết",
          icon: EyeIcon,
          onClick: () => open("detail"),
        },
        // Uncomment if feature has a quick publish toggle:
        // ...(row.status === "DRAFT"
        //   ? [{ label: "Xuất bản", icon: CheckCircleIcon, onClick: () => open("publish") }]
        //   : []),
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
