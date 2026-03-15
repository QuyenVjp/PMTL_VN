import type { BlogPost } from '@/types/strapi'

export type SearchHit = BlogPost & {
  _formatted?: {
    title?: string
    excerpt?: string
    content?: string
  }
}
