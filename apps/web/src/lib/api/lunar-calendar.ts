import { logger } from '@/lib/logger'

// Khong import cmsFetch vi endpoint /with-blogs dung Document Service direct
// cmsFetch chi dung cho REST API thong thuong

export interface BlogPostPreview {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  thumbnail?: { url: string };
}

export interface LunarEvent {
  id: number;
  documentId: string;
  title: string;
  isRecurringLunar: boolean;
  lunarMonth: number | null;
  lunarDay: number | null;
  solarDate: string | null;
  eventType: 'buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal';

  relatedBlogs?: BlogPostPreview[]; // Khai thi blog lien quan
}

/**
 * Lay danh sach lunar-events tu endpoint /with-blogs (Document Service)
 * Endpoint nay populate relatedBlogs day du, tranh gioi han permission cua REST API public
 */
export async function fetchLunarEvents(): Promise<LunarEvent[]> {
  try {
    const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001');
    const token = process.env.PAYLOAD_API_TOKEN;

    // Goi endpoint custom /with-blogs — dung Document Service ben BE, co relatedBlogs
    const res = await fetch(`${CMS_API_URL}/api/lunar-events/with-blogs`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return (json.data as LunarEvent[]) ?? [];
  } catch (error) {
    logger.error('Failed to fetch lunar events', { error });
    return [];
  }
}
