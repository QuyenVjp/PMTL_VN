import type { Payload } from "payload";

import { ensurePublicId } from "@/services/public-id.service";

export function buildAuditMetadata(metadata?: Record<string, unknown>) {
  return metadata ?? {};
}

export function extractChangedFields(
  changedFields?: string[] | { field?: string | null }[] | null,
) {
  return (changedFields ?? []).map((item) =>
    typeof item === "string"
      ? {
          field: item,
        }
      : {
          field: item.field ?? "",
        },
  );
}

export function diffChangedFieldNames(
  current?: Record<string, unknown> | null,
  previous?: Record<string, unknown> | null,
) {
  if (!current) {
    return [];
  }

  const keys = new Set([
    ...Object.keys(current),
    ...Object.keys(previous ?? {}),
  ]);

  return Array.from(keys).filter((key) => {
    const nextValue = current[key];
    const previousValue = previous?.[key];

    return JSON.stringify(nextValue) !== JSON.stringify(previousValue);
  });
}

export function buildAuditLogEntry<T extends { publicId?: string | null | undefined; changedFields?: string[] | { field?: string | null }[] | null | undefined; metadata?: Record<string, unknown> | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      changedFields: extractChangedFields(input.changedFields),
      metadata: buildAuditMetadata(input.metadata ?? undefined),
    },
    "adt",
  ) as T;
}

export async function appendAuditLog(payload: Payload, input: Record<string, unknown>) {
  return payload.create({
    collection: "auditLogs",
    data: buildAuditLogEntry(input) as never,
    overrideAccess: true,
  });
}

export async function appendRouteAuditLog(
  payload: Payload,
  input: {
    action: string;
    actorUser?: number | null;
    actorType?: string;
    targetType?: string;
    targetPublicId?: string | null;
    targetRef?: { collection?: string; id?: string | null };
    requestId?: string;
    ipHash?: string;
    userAgent?: string;
    changedFields?: string[];
    metadata?: Record<string, unknown>;
  },
) {
  return appendAuditLog(payload, input);
}

export function queryAuditTrail() {
  return;
}
