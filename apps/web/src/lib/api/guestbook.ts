// ─────────────────────────────────────────────────────────────
//  lib/api/guestbook.ts — Guestbook API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { cmsFetch } from '@/lib/cms'
import type { GuestbookList } from '@/types/cms'

export async function getGuestbookEntries(page = 1, pageSize = 20): Promise<GuestbookList> {
  return cmsFetch<GuestbookList>(`/guestbook?page=${page}&pageSize=${pageSize}`, {
    noCache: true,
  })
}

export async function getGuestbookArchive(
  year: number,
  month: number,
  page = 1,
  pageSize = 20
): Promise<GuestbookList> {
  return cmsFetch<GuestbookList>(
    `/guestbook-entries/archive/${year}/${month}?page=${page}&pageSize=${pageSize}`,
    { noCache: true }
  )
}

export interface ArchiveStat {
  year: number
  month: number
  count: number
}

export async function getGuestbookArchiveList(): Promise<ArchiveStat[]> {
  const res = await cmsFetch<{ data: ArchiveStat[] }>('/guestbook-entries/archive-list', {
    noCache: true // Bật cache thì thêm revalidate sau, tuỳ anh
  })
  return res.data || []
}

