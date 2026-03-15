'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, ChevronUpIcon, HeartIcon, CornerDownRightIcon, FlagIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { BlogComment } from '@/types/strapi'
import { getStrapiMediaUrl } from '@/lib/strapi'
import CommentForm from './CommentForm'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { createHttpError, getErrorMessage } from '@/lib/http-error'

interface CommentItemProps {
  comment: BlogComment
  postSlug: string
  isReply?: boolean
  onLike: (documentId: string) => void
  onReplySuccess: () => void
}

// Vietnam flag unicode or simple indicator if needed in future
function countryDisplay(country: string | null | undefined): string {
  return ''
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function CommentItem({
  comment,
  postSlug,
  isReply = false,
  onLike,
  onReplySuccess,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [liked, setLiked] = useState(false)
  const [reported, setReported] = useState(false)
  const [localLikes, setLocalLikes] = useState(comment.likes)

  const avatarUrl = comment.authorAvatar
    ? getStrapiMediaUrl(
      comment.authorAvatar.formats?.thumbnail?.url ?? comment.authorAvatar.url
    )
    : null

  const initials = comment.authorName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const handleLike = useCallback(async () => {
    if (liked) return
    setLiked(true)
    setLocalLikes((n) => n + 1)
    try {
      await onLike(comment.documentId)
      toast.success('Đã thích bình luận')
    } catch {
      setLiked(false)
      setLocalLikes((n) => n - 1)
      toast.error('Không thể thích bình luận')
    }
  }, [liked, comment.documentId, onLike])

  const handleReplySuccess = useCallback(() => {
    setShowReplyForm(false)
    onReplySuccess()
  }, [onReplySuccess])

  const submitReport = useCallback(async (reason: 'spam' | 'abuse' | 'off-topic' | 'unsafe') => {
    if (reported) return

    try {
      const res = await fetch(`/api/blog-comments/report/${encodeURIComponent(comment.documentId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      if (!res.ok) {
        throw await createHttpError(res, 'Không thể báo cáo bình luận')
      }
      setReported(true)
      toast.success('Đã ghi nhận báo cáo')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể báo cáo bình luận'))
    }
  }, [comment.documentId, reported])

  const hasReplies = !isReply && comment.replies && comment.replies.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group',
        isReply && 'ml-6 pl-4 border-l border-border'
      )}
    >
      <div className={cn(
        'rounded-2xl bg-card border border-border p-4 transition-shadow hover:shadow-sm',
        isReply && 'rounded-l-none border-l-0'
      )}>
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden bg-gold/10 flex items-center justify-center text-gold text-xs font-semibold select-none">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={comment.authorName}
                width={36}
                height={36}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Meta */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="font-medium text-sm text-foreground leading-snug">
                {comment.authorName}
              </span>
              <span className="text-xs text-muted-foreground/50"></span>
              <time
                dateTime={comment.createdAt}
                className="text-xs text-muted-foreground/60"
              >
                {timeAgo(comment.createdAt)}
              </time>
            </div>

            {/* Content */}
            <p className="mt-1.5 text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {/* Actions */}
            <div className="mt-2.5 flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={liked}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  liked
                    ? 'text-rose-500'
                    : 'text-muted-foreground hover:text-rose-400'
                )}
                aria-label={`Thích bình luận này (${localLikes})`}
              >
                <HeartIcon
                  className={cn('w-3.5 h-3.5', liked && 'fill-current')}
                />
                <span>{localLikes > 0 ? localLikes : ''}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setShowReplyForm((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  <CornerDownRightIcon className="w-3.5 h-3.5" />
                  Trả lời
                </button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    disabled={reported}
                    title="Báo nội dung không phù hợp"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-amber-400 transition-colors disabled:opacity-50"
                  >
                    <FlagIcon className="w-3.5 h-3.5" />
                    {reported ? 'Đã báo cáo' : 'Báo cáo'}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem onClick={() => submitReport('spam')}>Spam / quảng cáo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => submitReport('abuse')}>Thiếu tôn trọng</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => submitReport('off-topic')}>Sai chủ đề</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => submitReport('unsafe')}>Nội dung không phù hợp</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasReplies && (
                <button
                  onClick={() => setShowReplies((v) => !v)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
                >
                  {showReplies ? (
                    <ChevronUpIcon className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                  )}
                  {comment.replies!.length} trả lời
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply form */}
      <AnimatePresence>
        {showReplyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 ml-6 pl-4 border-l border-gold/20 overflow-hidden"
          >
            <div className="py-2">
              <CommentForm
                postSlug={postSlug}
                parentDocumentId={comment.documentId}
                parentAuthorName={comment.authorName}
                onSuccess={handleReplySuccess}
                onCancel={() => setShowReplyForm(false)}
                compact
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nested replies */}
      <AnimatePresence>
        {hasReplies && showReplies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 space-y-2"
          >
            {comment.replies!.map((reply) => (
              <CommentItem
                key={reply.documentId}
                comment={reply}
                postSlug={postSlug}
                isReply
                onLike={onLike}
                onReplySuccess={onReplySuccess}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
