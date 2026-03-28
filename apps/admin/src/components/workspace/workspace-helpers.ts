/**
 * Shared display helpers for workspace list pages.
 *
 * These were previously duplicated inline across module-pages.tsx.
 * Single canonical copy here prevents drift between pages.
 */

// ── Status labels ────────────────────────────────────────────────────

export function contentStatusLabel(status: string): string {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "DRAFT") return "Nháp";
  if (status === "ARCHIVED") return "Đã ẩn";
  return status;
}

export function contentStatusBadgeClass(status: string): string {
  if (status === "PUBLISHED")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "DRAFT")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

export function mediaAssetStatusLabel(status: string): string {
  if (status === "READY") return "Sẵn sàng";
  if (status === "UPLOADING") return "Đang tải";
  if (status === "ORPHANED") return "Mồ côi";
  if (status === "DELETED") return "Đã xoá";
  return status;
}

export function mediaAssetStatusBadgeClass(status: string): string {
  if (status === "READY")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "UPLOADING")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (status === "ORPHANED")
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
  return "";
}

// ── Category labels ──────────────────────────────────────────────────

const GUIDE_CATEGORY_LABELS: Record<string, string> = {
  BEGINNER: "Nhập môn",
  DAILY_PRACTICE: "Hành trì hằng ngày",
  LITTLE_HOUSE: "Ngôi Nhà Nhỏ",
  LIFE_RELEASE: "Phóng sanh",
  GENERAL: "Chung",
};

export function guideCategoryLabel(cat: string): string {
  return GUIDE_CATEGORY_LABELS[cat] ?? cat;
}

export function guideCategoryBadgeClass(cat: string): string {
  if (cat === "BEGINNER")
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  if (cat === "DAILY_PRACTICE")
    return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-400";
  if (cat === "LITTLE_HOUSE")
    return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400";
  if (cat === "LIFE_RELEASE")
    return "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400";
  return "";
}

const DOWNLOAD_CATEGORY_LABELS: Record<string, string> = {
  GUIDE: "Hướng dẫn",
  TEMPLATE: "Template",
  REFERENCE: "Tham khảo",
  FAQ: "FAQ",
};

export function downloadCategoryLabel(cat: string): string {
  return DOWNLOAD_CATEGORY_LABELS[cat] ?? cat;
}

// ── Time & size formatting ────────────────────────────────────────────

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Status filter option sets ─────────────────────────────────────────

export const CONTENT_STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PUBLISHED", label: contentStatusLabel("PUBLISHED") },
  { value: "DRAFT", label: contentStatusLabel("DRAFT") },
  { value: "ARCHIVED", label: contentStatusLabel("ARCHIVED") },
];

export const MEDIA_ASSET_STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "READY", label: mediaAssetStatusLabel("READY") },
  { value: "UPLOADING", label: mediaAssetStatusLabel("UPLOADING") },
  { value: "ORPHANED", label: mediaAssetStatusLabel("ORPHANED") },
];
