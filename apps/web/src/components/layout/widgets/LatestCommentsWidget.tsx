// components/layout/widgets/LatestCommentsWidget.tsx — Server component
import Link from 'next/link'
import { MessageSquareIcon } from 'lucide-react'
import { getSidebarLatestComments } from '@/lib/api/sidebar'

export default async function LatestCommentsWidget() {
  let comments: Awaited<ReturnType<typeof getSidebarLatestComments>> = []
  try {
    comments = await getSidebarLatestComments(5)
  } catch {
    return null
  }

  if (comments.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-gold/80">
        <MessageSquareIcon className="w-3.5 h-3.5" />
        Bình luận gần đây
      </h3>
      <ul className="space-y-3">
        {comments.map((c) => {
          const postSlug = (c as any).post?.slug as string | undefined
          const postTitle = (c as any).post?.title as string | undefined
          const snippet = c.content.slice(0, 60) + (c.content.length > 60 ? '…' : '')
          return (
            <li key={c.documentId} className="rounded-xl bg-secondary/30 px-4 py-4 text-xs leading-relaxed">
              <span className="font-medium text-foreground">{c.authorName}</span>
              {postSlug ? (
                <Link
                  href={`/blog/${postSlug}#comments`}
                  className="mt-1 block line-clamp-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {snippet}
                </Link>
              ) : (
                <p className="text-muted-foreground mt-0.5 line-clamp-2">{snippet}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
