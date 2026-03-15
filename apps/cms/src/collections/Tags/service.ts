import { buildSlug } from "@/services/content-helpers.service";
import { ensurePublicId } from "@/services/public-id.service";

type TagInput = {
  publicId?: string | null | undefined;
  name?: string | null | undefined;
  slug?: string | null | undefined;
  description?: string | null | undefined;
};

export function generateTagSlug(input: TagInput): string | undefined {
  return input.slug?.trim() || buildSlug(input.name);
}

export function normalizeTagData<T extends TagInput>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      name: input.name?.trim() ?? input.name,
      description: input.description?.trim() ?? "",
    },
    "tag",
  );
}

export function mapTagToDTO(tag: TagInput & { id?: string | number | null }) {
  return {
    id: tag.publicId ?? (tag.id ? String(tag.id) : null),
    name: tag.name ?? "",
    slug: tag.slug ?? "",
    description: tag.description ?? "",
  };
}

export function scheduleTagRelatedReindex(): void {
  return;
}
