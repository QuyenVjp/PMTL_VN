import { useState } from "react";
import { useNavigateTo } from "@/lib/router-utils";
import { CheckCircleIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { WorkspaceRowActions, WorkspaceConfirmDialog } from "@/components/workspace";
import type { GuideItem } from "@/features/guides/queries";
import { usePublishGuide, useDeleteGuide } from "@/features/guides/mutations";

type GuidesRowActionsProps = {
  row: GuideItem;
  detailBasePath?: string;
};

export function GuidesRowActions({ row, detailBasePath = "/noi-dung/huong-dan" }: GuidesRowActionsProps) {
  const navigateTo = useNavigateTo();
  const publishGuide = usePublishGuide();
  const deleteGuide = useDeleteGuide();

  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <WorkspaceRowActions
        actions={[
          {
            label: "Chỉnh sửa",
            icon: PencilIcon,
            onClick: () => navigateTo(`${detailBasePath}/${row.publicId}`),
          },
          ...(row.status === "DRAFT"
            ? [
                {
                  label: "Xuất bản",
                  icon: CheckCircleIcon,
                  onClick: () => setConfirmPublish(true),
                },
              ]
            : []),
          {
            label: "Xoá",
            icon: Trash2Icon,
            onClick: () => setConfirmDelete(true),
            variant: "destructive" as const,
            separator: true,
          },
        ]}
      />

      <WorkspaceConfirmDialog
        open={confirmPublish}
        onOpenChange={setConfirmPublish}
        title="Xuất bản hướng dẫn"
        description={
          <>
            Xuất bản <span className="font-semibold text-foreground">{row.title}</span>? Bài viết
            sẽ hiển thị công khai ngay lập tức.
          </>
        }
        confirmLabel="Xuất bản"
        isPending={publishGuide.isPending}
        onConfirm={() =>
          publishGuide.mutate(row.publicId, {
            onSuccess: () => setConfirmPublish(false),
          })
        }
      />

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá hướng dẫn"
        description={
          <>
            Xoá <span className="font-semibold text-foreground">{row.title}</span>? Thao tác này
            không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteGuide.isPending}
        onConfirm={() =>
          deleteGuide.mutate(row.publicId, {
            onSuccess: () => setConfirmDelete(false),
          })
        }
      />
    </>
  );
}
