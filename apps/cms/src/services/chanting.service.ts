import { buildSlug } from "@/services/content-helpers.service";
import { ensurePublicId } from "@/services/public-id.service";

type ChantItemInput = {
  publicId?: string | null | undefined;
  title?: string | null | undefined;
  slug?: string | null | undefined;
  kind?: string | null | undefined;
  openingPrayer?: string | null | undefined;
  timeRules?:
    | {
        dateFrom?: string | null | undefined;
        dateTo?: string | null | undefined;
        lunarDay?: number | null | undefined;
        notes?: string | null | undefined;
      }[]
    | null
    | undefined;
};

type PlanInput = {
  publicId?: string | null | undefined;
  title?: string | null | undefined;
  slug?: string | null | undefined;
  planType?: string | null | undefined;
};

type PreferenceInput = {
  publicId?: string | null | undefined;
  enabledOptionalItems?: { chantItem?: string | number | null | undefined }[] | null | undefined;
  targetsByItem?: { chantItem?: string | number | null | undefined; target?: number | null | undefined }[] | null | undefined;
  intentionsByItem?: { chantItem?: string | number | null | undefined; intention?: string | null | undefined }[] | null | undefined;
};

type PracticeLogInput = {
  publicId?: string | null | undefined;
  practiceDate?: string | null | undefined;
  itemStates?:
    | { chantItem?: string | number | null | undefined; completed?: boolean | null | undefined; count?: number | null | undefined }[]
    | null
    | undefined;
  sessionConfig?:
    | { durationMinutes?: number | null | undefined; notes?: string | null | undefined }
    | null
    | undefined;
  startedAt?: string | null | undefined;
  completedAt?: string | null | undefined;
  isCompleted?: boolean | null | undefined;
};

function sanitizeText(value?: string | null): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function normalizeNumber(value?: number | null): number | null {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return null;
  }

  return Math.floor(value);
}

function extractRelationId(value: unknown): string | number | null {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    const relationId = value.id;

    if (typeof relationId === "string" || typeof relationId === "number") {
      return relationId;
    }
  }

  return null;
}

export function mapChantItemToPublicDTO<T extends { publicId?: string | null | undefined; title?: string | null | undefined; slug?: string | null | undefined; kind?: string | null | undefined }>(item: T) {
  return {
    id: item.publicId ?? null,
    title: item.title ?? "",
    slug: item.slug ?? "",
    kind: item.kind ?? "",
  };
}

export function normalizeTimeRules(input?: ChantItemInput["timeRules"]) {
  return (input ?? []).map((rule) => ({
    dateFrom: rule.dateFrom ?? null,
    dateTo: rule.dateTo ?? null,
    lunarDay: normalizeNumber(rule.lunarDay),
    notes: sanitizeText(rule.notes),
  }));
}

export function prepareChantItemData<T extends ChantItemInput>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: sanitizeText(input.title),
      slug: sanitizeText(input.slug) || buildSlug(input.title),
      kind: sanitizeText(input.kind) || "mantra",
      openingPrayer: sanitizeText(input.openingPrayer),
      timeRules: normalizeTimeRules(input.timeRules),
    },
    "cht",
  ) as T;
}

export function mapChantPlanToPublicDTO<T extends { publicId?: string | null | undefined; title?: string | null | undefined; slug?: string | null | undefined; planType?: string | null | undefined }>(plan: T) {
  return {
    id: plan.publicId ?? null,
    title: plan.title ?? "",
    slug: plan.slug ?? "",
    planType: plan.planType ?? "",
  };
}

export function validatePlanItems(): void {
  return;
}

export function prepareChantPlanData<T extends PlanInput>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      title: sanitizeText(input.title),
      slug: sanitizeText(input.slug) || buildSlug(input.title),
      planType: sanitizeText(input.planType) || "daily",
    },
    "chp",
  ) as T;
}

export function resolveLunarEventsForDate(): void {
  return;
}

export function mergeLunarOverrides() {
  return;
}

export function normalizePreferenceStructure<T extends PreferenceInput>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      intentionsByItem: (input.intentionsByItem ?? []).map((item) => ({
        chantItem: item.chantItem ?? null,
        intention: sanitizeText(item.intention),
      })),
      targetsByItem: (input.targetsByItem ?? []).map((item) => ({
        chantItem: item.chantItem ?? null,
        target: normalizeNumber(item.target) ?? 0,
      })),
      enabledOptionalItems: (input.enabledOptionalItems ?? []).map((item) => ({
        chantItem: item.chantItem ?? null,
      })),
    },
    "chf",
  ) as T;
}

export function upsertChantPreferences<T extends PreferenceInput>(input: T): T {
  return normalizePreferenceStructure(input);
}

export function mergePreferencesWithPlan() {
  return;
}

export function upsertPracticeLog<T extends PracticeLogInput>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      practiceDate: input.practiceDate ?? new Date().toISOString().slice(0, 10),
      itemStates: (input.itemStates ?? []).map((item) => ({
        chantItem: item.chantItem ?? null,
        completed: Boolean(item.completed),
        count: normalizeNumber(item.count) ?? 0,
      })),
      sessionConfig: {
        durationMinutes: normalizeNumber(input.sessionConfig?.durationMinutes) ?? 0,
        notes: sanitizeText(input.sessionConfig?.notes),
      },
      startedAt: input.startedAt ?? null,
      completedAt: input.completedAt ?? null,
      isCompleted: Boolean(input.isCompleted),
    },
    "cpl",
  ) as T;
}

export function completePracticeLog<T extends PracticeLogInput>(input: T): T {
  return upsertPracticeLog({
    ...input,
    completedAt: input.completedAt ?? new Date().toISOString(),
    isCompleted: true,
  });
}

export function buildPracticeSummary() {
  return;
}

export function mapChantPreferenceToDTO<
  T extends {
    publicId?: string | null | undefined;
    plan?: unknown;
    enabledOptionalItems?: { chantItem?: unknown }[] | null | undefined;
    targetsByItem?: { chantItem?: unknown; target?: number | null | undefined }[] | null | undefined;
    intentionsByItem?: { chantItem?: unknown; intention?: string | null | undefined }[] | null | undefined;
  },
>(preference: T) {
  return {
    id: preference.publicId ?? null,
    plan: extractRelationId(preference.plan),
    enabledOptionalItems: (preference.enabledOptionalItems ?? []).map((item) => ({
      chantItem: extractRelationId(item.chantItem),
    })),
    targetsByItem: (preference.targetsByItem ?? []).map((item) => ({
      chantItem: extractRelationId(item.chantItem),
      target: item.target ?? 0,
    })),
    intentionsByItem: (preference.intentionsByItem ?? []).map((item) => ({
      chantItem: extractRelationId(item.chantItem),
      intention: item.intention ?? "",
    })),
  };
}

export function mapPracticeLogToDTO<
  T extends {
    publicId?: string | null | undefined;
    plan?: unknown;
    practiceDate?: string | null | undefined;
    itemStates?: unknown[] | null | undefined;
    sessionConfig?: { durationMinutes?: number | null | undefined; notes?: string | null | undefined } | null | undefined;
    startedAt?: string | null | undefined;
    completedAt?: string | null | undefined;
    isCompleted?: boolean | null | undefined;
  },
>(log: T) {
  return {
    id: log.publicId ?? null,
    plan: extractRelationId(log.plan),
    practiceDate: log.practiceDate ?? null,
    itemStates: log.itemStates ?? [],
    sessionConfig: log.sessionConfig ?? null,
    startedAt: log.startedAt ?? null,
    completedAt: log.completedAt ?? null,
    isCompleted: Boolean(log.isCompleted),
  };
}
