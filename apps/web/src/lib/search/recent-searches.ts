const RECENT_SEARCHES_KEY = 'pmtl:recent-searches'
const RECENT_SEARCHES_LIMIT = 6

export function loadRecentSearches(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter((value): value is string => typeof value === 'string')
  } catch {
    return []
  }
}

export function saveRecentSearch(query: string): string[] {
  if (typeof window === 'undefined') return []

  const normalized = query.trim()
  if (!normalized) return loadRecentSearches()

  const next = [
    normalized,
    ...loadRecentSearches().filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
  ].slice(0, RECENT_SEARCHES_LIMIT)

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  return next
}
