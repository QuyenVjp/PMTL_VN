// CommentsSection.tsx — Server Component wrapper
// Fetches first page of comments server-side (SEO) then passes to client.

import { getCommentsByPostSlug } from '@/lib/api/comments'
import CommentsClient from './CommentsClient'
import type { BlogCommentThread } from '@/types/cms'

interface CommentsSectionProps {
  slug: string
  allowComments?: boolean
}

export default async function CommentsSection({ slug, allowComments = true }: CommentsSectionProps) {
  let initialData: BlogCommentThread = {
    data: [],
    meta: { pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 } },
  }


  try {
    initialData = await getCommentsByPostSlug(slug, 1, 20)
  } catch {
    // Nếu không tải được — hiển thị phần tử trống, client sẽ retry
  }

  return <CommentsClient slug={slug} initialData={initialData} allowComments={allowComments} />
}
