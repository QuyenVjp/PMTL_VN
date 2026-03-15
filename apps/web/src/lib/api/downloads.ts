// ─────────────────────────────────────────────────────────────
//  fe-pmtl/lib/api/downloads.ts
//  Lấy tài liệu tải từ Strapi download-item collection
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'

export interface DownloadItem {
  id: number
  documentId: string
  title: string
  description?: string
  url: string
  fileType: 'pdf' | 'mp3' | 'mp4' | 'zip' | 'doc' | 'epub' | 'html' | 'unknown'
  category: string
  groupYear?: number
  groupLabel?: string
  notes?: string
  isUpdating: boolean
  isNew: boolean
  sortOrder: number
  fileSizeMB?: number
  thumbnail?: { url: string }
  publishedAt?: string
  createdAt: string
}

export interface DownloadGroup {
  label: string          // ví dụ: "2025", "Toàn tập", "2008–2009"
  year?: number
  items: DownloadItem[]
}

/** Lấy tất cả download-items theo category, tự gom nhóm theo năm/nhãn */
export async function fetchDownloads(params?: {
  category?: string
  pageSize?: number
}): Promise<{ items: DownloadItem[]; total: number }> {
  const filters: Record<string, any> = {}
  if (params?.category && params.category !== 'Tất cả') {
    filters.category = { $eq: params.category }
  }

  const data = await strapiFetch<{ data: any[]; meta: any }>('/download-items', {
    sort: ['sortOrder:asc', 'groupYear:desc', 'createdAt:desc'],
    pagination: { pageSize: params?.pageSize ?? 100 },
    populate: ['thumbnail'],
    filters,
    next: { revalidate: 3600, tags: ['downloads'] },
  })

  const items: DownloadItem[] = (data.data || []).map((item: any) => ({
    id: item.id,
    documentId: item.documentId,
    ...item,
  }))

  return {
    items,
    total: data.meta?.pagination?.total ?? items.length,
  }
}

/** Lấy downloads theo category + gom nhóm theo năm/groupLabel */
export async function fetchDownloadsByCategory(category: string): Promise<DownloadGroup[]> {
  const { items } = await fetchDownloads({ category, pageSize: 100 })

  // Gom nhóm theo groupLabel → groupYear → 'Chung'
  const groupMap = new Map<string, DownloadGroup>()

  for (const item of items) {
    const key = item.groupLabel || (item.groupYear ? String(item.groupYear) : 'Chung')
    if (!groupMap.has(key)) {
      groupMap.set(key, { label: key, year: item.groupYear, items: [] })
    }
    groupMap.get(key)!.items.push(item)
  }

  // Sắp xếp nhóm: năm giảm dần, 'Chung' xuống cuối
  return Array.from(groupMap.values()).sort((a, b) => {
    if (a.label === 'Chung') return 1
    if (b.label === 'Chung') return -1
    return (b.year ?? 0) - (a.year ?? 0)
  })
}

export const DOWNLOAD_CATEGORIES = [
  'Tất cả',
  'Kinh Điển',
  'Khai Thị Audio',
  'Khai Thị Video',
  'Sách',
  'Pháp Hội',
  'Hướng Dẫn',
  'Khác',
] as const
