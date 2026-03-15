import type { Payload } from "payload";

import { ensurePublicId } from "@/services/public-id.service";

export function buildAuditMetadata(metadata?: Record<string, unknown>) {
  return metadata ?? {};
}

export function extractChangedFields(changedFields?: string[] | null) {
  return changedFields ?? [];
}

export function buildAuditLogEntry<T extends { publicId?: string | null | undefined; changedFields?: string[] | null | undefined; metadata?: Record<string, unknown> | null | undefined }>(input: T): T {
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

export function queryAuditTrail() {
  return;
}
