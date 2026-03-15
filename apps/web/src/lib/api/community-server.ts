// ─────────────────────────────────────────────────────────────
//  lib/api/community-server.ts — Server-side Community API
//  Sử dụng cached CMS adapter để lấy dữ liệu trực tiếp từ CMS.
// ─────────────────────────────────────────────────────────────
import { cachedCmsFetch } from '@/lib/cms/server-cache'
import { logger } from '@/lib/logger'
import type { CommunityPost } from './community'

/** Lấy danh sách bài viết cộng đồng (Server-side) */
export async function getCommunityPosts(params: {
  page?: number
  pageSize?: number
  category?: string
  search?: string
  sort?: string
} = {}): Promise<{ posts: CommunityPost[]; total: number }> {
  const { page = 1, pageSize = 20, category, search, sort } = params

  const filters: any = {}
  if (search) {
    filters['$or'] = [
      { title: { $containsi: search } },
      { content: { $containsi: search } },
      { author_name: { $containsi: search } }
    ]
  }
  if (category && category !== 'Tất cả') {
    filters['category'] = { $eq: category }
  }

  const sortMap: Record<string, string> = {
    newest: 'createdAt:desc',
    popular: 'views:desc',
    most_liked: 'likes:desc',
  }

  const res = await cachedCmsFetch<{ data: any[]; meta: any }>('/community-posts', {
    filters,
    pagination: { page, pageSize },
    sort: [sortMap[sort || 'newest'] || 'createdAt:desc'],
    populate: ['cover_image'],
  }, {
    profile: 'minutes',
    tags: ['community-posts'],
  })

  const posts = (res.data || []).map(raw => ({
    documentId: raw.documentId,
    ...raw,
    coverUrl: raw.cover_image ? (raw.cover_image.url.startsWith('http') ? raw.cover_image.url : `${(process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')}${raw.cover_image.url}`) : undefined,
    comments: (raw.comments || []).map((c: any) => ({
      documentId: c.documentId,
      ...c,
    })),
  })) as CommunityPost[]

  return {
    posts,
    total: res.meta?.pagination?.total || 0
  }
}

/** Lấy chi tiết bài viết cộng đồng theo slug (Server-side) */
export async function getCommunityPostBySlug(slug: string): Promise<CommunityPost | null> {
  try {
    const res = await cachedCmsFetch<{ data: any[] }>('/community-posts', {
      filters: { slug: { $eq: slug } },
      populate: ['cover_image', 'comments'],
      pagination: { page: 1, pageSize: 1 },
    }, {
      profile: 'minutes',
      tags: [`community-post-${slug}`],
    })

    if (!res.data || res.data.length === 0) return null

    const raw = res.data[0]
    // Normalize data (giống hàm trong community.ts)
    return {
      documentId: raw.documentId,
      ...raw,
      coverUrl: raw.cover_image ? (raw.cover_image.url.startsWith('http') ? raw.cover_image.url : `${(process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')}${raw.cover_image.url}`) : undefined,
      comments: (raw.comments || []).map((c: any) => ({
        documentId: c.documentId,
        ...c,
      })),
    } as CommunityPost
  } catch (error) {
    logger.error('Failed to fetch community post by slug', { error, slug })
    return null
  }
}
