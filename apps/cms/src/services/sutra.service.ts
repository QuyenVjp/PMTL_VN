import { buildSlug, extractLexicalPlainText } from "@/services/content-helpers.service";
import { ensurePublicId } from "@/services/public-id.service";

function sanitizeText(value?: string | null): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeNumber(value?: number | null): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }

  return Math.floor(value);
}

export function prepareSutraData<T extends { publicId?: string | null | undefined; title?: string | null | undefined; slug?: string | null | undefined; description?: string | null | undefined; shortExcerpt?: string | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: sanitizeText(input.title),
      slug: sanitizeText(input.slug) || buildSlug(input.title),
      description: sanitizeText(input.description),
      shortExcerpt: sanitizeText(input.shortExcerpt),
    },
    "sut",
  ) as T;
}

export function prepareSutraVolumeData<T extends { publicId?: string | null | undefined; title?: string | null | undefined; description?: string | null | undefined; volumeNumber?: number | null | undefined; sortOrder?: number | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: sanitizeText(input.title),
      description: sanitizeText(input.description),
      volumeNumber: normalizeNumber(input.volumeNumber),
      sortOrder: normalizeNumber(input.sortOrder),
    },
    "suv",
  ) as T;
}

export function estimateReadMinutes(content: unknown): number {
  const plainText = extractLexicalPlainText(content);
  const words = plainText.split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 220));
}

export function prepareSutraChapterData<T extends { publicId?: string | null | undefined; title?: string | null | undefined; slug?: string | null | undefined; openingText?: string | null | undefined; endingText?: string | null | undefined; chapterNumber?: number | null | undefined; sortOrder?: number | null | undefined; content?: unknown; estimatedReadMinutes?: number | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: sanitizeText(input.title),
      slug: sanitizeText(input.slug) || buildSlug(input.title),
      openingText: sanitizeText(input.openingText),
      endingText: sanitizeText(input.endingText),
      chapterNumber: normalizeNumber(input.chapterNumber),
      sortOrder: normalizeNumber(input.sortOrder),
      estimatedReadMinutes: normalizeNumber(input.estimatedReadMinutes) || estimateReadMinutes(input.content),
    },
    "suc",
  ) as T;
}

export function mapSutraToPublicDTO<T extends { publicId?: string | null | undefined; title?: string | null | undefined; slug?: string | null | undefined; description?: string | null | undefined; shortExcerpt?: string | null | undefined }>(sutra: T) {
  return {
    id: sutra.publicId ?? null,
    title: sutra.title ?? "",
    slug: sutra.slug ?? "",
    description: sutra.description ?? "",
    shortExcerpt: sutra.shortExcerpt ?? "",
  };
}

export function mapSutraVolumeToDTO<T extends { publicId?: string | null | undefined; title?: string | null | undefined; volumeNumber?: number | null | undefined }>(volume: T) {
  return {
    id: volume.publicId ?? null,
    title: volume.title ?? "",
    volumeNumber: volume.volumeNumber ?? 0,
  };
}

export function mapSutraChapterToDTO<T extends { publicId?: string | null | undefined; title?: string | null | undefined; slug?: string | null | undefined; estimatedReadMinutes?: number | null | undefined }>(chapter: T) {
  return {
    id: chapter.publicId ?? null,
    title: chapter.title ?? "",
    slug: chapter.slug ?? "",
    estimatedReadMinutes: chapter.estimatedReadMinutes ?? 0,
  };
}

export function mapGlossaryOverlay<T>(glossary: T[]): T[] {
  return glossary;
}

export function upsertBookmark<T extends { publicId?: string | null | undefined; excerpt?: string | null | undefined; note?: string | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      excerpt: sanitizeText(input.excerpt),
      note: sanitizeText(input.note),
    },
    "sbm",
  ) as T;
}

export function deleteBookmark(): void {
  return;
}

export function upsertReadingProgress<T extends { publicId?: string | null | undefined; scrollPercent?: number | null | undefined; lastReadAt?: string | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      scrollPercent: normalizeNumber(input.scrollPercent),
      lastReadAt: input.lastReadAt ?? new Date().toISOString(),
    },
    "srp",
  ) as T;
}

export function mapSutraReaderDTO<T>(input: T): T {
  return input;
}
