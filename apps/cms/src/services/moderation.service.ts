import type { Payload } from "payload";
import { createHash } from "node:crypto";

import { ensurePublicId } from "@/services/public-id.service";

type ModeratedCollection = "postComments" | "communityPosts" | "communityComments" | "guestbookEntries";

function sanitizeText(value?: string | null): string {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function submitModerationReport<T extends { publicId?: string | null | undefined; reason?: string | null | undefined; notes?: string | null | undefined; status?: string | null | undefined }>(input: T): T {
  return ensurePublicId(
    {
      ...input,
      reason: sanitizeText(input.reason),
      notes: sanitizeText(input.notes),
      status: sanitizeText(input.status) || "pending",
    },
    "rpt",
  ) as T;
}

export async function resolveModerationReport(payload: Payload, id: string | number, status: string) {
  return payload.update({
    collection: "moderationReports",
    id,
    data: {
      status,
    },
    overrideAccess: true,
  });
}

export function buildReporterIpHash(ipAddress?: string | null): string {
  const normalized = ipAddress?.trim();

  if (!normalized) {
    return "";
  }

  return createHash("sha256").update(normalized).digest("hex");
}

export async function syncEntityModerationSummary(
  payload: Payload,
  collection: ModeratedCollection,
  id: string | number,
  reason: string,
) {
  if (collection === "guestbookEntries") {
    return payload.update({
      collection,
      id,
      data: {
        approvalStatus: "pending",
      },
      overrideAccess: true,
    });
  }

  const existing = await payload.findByID({
    collection,
    id,
    depth: 0,
    overrideAccess: true,
  });

  const currentReportCount =
    "reportCount" in existing && typeof existing.reportCount === "number" ? existing.reportCount : 0;

  return payload.update({
    collection,
    id,
    data: {
      reportCount: currentReportCount + 1,
      lastReportReason: sanitizeText(reason),
    },
    overrideAccess: true,
  });
}

export function applyModerationDecision() {
  return;
}

export async function applyModerationDecisionToTarget(
  payload: Payload,
  input: {
    collection: ModeratedCollection;
    id: string | number;
    decision: "approved" | "rejected" | "flagged" | "hidden";
  },
) {
  if (input.collection === "guestbookEntries") {
    return payload.update({
      collection: "guestbookEntries",
      id: input.id,
      data: {
        approvalStatus: input.decision === "approved" ? "approved" : "rejected",
      },
      overrideAccess: true,
    });
  }

  return payload.update({
    collection: input.collection,
    id: input.id,
    data: {
      moderationStatus: input.decision,
      isHidden: input.decision === "hidden" || input.decision === "rejected",
    },
    overrideAccess: true,
  });
}
