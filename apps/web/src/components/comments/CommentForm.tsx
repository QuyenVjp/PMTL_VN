'use client'

import { useState, useTransition, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { createHttpError, getErrorMessage } from '@/lib/http-error'

function avatar(name: string, size = 9) {
  const colors = [
    'from-gold/40 to-amber-600/40 text-gold',
    'from-emerald-500/30 to-teal-600/30 text-emerald-400',
    'from-purple-500/30 to-indigo-600/30 text-purple-400',
    'from-rose-500/30 to-pink-600/30 text-rose-400',
  ]
  const idx = name.charCodeAt(0) % colors.length || 0
  return `w-${size} h-${size} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center font-bold text-sm shrink-0`
}
function initials(name: string) {
  return name.charAt(0).toUpperCase()
}

interface CommentFormProps {
  postSlug: string
  parentDocumentId?: string
  parentAuthorName?: string
  onSuccess: () => void
  onCancel?: () => void
  compact?: boolean
}

export default function CommentForm({
  postSlug,
  parentDocumentId,
  parentAuthorName,
  onSuccess,
  onCancel,
  compact = false,
}: CommentFormProps) {
  const { user } = useAuth()
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (user) {
      setAuthorName(user.fullName || user.username || user.email || '')
    } else {
      const saved = localStorage.getItem('pmtl_author_name')
      if (saved) setAuthorName(saved)
    }
  }, [user])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const finalAuthorName = user
      ? (user.fullName || user.username || user.email || '').trim()
      : authorName.trim()

    if (!finalAuthorName) {
      setError('Vui lòng nhập tên của bạn.')
      return
    }
    if (!content.trim() || content.trim().length < 5) {
      setError('Bình luận phải có ít nhất 5 ký tự.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/blog-comments/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postSlug,
            content: content.trim(),
            authorName: finalAuthorName,
            authorAvatar: user?.avatar_url ?? undefined,
            parentDocumentId: parentDocumentId ?? undefined,
          }),
        })

        if (res.status === 429) {
          const err = await res.json().catch(() => ({}))
          setError((err as { error?: string }).error ?? 'Bạn gửi bình luận quá nhanh. Vui lòng thử lại sau.')
          toast.error((err as { error?: string }).error ?? 'Bạn gửi bình luận quá nhanh. Vui lòng thử lại sau.')
          return
        }

        if (!res.ok) {
          const error = await createHttpError(res, 'Lỗi khi gửi bình luận. Vui lòng thử lại.')
          setError(error.message)
          toast.error(error.message)
          return
        }

        toast.success(parentDocumentId ? 'Trả lời đã được đăng' : 'Bình luận đã được đăng')
        if (!user) {
          localStorage.setItem('pmtl_author_name', finalAuthorName)
        }
        setContent('')
        onSuccess()
      } catch (error) {
        const message = getErrorMessage(error, 'Không thể kết nối máy chủ. Vui lòng thử lại.')
        setError(message)
        toast.error(message)
      }
    })
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className={cn('space-y-3', compact && 'space-y-2')}
    >
      {parentAuthorName && (
        <p className="text-xs text-muted-foreground">
          Trả lời <span className="text-gold font-medium">{parentAuthorName}</span>
        </p>
      )}

      <div className="flex items-start gap-3">
        {user ? (
          user.avatar_url ? (
            <img src={user.avatar_url} alt={user.fullName || ''} className="w-10 h-10 rounded-full object-cover shrink-0 mt-1" />
          ) : (
            <div className={`${avatar(user.fullName || user.username || 'U', 10)} mt-1`}>
              {initials(user.fullName || user.username || 'U')}
            </div>
          )
        ) : (
          <div className={`${avatar(authorName || 'Guest', 10)} mt-1 opacity-60`}>
            {initials(authorName || 'G')}
          </div>
        )}

        <div className="flex-1 space-y-3">
          {!user && (
            <input
              type="text"
              placeholder="Tên của bạn *"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={100}
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors"
              disabled={isPending}
            />
          )}

          <textarea
            placeholder={user ? `Bình luận dưới tên ${user.fullName || user.username || user.email}...` : "Chia sẻ suy nghĩ của bạn..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={compact ? 2 : 3}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-colors resize-none"
            disabled={isPending}
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl bg-gold text-black text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Đang gửi...' : parentDocumentId ? 'Gửi trả lời' : 'Gửi bình luận'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Huỷ
          </button>
        )}
      </div>
    </motion.form>
  )
}
