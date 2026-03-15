import { ensurePublicId } from "@/services/public-id.service";

type BeginnerGuideData = {
  publicId?: string | null;
  title?: string | null;
  description?: string | null;
  iconName?: string | null;
  pdfURL?: string | null;
  videoURL?: string | null;
  order?: number | null;
};

export function prepareBeginnerGuideData<T extends BeginnerGuideData>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: input.title?.trim() ?? input.title,
      description: input.description?.trim() ?? "",
      iconName: input.iconName?.trim() ?? "",
      pdfURL: input.pdfURL?.trim() ?? "",
      videoURL: input.videoURL?.trim() ?? "",
      order: typeof input.order === "number" ? input.order : 0,
    },
    "gui",
  );
}

export function mapGuideToPublicDTO(guide: BeginnerGuideData & { id?: string | number | null }) {
  return {
    id: guide.publicId ?? (guide.id ? String(guide.id) : null),
    title: guide.title ?? "",
    description: guide.description ?? "",
    iconName: guide.iconName ?? "",
  };
}

export function validateGuideIconName(): void {
  return;
}
