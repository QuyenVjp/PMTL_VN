// ─────────────────────────────────────────────────────────────
//  lib/api/hub.ts — Hub page API functions
//  Server-side only — do NOT import from 'use client' files
// ─────────────────────────────────────────────────────────────
import { strapiFetch } from '@/lib/strapi'
import type { StrapiList, HubPage } from '@/types/strapi'
import { getPosts } from '@/lib/api/blog'
import { fetchDownloads } from '@/lib/api/downloads'
import type { DownloadItem } from '@/types/strapi'

function buildFallbackHubPages(): HubPage[] {
  const now = new Date().toISOString()
  return [
    {
      id: 1,
      documentId: "fallback-hub-thu-vien-khai-thi",
      title: "Thư Viện Khai Thị",
      slug: "thu-vien-khai-thi",
      description: "Kho nội dung khai thị theo chuyên đề và lộ trình tu học.",
      sections: [],
      sortOrder: 1,
      showInMenu: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      visualTheme: "teaching",
    },
    {
      id: 2,
      documentId: "fallback-hub-trung-tam-tu-hoc",
      title: "Trung Tâm Tu Học",
      slug: "trung-tam-tu-hoc",
      description: "Lối vào nhanh cho các nội dung tu học hằng ngày.",
      sections: [],
      sortOrder: 2,
      showInMenu: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
      visualTheme: "practice",
    },
  ]
}

const POPULATE_HUB = {
  // Section links + thumbnail
  sections: {
    populate: {
      links: {
        populate: {
          thumbnail: { fields: ['url', 'formats', 'width', 'height', 'alternativeText'] },
        },
      },
    },
  },
  // Cover image của hub page
  coverImage: { fields: ['url', 'formats', 'alternativeText'] },
  // Bài Editor chọn tay
  curated_posts: {
    fields: ['id', 'documentId', 'title', 'slug', 'publishedAt'],
    populate: {
      thumbnail: { fields: ['url', 'formats', 'alternativeText'] },
    },
  },
  // Tài liệu tải xuống gắn vào hub
  downloads: {
    fields: [
      'id', 'documentId', 'title', 'description', 'url', 'fileType',
      'category', 'groupYear', 'groupLabel', 'notes', 'isUpdating',
      'isNew', 'sortOrder', 'fileSizeMB',
    ],
  },
  // Dynamic blocks
  blocks: {
    on: {
      'blocks.post-list-auto': {
        populate: {
          category: { fields: ['id', 'documentId', 'name', 'slug'] }
        }
      },
      'blocks.post-list-manual': {
        populate: {
          posts: {
            fields: ['id', 'documentId', 'title', 'slug', 'publishedAt'],
            populate: { thumbnail: { fields: ['url', 'formats'] } }
          }
        }
      },
      'blocks.download-grid': {
        populate: {
          downloads: {
            fields: ['id', 'documentId', 'title', 'url', 'fileType', 'isNew', 'isUpdating']
          }
        }
      },
      'blocks.rich-text': true
    }
  }

}

function hasRenderableHubContent(hub: HubPage): boolean {
  return Boolean(
    hub.sections?.length ||
    hub.blocks?.length ||
    hub.curated_posts?.length ||
    hub.downloads?.length
  )
}

function buildFallbackSections(hub: HubPage): HubPage['sections'] {
  const baseId = hub.id * 1000

  if (hub.slug === 'thu-vien-khai-thi') {
    return [
      {
        id: baseId + 1,
        heading: 'Lối vào nhanh',
        description: 'Mở nhanh các khu nội dung đang có dữ liệu thật trong hệ thống.',
        links: [
          { id: baseId + 11, title: 'Khai Thị Mới Nhất', url: '/blog', description: 'Đọc các bài giảng và ghi chép mới cập nhật.', thumbnail: null, kind: 'internal' },
          { id: baseId + 12, title: 'Nghe Khai Thị Audio', url: '/radio', description: 'Mở kho pháp âm và bài giảng âm thanh.', thumbnail: null, kind: 'internal' },
          { id: baseId + 13, title: 'Xem Video Khai Thị', url: '/videos', description: 'Mở thư viện video khai thị và pháp hội.', thumbnail: null, kind: 'internal' },
          { id: baseId + 14, title: 'Kho Tài Liệu Tải Về', url: '/library', description: 'Xem toàn bộ PDF, audio, video và sách.', thumbnail: null, kind: 'internal' },
        ],
      },
    ]
  }

  if (hub.slug === 'trung-tam-tu-hoc') {
    return [
      {
        id: baseId + 2,
        heading: 'Bắt đầu tu học',
        description: 'Các lối vào cốt lõi dành cho người mới và người đang thực hành mỗi ngày.',
        links: [
          { id: baseId + 21, title: 'Niệm Kinh Hàng Ngày', url: '/niem-kinh', description: 'Theo dõi tiến độ niệm và bài thực hành trong ngày.', thumbnail: null, kind: 'internal' },
          { id: baseId + 22, title: 'Lịch Tu Hôm Nay', url: '/lunar-calendar', description: 'Tra cứu lịch tu, ngày âm và sự kiện cần lưu ý.', thumbnail: null, kind: 'internal' },
          { id: baseId + 23, title: 'Thư Viện Tu Học', url: '/library', description: 'Mở toàn bộ tài liệu, biểu mẫu và bài giảng.', thumbnail: null, kind: 'internal' },
          { id: baseId + 24, title: 'Khai Thị Cốt Lõi', url: '/blog', description: 'Đọc những bài khai thị nền tảng và trọng yếu.', thumbnail: null, kind: 'internal' },
        ],
      },
    ]
  }

  return [
    {
      id: baseId + 3,
      heading: 'Khám phá thêm',
      description: 'Trang này đang tự hiển thị nội dung mới nhất từ hệ thống.',
      links: [
        { id: baseId + 31, title: 'Bài viết mới', url: '/blog', description: 'Đọc các nội dung vừa được cập nhật.', thumbnail: null, kind: 'internal' },
        { id: baseId + 32, title: 'Kho tài liệu', url: '/library', description: 'Mở thư viện tải về và tài liệu học pháp.', thumbnail: null, kind: 'internal' },
      ],
    },
  ]
}

function selectFallbackDownloads(hub: HubPage, items: DownloadItem[]): DownloadItem[] {
  if (hub.slug === 'thu-vien-khai-thi') {
    return items
      .filter((item) => ['Khai Thị Audio', 'Khai Thị Video', 'Sách', 'Kinh Điển'].includes(item.category))
      .slice(0, 12)
  }

  if (hub.slug === 'trung-tam-tu-hoc') {
    return items
      .filter((item) => ['Hướng Dẫn', 'Kinh Điển', 'Sách', 'Khai Thị Audio'].includes(item.category))
      .slice(0, 10)
  }

  return items.slice(0, 8)
}

async function hydrateHubFallback(hub: HubPage): Promise<HubPage> {
  if (hasRenderableHubContent(hub)) return hub

  const emptyPosts: StrapiList<import('@/types/strapi').BlogPost> = {
    data: [],
    meta: {
      pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 },
    },
  }

  const [featuredPostsRes, downloadsRes] = await Promise.all([
    getPosts({ pageSize: hub.slug === 'thu-vien-khai-thi' ? 6 : 4, featured: true, revalidate: 3600 }).catch(() => emptyPosts),
    fetchDownloads({ pageSize: 24 }).catch(() => ({ items: [], total: 0 })),
  ])

  const featuredPosts = featuredPostsRes.data?.length
    ? featuredPostsRes.data
    : (await getPosts({ pageSize: hub.slug === 'thu-vien-khai-thi' ? 6 : 4, revalidate: 3600 }).catch(() => emptyPosts)).data

  const normalizedDownloads = (downloadsRes.items ?? []) as unknown as DownloadItem[]
  const fallbackDownloads = selectFallbackDownloads(hub, normalizedDownloads)
  const fallbackSections = buildFallbackSections(hub)
  const fallbackBlocks: HubPage['blocks'] = []

  if (hub.description) {
    fallbackBlocks.push({
      __component: 'blocks.rich-text',
      id: hub.id * 100 + 1,
      content: `<p>${hub.description}</p><p>Nội dung dưới đây đang được tự động lấy từ bài viết và thư viện tài liệu đã phát hành, giúp trang không bị trống khi admin chưa cấu hình block chi tiết.</p>`,
    })
  }

  if (featuredPosts.length > 0) {
    fallbackBlocks.push({
      __component: 'blocks.post-list-manual',
      id: hub.id * 100 + 2,
      heading: hub.slug === 'thu-vien-khai-thi' ? 'Bài Khai Thị Nên Đọc' : 'Bài Cốt Lõi Nên Xem',
      description: 'Tự lấy từ các bài đã xuất bản gần đây trong hệ thống.',
      posts: featuredPosts,
    })
  }

  if (fallbackDownloads.length > 0) {
    fallbackBlocks.push({
      __component: 'blocks.download-grid',
      id: hub.id * 100 + 3,
      heading: hub.slug === 'thu-vien-khai-thi' ? 'Tài Liệu Và Pháp Âm' : 'Tài Liệu Tu Học',
      description: 'Tự lấy từ kho download hiện có, ưu tiên tài liệu phù hợp với hub này.',
      downloads: fallbackDownloads,
    })
  }

  return {
    ...hub,
    sections: hub.sections?.length ? hub.sections : fallbackSections,
    curated_posts: hub.curated_posts?.length ? hub.curated_posts : featuredPosts,
    downloads: hub.downloads?.length ? hub.downloads : fallbackDownloads,
    blocks: hub.blocks?.length ? hub.blocks : fallbackBlocks,
  }
}

/** Lấy một hub-page theo slug. Populate đầy đủ: sections, curated_posts, downloads */
export async function getHubBySlug(slug: string): Promise<HubPage | null> {
  try {
    const res = await strapiFetch<StrapiList<HubPage>>('/hub-pages', {
      filters: { slug: { $eq: slug } },
      populate: POPULATE_HUB,
      pagination: { page: 1, pageSize: 1 },
      next: { revalidate: 3600, tags: ['hub-pages'] },
    })
    const hub = res.data[0] ?? null
    if (!hub) return null
    return hydrateHubFallback(hub)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[Hub] Fallback mode for slug "${slug}": ${message}`)
    const hub = buildFallbackHubPages().find((item) => item.slug === slug) ?? null
    return hub ? hydrateHubFallback(hub) : null
  }
}

/** Lấy toàn bộ hub-pages (dùng cho menu/sitemap). Không populate nặng. */
export async function getHubPages(): Promise<HubPage[]> {
  try {
    const res = await strapiFetch<StrapiList<HubPage>>('/hub-pages', {
      fields: ['id', 'documentId', 'title', 'slug', 'sortOrder', 'showInMenu', 'menuIcon'],
      filters: { showInMenu: { $eq: true } },
      sort: ['sortOrder:asc', 'title:asc'],
      pagination: { page: 1, pageSize: 50 },
      next: { revalidate: 3600, tags: ['hub-pages'] },
    })
    return res.data
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[Hub] Falling back to static hub pages: ${message}`)
    return buildFallbackHubPages()
  }
}
