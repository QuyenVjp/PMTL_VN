import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DownloadsProvider, useDownloads } from "@/features/downloads/context";
import { DownloadsDialogs } from "@/features/downloads/downloads-dialogs";
import { DownloadsDetailSheet } from "@/features/downloads/downloads-detail";
import { DownloadsTable } from "@/features/downloads/downloads-table";

function DownloadsPrimaryButtons() {
  const { setOpen } = useDownloads();
  return (
    <Button onClick={() => setOpen("create")}>
      <PlusIcon className="size-4" />
      Thêm tài liệu
    </Button>
  );
}

function DownloadsDetailPortal() {
  const { open, currentRow, setOpen, setCurrentRow } = useDownloads();
  if (!currentRow) return null;
  const handleClose = () => { setOpen(null); setCurrentRow(null); };
  return (
    <DownloadsDetailSheet
      open={open === "detail"}
      onClose={handleClose}
      currentRow={currentRow}
    />
  );
}

type DownloadsPageProps = {
  title?: string;
  description?: string;
  defaultCategory?: string;
};

export function DownloadsPage({
  title = "Tài liệu",
  description = "Quản trị tài liệu tải về cho thành viên.",
  defaultCategory,
}: DownloadsPageProps) {
  return (
    <DownloadsProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
          <DownloadsPrimaryButtons />
        </div>

        <DownloadsTable defaultCategory={defaultCategory} />
      </div>

      <DownloadsDialogs defaultCategory={defaultCategory} />
      <DownloadsDetailPortal />
    </DownloadsProvider>
  );
}
