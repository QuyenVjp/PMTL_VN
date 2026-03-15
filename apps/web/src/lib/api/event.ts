import { strapiFetch } from '@/lib/strapi';
import type { StrapiEvent, StrapiList } from '@/types/strapi';

/**
 * Fetch events list from Strapi
 */
export async function fetchEvents() {
  return strapiFetch<StrapiList<StrapiEvent>>('/events', {
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
export async function fetchEventBySlug(slug: string): Promise<StrapiEvent | null> {
  const res = await strapiFetch<StrapiList<StrapiEvent>>('/events', {
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
  const res = await strapiFetch<StrapiList<Pick<StrapiEvent, 'slug'>>>('/events', {
    status: 'published',
    fields: ['slug'],
    pagination: { pageSize: 200 },
    next: { tags: ['events'], revalidate: 3600 }
  });
  return res.data?.map((e) => e.slug) ?? [];
}
