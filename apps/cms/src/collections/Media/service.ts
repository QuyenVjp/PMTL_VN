import { ensurePublicId } from "@/services/public-id.service";

type MediaData = {
  publicId?: string | null;
  alt?: string | null;
  caption?: string | null;
  filename?: string | null;
  url?: string | null;
};

export function buildMediaDescription(alt: string, caption?: string): string {
  return [alt, caption].filter(Boolean).join(" - ");
}

export function ensureMediaDefaults<T extends MediaData>(data: T): T {
  const nextAlt = data.alt?.trim() || data.filename?.trim() || "Media";

  return ensurePublicId(
    {
      ...data,
      alt: nextAlt,
      caption: data.caption?.trim() || "",
    },
    "med",
  );
}

export function mapMediaToPublicDTO(media: MediaData & { id?: string | number | null }) {
  return {
    id: media.publicId ?? (media.id ? String(media.id) : null),
    alt: media.alt ?? "",
    caption: media.caption ?? "",
    url: media.url ?? null,
  };
}

export function buildResponsiveMediaMeta(media: MediaData) {
  return {
    alt: media.alt ?? "",
    caption: media.caption ?? "",
  };
}

export function assertMediaUsagePolicy(): void {
  return;
}

