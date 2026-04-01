import { useState } from "react";
import { useNavigateTo } from "@/lib/router-utils";
import { CheckCircleIcon, EyeOffIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { WorkspaceRowActions, WorkspaceConfirmDialog } from "@/components/workspace";
import type { DownloadItem } from "@/features/downloads/queries";
import {
  usePublishDownload,
  useUnpublishDownload,
  useDeleteDownload,
} from "@/features/downloads/mutations";

type DownloadsRowActionsProps = {
  row: DownloadItem;
  detailBasePath?: string;
};

export function DownloadsRowActions({ row, detailBasePath = "/noi-dung/tai-lieu" }: DownloadsRowActionsProps) {
  const navigateTo = useNavigateTo();
  const publishDownload = usePublishDownload();
  const unpublishDownload = useUnpublishDownload();
  const deleteDownload = useDeleteDownload();

  const [confirmPublish, setConfirmPublish] = useState(false);
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);
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
            : row.status === "PUBLISHED"
              ? [
                  {
                    label: "Gỡ xuất bản",
                    icon: EyeOffIcon,
                    onClick: () => setConfirmUnpublish(true),
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
        title="Xuất bản tài liệu"
        description={
          <>
            Xuất bản <span className="font-semibold text-foreground">{row.title}</span>? Tài liệu
            sẽ hiển thị công khai ngay lập tức.
          </>
        }
        confirmLabel="Xuất bản"
        isPending={publishDownload.isPending}
        onConfirm={() =>
          publishDownload.mutate(row.publicId, {
            onSuccess: () => setConfirmPublish(false),
          })
        }
      />

      <WorkspaceConfirmDialog
        open={confirmUnpublish}
        onOpenChange={setConfirmUnpublish}
        title="Gỡ xuất bản tài liệu"
        description={
          <>
            Gỡ xuất bản <span className="font-semibold text-foreground">{row.title}</span>? Tài
            liệu sẽ chuyển về nháp.
          </>
        }
        confirmLabel="Gỡ xuất bản"
        isPending={unpublishDownload.isPending}
        onConfirm={() =>
          unpublishDownload.mutate(row.publicId, {
            onSuccess: () => setConfirmUnpublish(false),
          })
        }
      />

      <WorkspaceConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá tài liệu"
        description={
          <>
            Xoá <span className="font-semibold text-foreground">{row.title}</span>? Thao tác này
            không thể hoàn tác.
          </>
        }
        confirmLabel="Xoá"
        variant="destructive"
        isPending={deleteDownload.isPending}
        onConfirm={() =>
          deleteDownload.mutate(row.publicId, {
            onSuccess: () => setConfirmDelete(false),
          })
        }
      />
    </>
  );
}
