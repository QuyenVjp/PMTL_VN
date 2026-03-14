import { LexicalRichTextRenderer, normalizeLexicalContent } from "@/features/content/rich-text";

type PostContentProps = {
  content: unknown;
  className?: string;
};

export function PostContent({ content, className }: PostContentProps) {
  const normalized = normalizeLexicalContent(content);
  const rendererClassName = className ? { className } : {};

  return (
    <LexicalRichTextRenderer
      content={normalized}
      {...rendererClassName}
      emptyFallback={<p className="muted">Noi dung bai viet dang duoc cap nhat.</p>}
    />
  );
}
