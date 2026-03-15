import { z } from 'zod'

export const guestbookEntryTypeSchema = z.enum(['message', 'question'])

export const guestbookFormSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập tên của bạn.')
    .max(100, 'Tên không được vượt quá 100 ký tự.'),
  entryType: guestbookEntryTypeSchema,
  questionCategory: z
    .string()
    .trim()
    .max(100, 'Chủ đề không được vượt quá 100 ký tự.')
    .optional()
    .or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(5, 'Lưu bút cần ít nhất 5 ký tự.')
    .max(2000, 'Lưu bút không được vượt quá 2000 ký tự.'),
})
  .superRefine((value, ctx) => {
    if (value.entryType === 'question' && !value.questionCategory?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['questionCategory'],
        message: 'Vui lòng chọn chủ đề câu hỏi.',
      })
    }
  })

export type GuestbookFormValues = z.infer<typeof guestbookFormSchema>
