'use client'

import { keepPreviousData, queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { GuestbookList } from '@/types/strapi'
import type { GuestbookFormValues } from '@/lib/validation/guestbook'

export const guestbookKeys = {
  all: ['guestbook'] as const,
  lists: () => [...guestbookKeys.all, 'list'] as const,
  list: (params: { year?: number; month?: number; page: number; pageSize: number }) =>
    [...guestbookKeys.lists(), params] as const,
}

async function fetchGuestbookList(params: {
  year?: number
  month?: number
  page: number
  pageSize: number
}): Promise<GuestbookList> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  })

  const basePath =
    params.year && params.month
      ? `/api/guestbook/archive/${params.year}/${params.month}`
      : '/api/guestbook/list'

  const response = await fetch(`${basePath}?${searchParams.toString()}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Không thể tải lưu bút.')
  }

  return response.json() as Promise<GuestbookList>
}

async function submitGuestbookEntry(payload: GuestbookFormValues) {
  const response = await fetch('/api/guestbook/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (response.ok) {
    return response.json() as Promise<{ data?: { documentId?: string }; message?: string }>
  }

  const data = (await response.json().catch(() => ({}))) as { error?: string }
  const message =
    response.status === 429
      ? 'Bạn gửi lưu bút quá nhanh. Vui lòng thử lại sau.'
      : (data.error ?? 'Lỗi khi gửi. Vui lòng thử lại.')

  throw new Error(message)
}

export function guestbookListQueryOptions(params: {
  year?: number
  month?: number
  page: number
  pageSize: number
  initialData?: GuestbookList
}) {
  const { initialData, ...queryParams } = params

  return queryOptions({
    queryKey: guestbookKeys.list(queryParams),
    queryFn: () => fetchGuestbookList(queryParams),
    staleTime: 1000 * 30,
    placeholderData: keepPreviousData,
    ...(initialData ? { initialData } : {}),
  })
}

export function useGuestbookList(params: {
  year?: number
  month?: number
  page: number
  pageSize: number
  initialData?: GuestbookList
}) {
  return useQuery(guestbookListQueryOptions(params))
}

export function useGuestbookSubmit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitGuestbookEntry,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: guestbookKeys.lists() })
    },
  })
}
