import { createHttpError } from '@/lib/http-error'
import type { SutraBookmark, SutraReadingProgress } from '@/types/strapi'

export async function fetchMyReadingProgress(params?: {
  sutraDocumentId?: string
  chapterDocumentId?: string
}): Promise<SutraReadingProgress[] | SutraReadingProgress | null> {
  const qs = new URLSearchParams()
  if (params?.sutraDocumentId) qs.set('sutraDocumentId', params.sutraDocumentId)
  if (params?.chapterDocumentId) qs.set('chapterDocumentId', params.chapterDocumentId)

  const res = await fetch(`/api/sutra-progress${qs.toString() ? `?${qs}` : ''}`, {
    cache: 'no-store',
  })
  if (res.status === 401) return null
  if (!res.ok) throw await createHttpError(res, 'Không thể tải tiến độ đọc')
  return res.json()
}

export async function upsertMyReadingProgress(data: {
  sutraDocumentId: string
  volumeDocumentId?: string
  chapterDocumentId: string
  anchorKey?: string
  charOffset?: number
  scrollPercent?: number
}): Promise<SutraReadingProgress | null> {
  const res = await fetch('/api/sutra-progress', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 401) return null
  if (!res.ok) throw await createHttpError(res, 'Không thể lưu tiến độ đọc')
  return res.json()
}

export async function fetchMyBookmarks(params?: {
  sutraDocumentId?: string
  chapterDocumentId?: string
}): Promise<SutraBookmark[] | null> {
  const qs = new URLSearchParams()
  if (params?.sutraDocumentId) qs.set('sutraDocumentId', params.sutraDocumentId)
  if (params?.chapterDocumentId) qs.set('chapterDocumentId', params.chapterDocumentId)

  const res = await fetch(`/api/sutra-bookmarks${qs.toString() ? `?${qs}` : ''}`, {
    cache: 'no-store',
  })
  if (res.status === 401) return null
  if (!res.ok) throw await createHttpError(res, 'Không thể tải bookmark')
  return res.json()
}

export async function createMyBookmark(data: {
  sutraDocumentId: string
  volumeDocumentId?: string
  chapterDocumentId: string
  anchorKey?: string
  charOffset?: number
  excerpt?: string
  note?: string
}): Promise<SutraBookmark | null> {
  const res = await fetch('/api/sutra-bookmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (res.status === 401) return null
  if (!res.ok) throw await createHttpError(res, 'Không thể tạo bookmark')
  return res.json()
}

export async function deleteMyBookmark(documentId: string): Promise<boolean> {
  const res = await fetch(`/api/sutra-bookmarks/${documentId}`, {
    method: 'DELETE',
  })
  if (res.status === 401) return false
  if (!res.ok) throw await createHttpError(res, 'Không thể xoá bookmark')
  return true
}

