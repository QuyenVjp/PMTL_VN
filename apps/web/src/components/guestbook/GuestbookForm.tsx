// components/guestbook/GuestbookForm.tsx — Client component
'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/contexts/AuthContext'
import { useGuestbookSubmit } from '@/lib/query/guestbook'
import { guestbookFormSchema, type GuestbookFormValues } from '@/lib/validation/guestbook'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

interface GuestbookFormProps {
  onSuccess: () => void
}

export default function GuestbookForm({ onSuccess }: GuestbookFormProps) {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const submitMutation = useGuestbookSubmit()

  const resolvedAuthorName = useMemo(
    () => user?.dharmaName || user?.fullName || user?.username || user?.email || '',
    [user]
  )

  const form = useForm<GuestbookFormValues>({
    resolver: zodResolver(guestbookFormSchema),
    defaultValues: {
      authorName: resolvedAuthorName,
      entryType: 'message',
      questionCategory: '',
      message: '',
    },
  })

  const entryType = form.watch('entryType')
  const messageValue = form.watch('message') ?? ''

  useEffect(() => {
    form.setValue('authorName', resolvedAuthorName, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    })
  }, [form, resolvedAuthorName])

  useEffect(() => {
    if (entryType !== 'question') {
      form.setValue('questionCategory', '', {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      })
    }
  }, [entryType, form])

  async function handleSubmit(values: GuestbookFormValues) {
    setError(null)

    try {
      await submitMutation.mutateAsync({
        ...values,
        authorName: (user ? resolvedAuthorName : values.authorName).trim(),
        message: values.message.trim(),
        questionCategory: values.entryType === 'question' ? values.questionCategory?.trim() || 'Tu học' : undefined,
      })

      setSuccess(true)
      form.reset({
        authorName: user ? resolvedAuthorName : '',
        entryType: 'message',
        questionCategory: '',
        message: '',
      })

      window.setTimeout(() => {
        setSuccess(false)
        onSuccess()
      }, 3000)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể kết nối máy chủ. Vui lòng thử lại.')
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-md border border-gold/30 bg-gold/10 px-6 py-5 text-center"
      >
        <p className="ant-title mb-1 text-lg text-gold">Cảm ơn bạn!</p>
        <p className="text-sm text-muted-foreground">
          Lưu bút của bạn đã được ghi lại và hiển thị ngay trên trang.
        </p>
      </motion.div>
    )
  }

  return (
    <Form {...form}>
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="entryType"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value)
                    }
                  }}
                  className="mb-2 w-fit rounded-md border border-border/60 bg-secondary/50 p-1"
                >
                  <ToggleGroupItem value="message" className="rounded px-4 py-1.5 text-xs font-semibold">
                    Lưu bút
                  </ToggleGroupItem>
                  <ToggleGroupItem value="question" className="rounded px-4 py-1.5 text-xs font-semibold">
                    Đặt câu hỏi
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {user ? (
          <div className="rounded-md border border-gold/20 bg-gold/5 px-4 py-3">
            <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-gold/70">Tài khoản gửi lưu bút</p>
            <p className="text-sm font-medium text-foreground">
              {user.dharmaName || user.fullName || user.username || user.email}
            </p>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="authorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">Tên của bạn *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Tên hoặc pháp danh"
                    maxLength={100}
                    disabled={submitMutation.isPending}
                    className="px-4 py-2.5 text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        {entryType === 'question' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <FormField
              control={form.control}
              name="questionCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Chủ đề câu hỏi</FormLabel>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    disabled={submitMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="px-4 py-2.5 text-sm">
                        <SelectValue placeholder="Chọn chủ đề" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Tu học">Tu học</SelectItem>
                        <SelectItem value="Sức khoẻ">Sức khoẻ</SelectItem>
                        <SelectItem value="Gia đình">Gia đình</SelectItem>
                        <SelectItem value="Sự nghiệp">Sự nghiệp</SelectItem>
                        <SelectItem value="Cảm ngộ">Cảm ngộ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </motion.div>
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                {entryType === 'question' ? 'Nội dung câu hỏi *' : 'Lưu bút *'}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ký gửi tâm tư, cảm nhận, lời chúc, hoặc bất cứ điều gì bạn muốn chia sẻ..."
                  maxLength={2000}
                  rows={4}
                  disabled={submitMutation.isPending}
                  className="min-h-[120px] resize-none px-4 py-2.5 text-sm focus-visible:border-gold/50 focus-visible:ring-gold/20 focus-visible:ring-offset-0"
                />
              </FormControl>
              <div className="flex items-center justify-between gap-3">
                <FormMessage className="text-xs" />
                <p className="text-xs text-muted-foreground/60">{messageValue.length}/2000</p>
              </div>
            </FormItem>
          )}
        />

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-destructive"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={submitMutation.isPending}
          className={cn(
            'w-full rounded-md bg-gold px-6 py-2.5 text-sm font-semibold text-black hover:bg-gold/90 sm:w-auto',
            submitMutation.isPending && 'cursor-not-allowed opacity-60'
          )}
        >
          {submitMutation.isPending ? 'Đang gửi...' : entryType === 'question' ? 'Gửi câu hỏi' : 'Gửi lưu bút'}
        </Button>
      </motion.form>
    </Form>
  )
}
