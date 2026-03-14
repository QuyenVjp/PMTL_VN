import { slugify } from "@pmtl/shared";

type PostData = {
  title?: string | null;
  slug?: string | null;
  status?: string | null;
  publishedAt?: string | null;
};

export function buildPostData(input: PostData): PostData {
  const nextSlug = input.slug?.trim() || (input.title ? slugify(input.title) : null);

  return {
    ...input,
    slug: nextSlug,
    publishedAt:
      input.status === "published" ? input.publishedAt ?? new Date().toISOString() : null,
  };
}

export function ensurePostCanPublish(input: PostData): void {
  if (input.status === "published" && !input.title) {
    throw new Error("Cannot publish a post without title.");
  }
}
