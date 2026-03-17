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

type GuestbookListLike = {
  data?: unknown
  docs?: unknown
  meta?: {
    pagination?: {
      page?: unknown
      pageSize?: unknown
      pageCount?: unknown
      total?: unknown
    }
    archive?: { year?: unknown; month?: unknown }
  }
  page?: unknown
  limit?: unknown
  totalDocs?: unknown
  totalPages?: unknown
}

function toPositiveNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

export function normalizeGuestbookList(
  payload: unknown,
  page = 1,
  pageSize = 20,
): GuestbookList {
  if (!payload || typeof payload !== 'object') {
    return emptyGuestbookList(page, pageSize)
  }

  const source = payload as GuestbookListLike
  const data = Array.isArray(source.data)
    ? source.data
    : Array.isArray(source.docs)
      ? source.docs
      : []

  const pagination = source.meta?.pagination
  const resolvedPage = toPositiveNumber(pagination?.page ?? source.page, page)
  const resolvedPageSize = toPositiveNumber(pagination?.pageSize ?? source.limit, pageSize)
  const resolvedTotal = toPositiveNumber(pagination?.total ?? source.totalDocs, data.length)
  const resolvedPageCount = toPositiveNumber(
    pagination?.pageCount ?? source.totalPages,
    resolvedPageSize > 0 ? Math.max(1, Math.ceil(resolvedTotal / resolvedPageSize)) : 1,
  )

  return {
    data: data as GuestbookList['data'],
    meta: {
      pagination: {
        page: resolvedPage,
        pageSize: resolvedPageSize,
        pageCount: resolvedPageCount,
        total: resolvedTotal,
      },
      ...(source.meta?.archive ? { archive: source.meta.archive as GuestbookList['meta']['archive'] } : {}),
    },
  }
}
export async function getGuestbookEntries(page = 1, pageSize = 20): Promise<GuestbookList> {
  try {
    const response = await cmsFetch<unknown>(`/guestbook?page=${page}&pageSize=${pageSize}`, {
      noCache: true,
    })

    return normalizeGuestbookList(response, page, pageSize)
  } catch (error) {
    if (error instanceof CMSAPIError && error.status === 404) {
      return emptyGuestbookList(page, pageSize)
    }

    throw error
  }
}

export async function getGuestbookArchive(
  year: number,
  month: number,
  page = 1,
  pageSize = 20
): Promise<GuestbookList> {
  try {
    const response = await cmsFetch<unknown>(
      `/guestbook-entries/archive/${year}/${month}?page=${page}&pageSize=${pageSize}`,
      { noCache: true }
    )

    return normalizeGuestbookList(response, page, pageSize)
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

