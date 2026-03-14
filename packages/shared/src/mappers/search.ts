import type { SearchResultItem } from "../types/content";

type SearchSource = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  type: "post" | "event";
};

export function mapSearchSourceToResult(source: SearchSource): SearchResultItem {
  return {
    id: source.id,
    type: source.type,
    title: source.title,
    slug: source.slug,
    excerpt: source.excerpt ?? "",
    url: source.type === "post" ? `/posts/${source.slug}` : `/events/${source.slug}`,
  };
}

