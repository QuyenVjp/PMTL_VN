import { cachedCmsFetch } from '@/lib/cms/server-cache';
import type { CmsEvent, CmsList } from '@/types/cms';

/**
 * Fetch events list from CMS
 */
export async function fetchEvents() {
  return cachedCmsFetch<CmsList<CmsEvent>>('/events', {
    status: 'published',
    sort: ['date:desc', 'publishedAt:desc'],
    populate: ['coverImage'],
    pagination: { pageSize: 100 },
  }, { profile: 'hours', tags: ['events'] });
}

/**
 * Fetch a single event by slug
 */
export async function fetchEventBySlug(slug: string): Promise<CmsEvent | null> {
  const res = await cachedCmsFetch<CmsList<CmsEvent>>('/events', {
    status: 'published',
    filters: { slug: { $eq: slug } },
    populate: ['coverImage', 'gallery', 'files'],
    pagination: { pageSize: 1 },
  }, { profile: 'hours', tags: ['events'] });
  return res.data?.[0] ?? null;
}

/**
 * Fetch all published event slugs for static path generation
 */
export async function getAllEventSlugs(): Promise<string[]> {
  const res = await cachedCmsFetch<CmsList<Pick<CmsEvent, 'slug'>>>('/events', {
    status: 'published',
    fields: ['slug'],
    pagination: { pageSize: 200 },
  }, { profile: 'hours', tags: ['events'] });
  return res.data?.map((e) => e.slug) ?? [];
}
