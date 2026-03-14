import { extractLexicalPlainText } from "@/features/content/rich-text";

type GetPostPreviewTextInput = {
  excerpt?: string | null;
  content?: unknown;
  maxLength?: number;
};

export function getPostPreviewText(input: GetPostPreviewTextInput): string {
  const excerpt = input.excerpt?.trim();
  if (excerpt) {
    return input.maxLength ? excerpt.slice(0, input.maxLength).trim() : excerpt;
  }

  const options = input.maxLength ? { maxLength: input.maxLength } : undefined;
  return extractLexicalPlainText(input.content, options);
}
