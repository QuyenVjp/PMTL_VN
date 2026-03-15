import type { BlogPost } from '@/types/cms'

export type SearchHit = BlogPost & {
  semanticHints?: string[]
  topic?: string
  topicSlug?: string
  tagSlugs?: string[]
  _formatted?: {
    title?: string
    excerpt?: string
    content?: string
    contentPlainText?: string
  }
}
