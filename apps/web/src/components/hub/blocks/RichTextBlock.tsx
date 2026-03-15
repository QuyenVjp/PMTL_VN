// components/hub/blocks/RichTextBlock.tsx
import { cn } from '@/lib/utils'

interface RichTextBlockProps {
  content: string
}

export default function RichTextBlock({ content }: RichTextBlockProps) {
  if (!content) return null
  return (
    <section className="py-2">
      <div
        className={cn(
          "prose prose-sm md:prose-base max-w-none text-foreground/85 leading-relaxed",
          "prose-headings:font-serif prose-headings:text-foreground",
          "prose-a:text-gold prose-a:no-underline hover:prose-a:underline",
          "prose-strong:text-foreground prose-strong:font-semibold"
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </section>
  )
}
