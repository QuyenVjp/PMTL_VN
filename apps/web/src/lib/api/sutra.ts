import { getStrapiMediaUrl, strapiFetch } from '@/lib/strapi'
import type {
  StrapiList,
  StrapiSingle,
  Sutra,
  SutraBookmark,
  SutraChapter,
  SutraGlossary,
  SutraReadingProgress,
  SutraVolume,
} from '@/types/strapi'

export interface SutraListItem {
  id: number
  documentId: string
  title: string
  slug: string
  shortExcerpt: string | null
  description: string | null
  coverUrl: string | null
  tags: { documentId: string; name: string; slug: string }[]
  translatorHan: string | null
  translatorViet: string | null
  reviewer: string | null
  volumeCount: number
}

export interface SutraReaderData {
  sutra: Sutra
  volumes: SutraVolume[]
  chapters: SutraChapter[]
  glossaries: SutraGlossary[]
}

export interface SutraDictionaryEntry {
  documentId: string
  markerKey: string
  term: string
  meaning: string
  sutra: { documentId: string; title: string; slug: string } | null
}

function normalizeListItem(item: Sutra): SutraListItem {
  return {
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    slug: item.slug,
    shortExcerpt: item.shortExcerpt,
    description: item.description,
    coverUrl: getStrapiMediaUrl(item.coverImage?.url),
    tags: (item.tags ?? []).map((tag) => ({
      documentId: tag.documentId,
      name: tag.name,
      slug: tag.slug,
    })),
    translatorHan: item.translatorHan,
    translatorViet: item.translatorViet,
    reviewer: item.reviewer,
    volumeCount: item.volumes?.length ?? 0,
  }
}

export async function fetchSutraList(): Promise<SutraListItem[]> {
  const res = await strapiFetch<StrapiList<Sutra>>('/sutras', {
    status: 'published',
    sort: ['isFeatured:desc', 'sortOrder:asc', 'title:asc'],
    fields: ['title', 'slug', 'shortExcerpt', 'description', 'translatorHan', 'translatorViet', 'reviewer'],
    populate: {
      coverImage: { fields: ['url', 'alternativeText', 'width', 'height'] },
      tags: { fields: ['name', 'slug', 'documentId'] },
      volumes: { fields: ['documentId'] },
    },
    pagination: { page: 1, pageSize: 100 },
    next: { revalidate: 600, tags: ['sutras'] },
  })

  return (res.data ?? []).map(normalizeListItem)
}

export async function fetchSutraBySlug(slug: string): Promise<SutraReaderData | null> {
  // Step 1: Fetch Sutra base data (no nested pagination in populate for Strapi v5)
  const sutraRes = await strapiFetch<StrapiList<Sutra>>('/sutras', {
    status: 'published',
    filters: { slug: { $eq: slug } },
    fields: ['title', 'slug', 'description', 'shortExcerpt', 'translatorHan', 'translatorViet', 'reviewer'],
    populate: {
      coverImage: { fields: ['url', 'alternativeText', 'width', 'height'] },
      tags: { fields: ['name', 'slug', 'documentId'] },
    },
    pagination: { page: 1, pageSize: 1 },
    next: { revalidate: 300, tags: [`sutra-${slug}`] },
  })

  const sutra = sutraRes.data?.[0]
  if (!sutra) return null

  // Step 2: Fetch Volumes by sutra id (avoid nested populate pagination errors)
  let volumes: SutraVolume[] = []
  const volumeRes = await strapiFetch<StrapiList<SutraVolume>>('/sutra-volumes', {
    status: 'published',
    fields: ['title', 'slug', 'volumeNumber', 'bookStart', 'bookEnd', 'description', 'sortOrder', 'documentId'],
    sort: ['volumeNumber:asc', 'sortOrder:asc'],
    populate: {
      sutra: { fields: ['documentId', 'slug', 'title'] },
    },
    pagination: { page: 1, pageSize: 200 },
    next: { revalidate: 300, tags: [`sutra-${slug}-volumes`] },
  })
  volumes = (volumeRes.data ?? [])
    .filter((item) => item.sutra?.documentId === sutra.documentId)
    .slice()
    .sort((a, b) => {
    if (a.volumeNumber !== b.volumeNumber) return a.volumeNumber - b.volumeNumber
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })

  // Fallback: some API tokens may not expose relation fields in REST response.
  if (volumes.length === 0) {
    volumes = (volumeRes.data ?? [])
      .filter((item) => item.slug?.startsWith(`${slug}-`))
      .slice()
      .sort((a, b) => {
        if (a.volumeNumber !== b.volumeNumber) return a.volumeNumber - b.volumeNumber
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      })
  }

  // Step 3: Fetch Chapters.
  // Some data models attach chapters directly to sutra (no volume), others attach through volume.
  // Fetch broadly then narrow in memory to avoid relation-filter edge cases in Strapi v5.
  const volumeDocIds = new Set(volumes.map((v) => v.documentId))
  let chapters: SutraChapter[] = []
  const chapterRes = await strapiFetch<StrapiList<SutraChapter>>('/sutra-chapters', {
    status: 'published',
    fields: ['title', 'slug', 'chapterNumber', 'openingText', 'content', 'endingText', 'estimatedReadMinutes', 'sortOrder', 'documentId'],
    sort: ['chapterNumber:asc', 'sortOrder:asc'],
    populate: {
      sutra: { fields: ['documentId', 'slug', 'title'] },
      volume: {
        fields: ['documentId', 'title', 'slug', 'volumeNumber', 'sortOrder'],
        populate: {
          sutra: { fields: ['documentId', 'slug', 'title'] },
        },
      },
    },
    pagination: { page: 1, pageSize: 2000 },
    next: { revalidate: 300, tags: [`sutra-${slug}-chapters`] },
  })

  chapters = (chapterRes.data ?? [])
    .filter((item) => {
      const bySutra = item.sutra?.documentId === sutra.documentId
      const byVolume = item.volume?.documentId ? volumeDocIds.has(item.volume.documentId) : false
      const byVolumeSutra = item.volume?.sutra?.documentId === sutra.documentId
      return bySutra || byVolume || byVolumeSutra
    })
    .slice()
    .sort((a, b) => {
      if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })

  if (chapters.length === 0) {
    chapters = (chapterRes.data ?? [])
      .filter((item) => item.slug?.startsWith(`${slug}-`))
      .slice()
      .sort((a, b) => {
        if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      })
  }

  // Step 4: Fetch Glossaries by sutra id
  let glossaries: SutraGlossary[] = []
  const glossaryRes = await strapiFetch<StrapiList<SutraGlossary>>('/sutra-glossaries', {
    status: 'published',
    fields: ['markerKey', 'term', 'meaning', 'sortOrder', 'documentId'],
    sort: ['sortOrder:asc', 'createdAt:asc'],
    populate: {
      sutra: { fields: ['documentId', 'slug'] },
      chapter: { fields: ['documentId', 'slug'] },
      volume: { fields: ['documentId', 'slug'] },
    },
    pagination: { page: 1, pageSize: 1000 },
    next: { revalidate: 300, tags: [`sutra-${slug}-glossaries`] },
  })
  glossaries = (glossaryRes.data ?? [])
    .filter((item) => item.sutra?.documentId === sutra.documentId)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  if (glossaries.length === 0 && chapters.length > 0) {
    const markerKeys = new Set<string>()
    const termKeys = new Set<string>()
    const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-')

    for (const chapter of chapters) {
      const blocks = `${chapter.openingText ?? ''}\n${chapter.content ?? ''}\n${chapter.endingText ?? ''}`
      for (const match of blocks.matchAll(/\((\d+)\s*\)/g)) {
        if (match[1]) markerKeys.add(match[1].trim())
      }
      for (const match of blocks.matchAll(/\[\[([^\]]+)\]\]/g)) {
        if (match[1]) termKeys.add(normalize(match[1]))
      }
    }

    glossaries = (glossaryRes.data ?? [])
      .filter((item) => markerKeys.has(item.markerKey.trim()) || termKeys.has(normalize(item.term)))
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  }

  return {
    sutra,
    volumes,
    chapters,
    glossaries,
  }
}

export async function fetchSutraDictionary(): Promise<SutraDictionaryEntry[]> {
  const res = await strapiFetch<StrapiList<SutraGlossary>>('/sutra-glossaries', {
    status: 'published',
    fields: ['documentId', 'markerKey', 'term', 'meaning', 'sortOrder'],
    populate: {
      sutra: { fields: ['documentId', 'title', 'slug'] },
    },
    sort: ['term:asc', 'sortOrder:asc', 'createdAt:asc'],
    pagination: { page: 1, pageSize: 1000 },
    next: { revalidate: 300, tags: ['sutra-dictionary'] },
  })

  return (res.data ?? []).map((item) => ({
    documentId: item.documentId,
    markerKey: item.markerKey,
    term: item.term,
    meaning: item.meaning,
    sutra: item.sutra
      ? {
          documentId: item.sutra.documentId,
          title: item.sutra.title,
          slug: item.sutra.slug,
        }
      : null,
  }))
}

export type { SutraReadingProgress, SutraBookmark }
