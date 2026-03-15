// ─────────────────────────────────────────────────────────────
//  lib/api/navigation.ts — Navigation builder (Payload-first)
//  Server-side only
// ─────────────────────────────────────────────────────────────

import { cmsGet } from "@/lib/cms/client";
import { unstable_cache } from "next/cache";

export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavigationData {
  topLevel: NavItem[];
  tuHoc: NavGroup["items"];
  congDong: NavGroup["items"];
  hoTri: NavItem;
}

type PayloadNavigationItem = {
  href?: string | null;
  label?: string | null;
  openInNewTab?: boolean;
};

type PayloadNavigationGlobal = {
  ctaHref?: string | null;
  ctaLabel?: string | null;
  items?: PayloadNavigationItem[] | null;
};

const DEFAULT_TOP_LEVEL: NavItem[] = [
  { label: "Trang Chủ", href: "/" },
  { label: "Khai Thị", href: "/blog" },
  { label: "Lịch Tu Học", href: "/lunar-calendar" },
  { label: "Niệm Kinh", href: "/niem-kinh" },
  { label: "Sự Kiện & Pháp Hội", href: "/events" },
  { label: "Diễn Đàn", href: "/shares" },
];

const DEFAULT_TU_HOC: NavItem[] = [
  { label: "Hướng Dẫn Sơ Học", href: "/beginner-guide" },
  { label: "Thư Viện Tài Liệu", href: "/library" },
  { label: "Thư Viện Hình Ảnh", href: "/gallery" },
  { label: "Phim Truyện & Video", href: "/videos" },
  { label: "Đài Phát Thanh", href: "/radio" },
  { label: "Danh Bạ Toàn Cầu", href: "/directory" },
];

const DEFAULT_CONG_DONG: NavItem[] = [
  { label: "Hỏi Đáp & Sổ Lưu Bút", href: "/guestbook" },
  { label: "Danh Bạ Toàn Cầu", href: "/directory" },
];

function sanitizeNavItems(items: PayloadNavigationItem[] | null | undefined): NavItem[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const label = item?.label?.trim();
      const href = item?.href?.trim();
      if (!label || !href) return null;
      return { href, label };
    })
    .filter((item): item is NavItem => item !== null);
}

const getNavigationGlobal = unstable_cache(
  async (): Promise<PayloadNavigationGlobal> => {
    return cmsGet<PayloadNavigationGlobal>("/api/navigation", {
      next: { revalidate: 300, tags: ["global-navigation"] },
    });
  },
  ["global-navigation"],
  {
    revalidate: 300,
    tags: ["global-navigation"],
  },
);

export async function buildNavigation(): Promise<NavigationData> {
  try {
    const nav = await getNavigationGlobal();

    const dynamicItems = sanitizeNavItems(nav?.items);
    const hoTriLabel = nav?.ctaLabel?.trim() || "Hộ Trì Phật Pháp";
    const hoTriHref = nav?.ctaHref?.trim() || "/donations";

    return {
      topLevel: DEFAULT_TOP_LEVEL,
      tuHoc: dynamicItems.length ? dynamicItems : DEFAULT_TU_HOC,
      congDong: DEFAULT_CONG_DONG,
      hoTri: { href: hoTriHref, label: hoTriLabel },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Navigation] Falling back to defaults:", message);

    return {
      topLevel: DEFAULT_TOP_LEVEL,
      tuHoc: DEFAULT_TU_HOC,
      congDong: DEFAULT_CONG_DONG,
      hoTri: { href: "/donations", label: "Hộ Trì Phật Pháp" },
    };
  }
}
