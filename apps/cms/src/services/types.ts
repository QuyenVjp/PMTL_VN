export type ContentDocument = {
  id: string | number;
  slug: string;
  title: string;
  sourceRef?: string | null;
  excerpt?: string | null;
  contentPlainText?: string | null;
  topic?: string | number | { id?: string | number; name?: string | null } | null;
  tags?:
    | (string | number | { id?: string | number; name?: string | null })[]
    | null;
  publishedAt?: string | null;
};

