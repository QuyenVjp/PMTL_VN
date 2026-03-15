import type { ProgressMap, TodayChantItem } from '@/lib/api/chanting'

export function chantProgressStorageKey(date: string, planSlug: string) {
  return `chant_progress_${date}_${planSlug}`
}

export function chantLastItemStorageKey(planSlug: string) {
  return `chant_last_item_${planSlug}`
}

export function loadLocalChantProgress(date: string, planSlug: string): ProgressMap {
  try {
    const raw = localStorage.getItem(chantProgressStorageKey(date, planSlug))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveLocalChantProgress(date: string, planSlug: string, progress: ProgressMap) {
  try {
    localStorage.setItem(chantProgressStorageKey(date, planSlug), JSON.stringify(progress))
  } catch {}
}

export function clearLocalChantProgress(date: string, planSlug: string) {
  try {
    localStorage.removeItem(chantProgressStorageKey(date, planSlug))
  } catch {}
}

export function loadLastSelectedChantItem(planSlug: string): string | null {
  try {
    return localStorage.getItem(chantLastItemStorageKey(planSlug))
  } catch {
    return null
  }
}

export function saveLastSelectedChantItem(planSlug: string, slug: string | null) {
  try {
    if (!slug) {
      localStorage.removeItem(chantLastItemStorageKey(planSlug))
      return
    }

    localStorage.setItem(chantLastItemStorageKey(planSlug), slug)
  } catch {}
}

export function findNextPendingChantItem(items: TodayChantItem[], progress: ProgressMap) {
  return (
    items.find((item) => {
      const entry = progress[item.slug]

      if (item.kind === 'step') {
        return !entry?.done
      }

      if (item.target != null) {
        return (entry?.count ?? 0) < item.target
      }

      return !entry?.done
    }) ?? null
  )
}

export function summarizeChantProgress(items: TodayChantItem[], progress: ProgressMap) {
  let completedItems = 0
  let totalTarget = 0
  let completedTarget = 0
  let totalCount = 0

  for (const item of items) {
    const entry = progress[item.slug]
    const count = entry?.count ?? 0
    const done = entry?.done ?? false

    totalCount += count

    if (item.kind === 'step') {
      if (done) completedItems += 1
      continue
    }

    if (item.target != null) {
      totalTarget += item.target
      completedTarget += Math.min(count, item.target)
      if (count >= item.target) completedItems += 1
      continue
    }

    if (done || count > 0) {
      completedItems += 1
    }
  }

  return {
    completedItems,
    totalItems: items.length,
    completedTarget,
    totalTarget,
    totalCount,
  }
}
