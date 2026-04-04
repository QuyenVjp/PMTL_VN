import type { SearchResultItem } from "../types/content";

type SearchSource = {
  id: string;
  title: string;
  slug: string;
  type: "post" | "event";
};

export function mapSearchSourceToResult(source: SearchSource): SearchResultItem {
  return {
    id: source.id,
    type: source.type,
    title: source.title,
    slug: source.slug,
    url: source.type === "post" ? `/posts/${source.slug}` : `/events/${source.slug}`,
  };
}

