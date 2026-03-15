export type ContentDocument = {
  id: string | number;
  slug: string;
  title: string;
  publicId?: string | null;
  documentId?: string | null;
  sourceRef?: string | null;
  excerpt?: string | null;
  contentPlainText?: string | null;
  thumbnailUrl?: string | null;
  thumbnailAlt?: string | null;
  views?: number | null;
  featured?: boolean | null;
  topic?: string | number | { id?: string | number | null; name?: string | null; slug?: string | null } | null;
  topicSlug?: string | null;
  tags?:
    | (string | number | { id?: string | number | null; name?: string | null; slug?: string | null })[]
    | null;
  tagSlugs?: string[] | null;
  publishedAt?: string | null;
};

