import { cmsFetch } from '@/lib/cms';
import type { CmsEvent, CmsList } from '@/types/cms';

/**
 * Fetch events list from Strapi
 */
export async function fetchEvents() {
  return cmsFetch<CmsList<CmsEvent>>('/events', {
    status: 'published',
    sort: ['date:desc', 'publishedAt:desc'],
    populate: ['coverImage'],
    pagination: { pageSize: 100 },
    next: { tags: ['events'], revalidate: 3600 }
  });
}

/**
 * Fetch a single event by slug
 */
export async function fetchEventBySlug(slug: string): Promise<CmsEvent | null> {
  const res = await cmsFetch<CmsList<CmsEvent>>('/events', {
    status: 'published',
    filters: { slug: { $eq: slug } },
    populate: ['coverImage', 'gallery', 'files'],
    pagination: { pageSize: 1 },
    next: { tags: ['events'], revalidate: 3600 }
  });
  return res.data?.[0] ?? null;
}

/**
 * Fetch all published event slugs for static path generation
 */
export async function getAllEventSlugs(): Promise<string[]> {
  const res = await cmsFetch<CmsList<Pick<CmsEvent, 'slug'>>>('/events', {
    status: 'published',
    fields: ['slug'],
    pagination: { pageSize: 200 },
    next: { tags: ['events'], revalidate: 3600 }
  });
  return res.data?.map((e) => e.slug) ?? [];
}
