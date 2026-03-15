import { CMS_API_URL, getCmsMediaUrl } from "@/lib/cms";

type CmsMediaInput = {
  url?: string;
  formats?: Record<string, { url: string }>;
};

export function resolveMediaUrl(media: CmsMediaInput | null | undefined): string | null {
  if (!media) {
    return null;
  }

  return getCmsMediaUrl(media?.url ?? null);
}

export function resolveThumbnailUrl(media: CmsMediaInput | null | undefined): string | null {
  if (!media) {
    return null;
  }

  const formats = media?.formats ?? null;
  const url = formats?.thumbnail?.url ?? formats?.small?.url ?? media?.url ?? null;

  return getCmsMediaUrl(url);
}

export function resolveImageWithFallback(
  media: CmsMediaInput | null | undefined,
  fallback = "/images/hero-bg.jpg",
): string {
  return resolveMediaUrl(media) ?? fallback;
}

export function resolveFileUrl(media: CmsMediaInput | null | undefined): string | null {
  return resolveMediaUrl(media);
}

export function buildSearchFilter(query: string, fields: string[]): Record<string, unknown> {
  if (!query.trim()) {
    return {};
  }

  return {
    $or: fields.map((field) => ({
      [field]: { $containsi: query.trim() },
    })),
  };
}

export function buildPagination(page = 1, pageSize = 12) {
  return { page: Math.max(1, page), pageSize: Math.min(100, Math.max(1, pageSize)) };
}

export function mergeFilters(...filters: Array<Record<string, unknown>>): Record<string, unknown> {
  const nonEmpty = filters.filter((filter) => Object.keys(filter).length > 0);

  if (nonEmpty.length === 0) {
    return {};
  }

  if (nonEmpty.length === 1) {
    return nonEmpty[0];
  }

  return { $and: nonEmpty };
}

export function formatDateVN(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return "";
  }

  const months = [
    "tháng 1",
    "tháng 2",
    "tháng 3",
    "tháng 4",
    "tháng 5",
    "tháng 6",
    "tháng 7",
    "tháng 8",
    "tháng 9",
    "tháng 10",
    "tháng 11",
    "tháng 12",
  ];
  const date = new Date(dateStr);

  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return "";
  }

  const date = new Date(dateStr);

  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return "";
  }

  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;

  return `${Math.floor(months / 12)} năm trước`;
}

export function formatCount(value: number | undefined | null): string {
  if (!value) {
    return "0";
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return String(value);
}

export function truncate(str: string | null | undefined, maxLen = 120): string {
  if (!str) {
    return "";
  }

  if (str.length <= maxLen) {
    return str;
  }

  return `${str.slice(0, maxLen).trimEnd()}…`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) {
    return "";
  }

  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export { getCmsMediaUrl };

export function buildOgImageUrl(media: CmsMediaInput | null | undefined): string | null {
  const url = resolveMediaUrl(media);

  if (!url) {
    return null;
  }

  if (url.startsWith("http")) {
    return url;
  }

  return `${CMS_API_URL}${url}`;
}

export function buildDownloadUrl(fileMedia: CmsMediaInput | null | undefined): string | null {
  return resolveFileUrl(fileMedia);
}

export function describeFile(
  media:
    | {
        name?: string;
        ext?: string;
        size?: number;
      }
    | null
    | undefined,
): { name: string; sizeText: string } {
  if (!media) {
    return { name: "Không rõ", sizeText: "" };
  }

  const sizeKB = (media.size ?? 0) / 1024;
  const sizeText = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(0)} KB`;

  return {
    name: media.name ?? "file",
    sizeText,
  };
}
