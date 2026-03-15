'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2Icon, MessageCircleIcon, LockIcon } from 'lucide-react'
import type { BlogCommentThread } from '@/types/strapi'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

interface CommentsClientProps {
  slug: string
  initialData: BlogCommentThread
  allowComments?: boolean   // false = Admin đã khóa bình luận
}

export default function CommentsClient({ slug, initialData, allowComments = true }: CommentsClientProps) {
  const [data, setData] = useState<BlogCommentThread>(initialData)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/blog-comments/by-post/${encodeURIComponent(slug)}?page=${p}&pageSize=20`)
        if (res.ok) {
          const json: BlogCommentThread = await res.json()
          setData(json)
          setPage(p)
        }
      } catch {
        // Không thể tải — im lặng, dữ liệu cũ vẫn hiển thị
      } finally {
        setLoading(false)
      }
    },
    [slug]
  )

  // Refresh sau khi gửi bình luận mới
  const handleNewComment = useCallback(() => {
    fetchPage(1)
  }, [fetchPage])

  const handleLike = useCallback(async (documentId: string) => {
    await fetch(`/api/blog-comments/like/${encodeURIComponent(documentId)}`, { method: 'POST' })
  }, [])

  const { data: comments, meta } = data
  const { pageCount, total } = meta.pagination

  return (
    <section aria-labelledby="comments-heading" className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircleIcon className="w-5 h-5 text-gold" />
        <h2 id="comments-heading" className="font-display text-xl text-foreground">
          Bình luận
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({total})</span>
          )}
        </h2>
      </div>

      {/* ── Form gửi bình luận hoặc thông báo khóa ── */}
      {allowComments ? (
        <div className="mb-8 p-5 rounded-2xl bg-card border border-border">
          <p className="text-sm font-medium text-foreground mb-4">Để lại bình luận</p>
          <CommentForm postSlug={slug} onSuccess={handleNewComment} />
        </div>
      ) : (
        <div className="mb-8 p-5 rounded-2xl bg-secondary/50 border border-border flex items-center gap-3">
          <LockIcon className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            Khu vực bình luận đã được đóng lại cho bài viết này.
          </p>
        </div>
      )}

      {/* ── Danh sách bình luận ── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="w-6 h-6 text-gold animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Chưa có bình luận. Hãy là người đầu tiên chia sẻ.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {comments.map((comment) => (
              <CommentItem
                key={comment.documentId}
                comment={comment}
                postSlug={slug}
                onLike={handleLike}
                onReplySuccess={handleNewComment}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Phân trang ── */}
      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:border-gold/40 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {pageCount}
          </span>
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= pageCount || loading}
            className="px-4 py-2 rounded-xl text-sm border border-border text-muted-foreground hover:border-gold/40 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Tiếp
          </button>
        </div>
      )}
    </section>
  )
}
