import { buildSlug } from "@/services/content-helpers.service";
import { ensurePublicId } from "@/services/public-id.service";

type HubPageData = {
  publicId?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  visualTheme?: string | null;
  menuLabel?: string | null;
  menuIconName?: string | null;
  showInMenu?: boolean | null;
  sortOrder?: number | null;
};

export function prepareHubPageData<T extends HubPageData>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: input.title?.trim() ?? input.title,
      slug: input.slug?.trim() || buildSlug(input.title),
      description: input.description?.trim() ?? "",
      visualTheme: input.visualTheme?.trim() ?? "",
      menuLabel: input.menuLabel?.trim() ?? "",
      menuIconName: input.menuIconName?.trim() ?? "",
      showInMenu: Boolean(input.showInMenu),
      sortOrder: typeof input.sortOrder === "number" ? input.sortOrder : 0,
    },
    "hub",
  );
}

export function mapHubPageToPublicDTO(page: HubPageData & { id?: string | number | null }) {
  return {
    id: page.publicId ?? (page.id ? String(page.id) : null),
    title: page.title ?? "",
    slug: page.slug ?? "",
    description: page.description ?? "",
  };
}

export function normalizeHubBlocks(): void {
  return;
}
