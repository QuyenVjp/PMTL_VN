// ─────────────────────────────────────────────────────────────
//  fe-pmtl/lib/api/community.ts
//  Client functions cho Community Posts & Comments
// ─────────────────────────────────────────────────────────────

import { buildAuthHeaders as authHeaders, resolveUrl, STRAPI_API as API } from '@/lib/strapi-client'
import { createHttpError, createHttpErrorFromPayload, parseResponseBody } from '@/lib/http-error'

function imgUrl(media: unknown): string {
  return resolveUrl(media) ?? ''
}

/* ── Types ──────────────────────────────────────────────────── */
export interface CommunityPost {
  documentId: string
  title: string
  slug: string
  content: string
  type: 'story' | 'feedback' | 'video'
  category: string
  cover_image: unknown
  video_url?: string
  author_name: string
  author_avatar?: string
  likes: number
  views: number
  rating?: number
  tags?: string[]
  pinned?: boolean
  createdAt: string
  publishedAt: string
  comments?: CommunityComment[]
  coverUrl?: string // computed
  moderationStatus?: 'visible' | 'flagged' | 'hidden' | 'removed'
}

export interface CommunityComment {
  documentId: string
  content: string
  author_name: string
  author_avatar?: string
  likes: number
  createdAt: string
  parent?: {
    documentId: string
  } | null
  moderationStatus?: 'visible' | 'flagged' | 'hidden' | 'removed'
}

/* ── Helpers ─────────────────────────────────────────────────── */
export function normalizePosts(raw: any[]): CommunityPost[] {
  return raw.map((item) => ({
    documentId: item.documentId,
    ...item,
    coverUrl: imgUrl(item.cover_image),
    comments: (item.comments || []).map((c: any) => ({
      documentId: c.documentId,
      ...c,
    })),
  }))
}

/* ── API calls ───────────────────────────────────────────────── */

export async function fetchPosts(params?: {
  search?: string
  category?: string
  sort?: string
  page?: number
  pageSize?: number
}): Promise<{ posts: CommunityPost[]; total: number }> {
  const qs = new URLSearchParams()
  // Chỉ cần populate cover_image; backend custom find() tự join comments qua db.query
  qs.append('populate[0]', 'cover_image')
  qs.set('pagination[page]', String(params?.page || 1))
  qs.set('pagination[pageSize]', String(params?.pageSize || 20))

  if (params?.search) {
    qs.set('filters[$or][0][title][$containsi]', params.search)
    qs.set('filters[$or][1][content][$containsi]', params.search)
    qs.set('filters[$or][2][author_name][$containsi]', params.search)
  }
  if (params?.category && params.category !== 'Tất cả') {
    qs.set('filters[category][$eq]', params.category)
  }

  const sortMap: Record<string, string> = {
    newest: 'createdAt:desc',
    popular: 'views:desc',
    most_liked: 'likes:desc',
  }
  qs.set('sort', sortMap[params?.sort || 'newest'] || 'createdAt:desc')

  const res = await fetch(`/api/community-posts?${qs}`)
  if (!res.ok) throw await createHttpError(res, 'Không thể tải bài viết')
  const json = await res.json()
  return {
    posts: normalizePosts(json.data || []),
    total: json.meta?.pagination?.total || 0,
  }
}

export async function fetchPostById(documentId: string): Promise<CommunityPost> {
  const res = await fetch(`/api/community-posts/${documentId}`)
  if (!res.ok) throw await createHttpError(res, 'Không tìm thấy bài viết')
  const json = await res.json()
  const raw = json.data
  return {
    documentId: raw.documentId,
    ...raw,
    coverUrl: imgUrl(raw.cover_image),
    comments: (raw.comments || []).map((c: any) => ({
      documentId: c.documentId,
      ...c,
    })),
  }
}

export async function fetchPostBySlug(slug: string): Promise<CommunityPost> {
  const res = await fetch(`/api/community-posts?filters[slug][$eq]=${slug}&populate[0]=cover_image`)
  if (!res.ok) throw await createHttpError(res, 'Không tìm thấy bài viết')
  const json = await res.json()
  if (!json.data || json.data.length === 0) throw new Error('Không tìm thấy bài viết')
  const raw = json.data[0]
  return {
    documentId: raw.documentId,
    ...raw,
    coverUrl: imgUrl(raw.cover_image),
    comments: (raw.comments || []).map((c: any) => ({
      documentId: c.documentId,
      ...c,
    })),
  }
}

export async function likePost(documentId: string): Promise<number> {
  const res = await fetch(`/api/community-posts/like/${documentId}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw await createHttpError(res, 'Không thể thích bài viết')
  const json = await res.json()
  return json.likes
}

export async function viewPost(documentId: string): Promise<number> {
  const res = await fetch(`/api/community-posts/${documentId}/view`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) return 0
  const json = await res.json()
  return json.views || 0
}

export async function uploadFile(file: File): Promise<string | undefined> {
  const formData = new FormData()
  formData.append('files', file)
  const res = await fetch(`/api/upload`, {
    method: 'POST',
    body: formData,
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw await createHttpError(res, 'Upload ảnh thất bại')
  const json = await res.json()
  return json[0]?.documentId || json[0]?.id
}

export async function getCurrentPushEndpoint(): Promise<string | undefined> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return undefined
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription?.endpoint
  } catch {
    return undefined
  }
}

export async function submitPost(data: {
  title: string
  content: string
  type: string
  category: string
  author_name: string
  author_avatar?: string
  video_url?: string
  tags?: string | string[]
  cover_image?: number | string
  actorUserId?: number
  actorEndpoint?: string
}): Promise<void> {
  const res = await fetch(`/api/community-posts/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw await createHttpError(res, 'Gửi bài thất bại')
  }
}

export async function reportPost(documentId: string, reason: 'spam' | 'abuse' | 'off-topic' | 'unsafe'): Promise<string> {
  const res = await fetch(`/api/community-posts/report/${documentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ reason }),
  })
  const json = await parseResponseBody(res)
  if (!res.ok) throw createHttpErrorFromPayload(res.status, json, 'Không thể báo cáo bài viết')
  const data = typeof json === 'object' && json ? (json as Record<string, unknown>) : {}
  return typeof data.message === 'string' ? data.message : 'Đã ghi nhận báo cáo'
}

export async function submitComment(data: {
  postDocumentId: string
  content: string
  author_name: string
  author_avatar?: string
  parentDocumentId?: string
  actorUserId?: number
  actorEndpoint?: string
}): Promise<void> {
  const res = await fetch(`/api/community-comments/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw await createHttpError(res, 'Gửi bình luận thất bại')
  }
}

export async function likeComment(documentId: string): Promise<number> {
  const res = await fetch(`/api/community-comments/like/${documentId}`, {
    method: 'POST',
    headers: { ...authHeaders() },
  })
  if (!res.ok) throw await createHttpError(res, 'Không thể thích bình luận')
  const json = await res.json()
  return json.likes
}

export async function reportComment(documentId: string, reason: 'spam' | 'abuse' | 'off-topic' | 'unsafe'): Promise<string> {
  const res = await fetch(`/api/community-comments/report/${documentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ reason }),
  })
  const json = await parseResponseBody(res)
  if (!res.ok) throw createHttpErrorFromPayload(res.status, json, 'Không thể báo cáo bình luận')
  const data = typeof json === 'object' && json ? (json as Record<string, unknown>) : {}
  return typeof data.message === 'string' ? data.message : 'Đã ghi nhận báo cáo'
}
