'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/contexts/AuthContext'
import {
  guestbookKeys,
} from '@/lib/query/guestbook'
import { cn } from '@/lib/utils'
import { ZenButton } from '@/components/ui-zen/zen-button'
import { ZenField } from '@/components/ui-zen/zen-field'
import { ZenInput } from '@/components/ui-zen/zen-input'
import { ZenTextarea } from '@/components/ui-zen/zen-textarea'
import { Button } from '@/components/ui/button'
import {
  initialGuestbookActionState,
  submitGuestbookAction,
} from '@/features/guestbook/actions/submit-guestbook-action'

interface GuestbookFormProps {
  onSuccess: () => void
}

const QUESTION_TOPICS = [
  'Tu học',
  'Sức khỏe',
  'Gia đình',
  'Sự nghiệp',
  'Cảm ngộ',
  'Khác',
] as const

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [state, formAction, isPending] = useActionState(
    submitGuestbookAction,
    initialGuestbookActionState,
  )
  const [entryType, setEntryType] = useState<'message' | 'question'>('message')
  const [message, setMessage] = useState('')

  const resolvedAuthorName = useMemo(
    () => user?.dharmaName || user?.fullName || user?.username || user?.email || '',
    [user],
  )

  useEffect(() => {
    if (!state.success) {
      return
    }

    void queryClient.invalidateQueries({ queryKey: guestbookKeys.lists() })
    router.refresh()

    const timeout = window.setTimeout(() => {
      onSuccess()
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [onSuccess, queryClient, router, state.success])

  if (state.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl border border-gold/30 bg-gold/10 px-6 py-5 text-center"
      >
        <p className="ant-title mb-1 text-lg text-gold">Đã ghi lưu bút</p>
        <p className="text-sm text-muted-foreground">
          {state.message ?? 'Lưu bút của bạn đang được làm mới trên trang.'}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      action={formAction}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="entryType" value={entryType} />

      <div className="mb-1 flex w-fit rounded-xl border border-border/60 bg-secondary/50 p-1">
        <Button
          type="button"
          variant={entryType === 'message' ? 'sacred' : 'ghost'}
          size="sm"
          className="rounded-lg"
          onClick={() => setEntryType('message')}
        >
          Lưu bút
        </Button>
        <Button
          type="button"
          variant={entryType === 'question' ? 'sacred' : 'ghost'}
          size="sm"
          className="rounded-lg"
          onClick={() => setEntryType('question')}
        >
          Đặt câu hỏi
        </Button>
      </div>

      {user ? (
        <div className="rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
          <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-gold/70">Tài khoản gửi lưu bút</p>
          <p className="text-sm font-medium text-foreground">
            {resolvedAuthorName}
          </p>
          <input type="hidden" name="authorName" value={resolvedAuthorName} />
        </div>
      ) : (
        <ZenField
          label="Tên của bạn"
          htmlFor="guestbook-authorName"
          error={state.fieldErrors.authorName ?? null}
        >
          <ZenInput
            id="guestbook-authorName"
            name="authorName"
            placeholder="Tên hoặc pháp danh"
            maxLength={100}
            disabled={isPending}
          />
        </ZenField>
      )}

      {entryType === 'question' && (
        <ZenField
          label="Chủ đề câu hỏi"
          htmlFor="guestbook-questionCategory"
          error={state.fieldErrors.questionCategory ?? null}
        >
          <select
            id="guestbook-questionCategory"
            name="questionCategory"
            defaultValue=""
            disabled={isPending}
            className="flex h-12 w-full rounded-xl border border-border/80 bg-background/80 px-4 text-sm text-foreground transition-all duration-200 focus:border-gold/45 focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            <option value="">Chọn chủ đề</option>
            {QUESTION_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </ZenField>
      )}

      <ZenField
        label={entryType === 'question' ? 'Nội dung câu hỏi' : 'Lưu bút'}
        htmlFor="guestbook-message"
        error={state.fieldErrors.message ?? null}
        hint={<span>{message.length}/2000</span>}
      >
        <ZenTextarea
          id="guestbook-message"
          name="message"
          placeholder="Ký gửi tâm tư, cảm nhận, lời chúc, hoặc điều bạn muốn hỏi..."
          maxLength={2000}
          disabled={isPending}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </ZenField>

      {state.message && !state.success ? (
        <p className="text-xs text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <ZenButton
        type="submit"
        variant="sacred"
        className={cn(
          'w-full sm:w-auto',
          isPending && 'cursor-not-allowed opacity-70',
        )}
        disabled={isPending}
      >
        {isPending ? 'Đang gửi...' : entryType === 'question' ? 'Gửi câu hỏi' : 'Gửi lưu bút'}
      </ZenButton>
    </motion.form>
  )
}
