import { buildSlug } from "@/services/content-helpers.service";
import { ensurePublicId } from "@/services/public-id.service";

type CategoryInput = {
  publicId?: string | null | undefined;
  name?: string | null | undefined;
  slug?: string | null | undefined;
  description?: string | null | undefined;
  color?: string | null | undefined;
};

export function normalizeCategoryName(name: string): string {
  return name.trim();
}

export function generateCategorySlug(input: CategoryInput): string | undefined {
  return input.slug?.trim() || buildSlug(input.name);
}

export function normalizeCategoryData<T extends CategoryInput>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      name: input.name?.trim() ?? input.name,
      description: input.description?.trim() ?? "",
      color: input.color?.trim() ?? "",
    },
    "cat",
  );
}

export function buildCategoryTree<T extends { id?: string | number; parent?: string | number | null }>(categories: T[]) {
  return categories;
}

export function mapCategoryToDTO(category: CategoryInput & { id?: string | number | null }) {
  return {
    id: category.publicId ?? (category.id ? String(category.id) : null),
    name: category.name ?? "",
    slug: category.slug ?? "",
    description: category.description ?? "",
    color: category.color ?? "",
  };
}

