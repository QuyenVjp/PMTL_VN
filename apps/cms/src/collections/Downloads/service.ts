import { ensurePublicId } from "@/services/public-id.service";

type DownloadData = {
  publicId?: string | null;
  title?: string | null;
  description?: string | null;
  externalURL?: string | null;
  fileType?: string | null;
  category?: string | null;
  groupYear?: number | null;
  groupLabel?: string | null;
  notes?: string | null;
  sortOrder?: number | null;
  fileSizeMB?: number | null;
};

export function prepareDownloadData<T extends DownloadData>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: input.title?.trim() ?? input.title,
      description: input.description?.trim() ?? "",
      externalURL: input.externalURL?.trim() ?? "",
      fileType: input.fileType?.trim() ?? "",
      category: input.category?.trim() ?? "",
      groupLabel: input.groupLabel?.trim() ?? "",
      notes: input.notes?.trim() ?? "",
      sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : 0,
      fileSizeMB: typeof input.fileSizeMB === "number" ? input.fileSizeMB : 0,
    },
    "dwl",
  );
}

export function mapDownloadToPublicDTO(download: DownloadData & { id?: string | number | null }) {
  return {
    id: download.publicId ?? (download.id ? String(download.id) : null),
    title: download.title ?? "",
    description: download.description ?? "",
    externalURL: download.externalURL ?? "",
    fileType: download.fileType ?? "",
  };
}

export function deriveDownloadMeta(): void {
  return;
}
