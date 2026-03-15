import type { ChantItemIntention, ChantSessionConfig, TodayChantItem } from '@/lib/api/chanting'

export function chantTemplateStorageKey(planSlug: string) {
  return `chant_template_${planSlug}`
}

export function chantSessionConfigStorageKey(date: string, planSlug: string) {
  return `chant_session_config_${date}_${planSlug}`
}

export function loadLocalChantTemplate(planSlug: string): ChantSessionConfig {
  try {
    const raw = localStorage.getItem(chantTemplateStorageKey(planSlug))
    return raw ? normalizeChantConfig(JSON.parse(raw)) : {}
  } catch {
    return {}
  }
}

export function saveLocalChantTemplate(planSlug: string, config: ChantSessionConfig) {
  try {
    localStorage.setItem(chantTemplateStorageKey(planSlug), JSON.stringify(config))
  } catch {}
}

export function loadLocalSessionConfig(date: string, planSlug: string): ChantSessionConfig {
  try {
    const raw = localStorage.getItem(chantSessionConfigStorageKey(date, planSlug))
    return raw ? normalizeChantConfig(JSON.parse(raw)) : {}
  } catch {
    return {}
  }
}

export function saveLocalSessionConfig(date: string, planSlug: string, config: ChantSessionConfig) {
  try {
    localStorage.setItem(chantSessionConfigStorageKey(date, planSlug), JSON.stringify(config))
  } catch {}
}

export function normalizeChantConfig(config: unknown): ChantSessionConfig {
  if (!config || typeof config !== 'object') return {}

  const raw = config as Record<string, unknown>
  const enabledOptionalSlugs = Array.isArray(raw.enabledOptionalSlugs)
    ? raw.enabledOptionalSlugs.filter((value): value is string => typeof value === 'string')
    : undefined

  const targetsBySlug = raw.targetsBySlug && typeof raw.targetsBySlug === 'object'
    ? Object.fromEntries(
        Object.entries(raw.targetsBySlug as Record<string, unknown>)
          .filter(([, value]) => Number.isFinite(value))
          .map(([slug, value]) => [slug, Number(value)])
      )
    : {}

  const intentionsBySlug = raw.intentionsBySlug && typeof raw.intentionsBySlug === 'object'
    ? Object.fromEntries(
        Object.entries(raw.intentionsBySlug as Record<string, unknown>).map(([slug, value]) => {
          const source = value && typeof value === 'object' ? value as Record<string, unknown> : {}
          const next: ChantItemIntention = {}
          if (typeof source.selfName === 'string') next.selfName = source.selfName
          if (typeof source.counterpartName === 'string') next.counterpartName = source.counterpartName
          if (typeof source.wish === 'string') next.wish = source.wish
          return [slug, next]
        })
      )
    : {}

  return { enabledOptionalSlugs, targetsBySlug, intentionsBySlug }
}

function clampTarget(item: TodayChantItem, value: number) {
  let next = Math.round(value)
  if (item.min != null) next = Math.max(item.min, next)
  if (item.max != null) next = Math.min(item.max, next)
  return next
}

function mergePrayer(basePrayer: string | null | undefined, intention?: ChantItemIntention) {
  const parts = [intention?.selfName, intention?.counterpartName, intention?.wish].filter(Boolean)
  if (parts.length === 0) return basePrayer ?? null

  const summary = `Nguyện hôm nay: ${parts.join(' · ')}`
  return basePrayer ? `${summary}\n\n${basePrayer}` : summary
}

export function applyUserChantConfig(
  items: TodayChantItem[],
  templateConfig: ChantSessionConfig | null | undefined,
  sessionConfig: ChantSessionConfig | null | undefined
) {
  const template = normalizeChantConfig(templateConfig ?? {})
  const session = normalizeChantConfig(sessionConfig ?? {})

  const enabledOptionalSlugs = session.enabledOptionalSlugs ?? template.enabledOptionalSlugs ?? null
  const targetsBySlug = {
    ...(template.targetsBySlug ?? {}),
    ...(session.targetsBySlug ?? {}),
  }
  const intentionsBySlug = {
    ...(template.intentionsBySlug ?? {}),
    ...(session.intentionsBySlug ?? {}),
  }

  return items
    .filter((item) => {
      if (!item.isOptional || !enabledOptionalSlugs) return true
      return enabledOptionalSlugs.includes(item.slug)
    })
    .map((item) => ({
      ...item,
      target:
        item.kind === 'step' || targetsBySlug[item.slug] == null
          ? item.target
          : clampTarget(item, targetsBySlug[item.slug]),
      openingPrayer: mergePrayer(item.openingPrayer, intentionsBySlug[item.slug]),
    }))
}

export function buildDefaultTemplateConfig(items: TodayChantItem[]): ChantSessionConfig {
  return {
    enabledOptionalSlugs: items.filter((item) => item.isOptional).map((item) => item.slug),
    targetsBySlug: Object.fromEntries(
      items
        .filter((item) => item.kind !== 'step' && item.target != null)
        .map((item) => [item.slug, item.target as number])
    ),
    intentionsBySlug: {},
  }
}
