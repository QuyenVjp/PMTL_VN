import { appendAuditLog, diffChangedFieldNames } from "@/services/audit.service";

type HookRequest = {
  payload?: Parameters<typeof appendAuditLog>[0];
  user?: {
    id?: string | number | null;
    role?: string | null;
  } | null;
};

type AuditHookArgs = {
  req?: HookRequest | undefined;
  doc?: Record<string, unknown> | undefined;
  previousDoc?: Record<string, unknown> | undefined;
  collection?: {
    slug?: string | undefined;
  } | undefined;
  operation?: string | undefined;
};

function stringifyAuditId(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

export async function appendCollectionAuditLog({
  req,
  doc,
  previousDoc,
  collection,
  operation,
}: AuditHookArgs) {
  if (!req?.payload || !doc) {
    return;
  }

  await appendAuditLog(req.payload, {
    action: `${collection?.slug ?? "unknown"}.${operation ?? "change"}`,
    actorType: req.user ? "user" : "system",
    actorUser:
      req.user?.id !== undefined && req.user.id !== null
        ? Number(req.user.id)
        : null,
    targetType: collection?.slug ?? "unknown",
    targetPublicId:
      typeof doc.publicId === "string" ? doc.publicId : null,
    targetRef: {
      collection: collection?.slug ?? "",
      id: stringifyAuditId(doc.id),
    },
    changedFields: diffChangedFieldNames(doc, previousDoc),
    metadata: {
      operation: operation ?? "change",
    },
  });
}
