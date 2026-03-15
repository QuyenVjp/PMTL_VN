// ─────────────────────────────────────────────────────────────
//  lib/api/chanting.ts  —  Types + server-side helpers for Niệm Kinh
//  Chỉ dùng trong Server Components / Route Handlers (có cmsFetch)
// ─────────────────────────────────────────────────────────────
import { buildCmsUrl, CMS_API_URL } from '@/lib/cms';
import type { CmsMedia, CmsSingle } from '@/types/cms';

// ── Types ─────────────────────────────────────────────────────

export type EventType = 'buddha' | 'bodhisattva' | 'teacher' | 'fast' | 'holiday' | 'normal';
export type ChantKind = 'step' | 'sutra' | 'mantra';

export interface TimeRules {
  notAfter?: string;       // 'HH:mm' — không niệm sau giờ này
  avoidRange?: [string, string]; // ['HH:mm','HH:mm']
}

export interface TodayEvent {
  id: number;
  documentId: string;
  title: string;
  eventType: EventType;
  relatedBlogs: { id: number; title: string; slug: string }[];
}

export interface TodayChantItem {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  kind: ChantKind;
  order: number;
  target: number | null;       // target cuối sau merge
  min: number | null;
  max: number | null;
  presets: number[];
  timeRules: TimeRules | null;
  openingPrayer: string | null;  // Lời cầu nguyện mở đầu trước khi niệm
  content?: string | null;
  scriptFile?: CmsMedia | null;
  scriptPreviewImages?: CmsMedia[];
  isOptional: boolean;
  source: 'base' | 'enableOverride';
  capsApplied: boolean;
  capMax: number | null;
}

export interface ChantItemIntention {
  selfName?: string;
  counterpartName?: string;
  wish?: string;
}

export interface ChantSessionConfig {
  enabledOptionalSlugs?: string[];
  targetsBySlug?: Record<string, number>;
  intentionsBySlug?: Record<string, ChantItemIntention>;
}

export interface TodayChantResponse {
  date: string;
  lunarInfo: { month: number; day: number } | null;
  todayEvents: TodayEvent[];
  planSlug: string;
  items: TodayChantItem[];
  templateConfig?: ChantSessionConfig;
  sessionConfig?: ChantSessionConfig;
}

export interface ItemProgress {
  count: number;
  done: boolean;
}

export type ProgressMap = Record<string, ItemProgress>;

export interface PracticeLog {
  id: number;
  documentId: string;
  date: string;
  planSlug: string;
  itemsProgress: ProgressMap | null;
  sessionConfig?: ChantSessionConfig | null;
  completedAt: string | null;
}

export interface ChantPreference {
  id: number;
  documentId: string;
  templateConfig: ChantSessionConfig | null;
}

export interface ChantingGuidelineSection {
  id: number;
  title: string;
  body: string;
  order: number;
}

export interface ChantingSetting {
  id: number;
  documentId: string;
  pageTitle: string | null;
  pageDescription: string | null;
  guidelinesTitle: string | null;
  guidelinesSummary: string | null;
  guidelineSections: ChantingGuidelineSection[];
}

// ── Server-side fetchers ──────────────────────────────────────

/**
 * Gọi Strapi aggregator endpoint /chant-plans/today-chant
 * Chỉ dùng trong Server Components hoặc Route Handlers
 */
export async function fetchTodayChant(params: {
  date: string;
  lunarMonth?: number | null;
  lunarDay?: number | null;
  planSlug?: string | null;
}): Promise<TodayChantResponse | null> {
  const { date, lunarMonth, lunarDay, planSlug } = params;
  try {
    const qs = new URLSearchParams({ date });
    if (planSlug) qs.set('planSlug', planSlug);
    if (lunarMonth) qs.set('lunarMonth', String(lunarMonth));
    if (lunarDay) qs.set('lunarDay', String(lunarDay));

    const url = `${CMS_API_URL}/api/chant-plans/today-chant?${qs}`;
    const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN);
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 60 }, // cache 1 phút
    });
    if (!res.ok) {
      console.error('[fetchTodayChant] Strapi error', res.status, await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('[fetchTodayChant] Error:', err);
    return null;
  }
}

export async function fetchTodayChantMy(params: {
  date: string;
  lunarMonth?: number | null;
  lunarDay?: number | null;
  planSlug?: string | null;
  jwt: string;
}): Promise<TodayChantResponse | null> {
  const { date, lunarMonth, lunarDay, planSlug, jwt } = params;
  try {
    const qs = new URLSearchParams({ date });
    if (planSlug) qs.set('planSlug', planSlug);
    if (lunarMonth) qs.set('lunarMonth', String(lunarMonth));
    if (lunarDay) qs.set('lunarDay', String(lunarDay));

    const url = `${CMS_API_URL}/api/chant-plans/today-chant/my?${qs}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Lấy practice log từ Strapi với JWT user token (dùng trong Server Action hoặc route handler)
 */
export async function fetchPracticeLog(params: {
  date: string;
  planSlug?: string | null;
  jwt: string;
}): Promise<PracticeLog | null> {
  const { date, planSlug, jwt } = params;
  try {
    const qs = new URLSearchParams({ date });
    if (planSlug) qs.set('planSlug', planSlug);
    const res = await fetch(`${CMS_API_URL}/api/practice-logs/my?${qs}`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Upsert practice log (dùng trong client thông qua Next route handler)
 */
export async function upsertPracticeLog(params: {
  date: string;
  planSlug?: string | null;
  itemsProgress: ProgressMap;
  sessionConfig?: ChantSessionConfig;
  jwt: string;
}): Promise<PracticeLog | null> {
  const { date, planSlug, itemsProgress, sessionConfig, jwt } = params;
  try {
    const res = await fetch(`${CMS_API_URL}/api/practice-logs/my`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ date, planSlug, itemsProgress, sessionConfig }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchChantingSetting(): Promise<ChantingSetting | null> {
  try {
    const url = buildCmsUrl('/chanting-setting', {
      populate: {
        guidelineSections: true,
      },
    });
    const token = (process.env.PAYLOAD_API_TOKEN ?? process.env.STRAPI_API_TOKEN);
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      next: { revalidate: 3600, tags: ['chanting-setting'] },
    });

    // Single type này là optional trong giai đoạn chuyển môi trường.
    // Nếu backend chưa build schema mới, FE rơi về fallback UI mà không spam console.
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error('[fetchChantingSetting] Strapi error', res.status, await res.text());
      return null;
    }

    const response = (await res.json()) as CmsSingle<ChantingSetting>;
    return response.data ?? null;
  } catch {
    return null;
  }
}
