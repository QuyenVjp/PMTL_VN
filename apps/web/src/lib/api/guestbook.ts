// ─────────────────────────────────────────────────────────────
//  lib/api/guestbook.ts — Guestbook API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { CMSAPIError, cmsFetch } from '@/lib/cms'
import type { GuestbookList } from '@/types/cms'

function emptyGuestbookList(page = 1, pageSize = 20): GuestbookList {
  return {
    data: [],
    meta: {
      pagination: {
        page,
        pageCount: 0,
        pageSize,
        total: 0,
      },
    },
  }
}

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
  try {
    return await cmsFetch<GuestbookList>(
      `/guestbook-entries/archive/${year}/${month}?page=${page}&pageSize=${pageSize}`,
      { noCache: true }
    )
  } catch (error) {
    if (error instanceof CMSAPIError && error.status === 404) {
      return emptyGuestbookList(page, pageSize)
    }

    throw error
  }
}

export interface ArchiveStat {
  year: number
  month: number
  count: number
}

export async function getGuestbookArchiveList(): Promise<ArchiveStat[]> {
  try {
    const res = await cmsFetch<{ data: ArchiveStat[] }>('/guestbook-entries/archive-list', {
      noCache: true
    })

    return res.data || []
  } catch (error) {
    if (error instanceof CMSAPIError && error.status === 404) {
      return []
    }

    throw error
  }
}

