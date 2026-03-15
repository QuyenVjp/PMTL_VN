import type { SearchSyncJob } from "@pmtl/shared";
import type { Payload } from "payload";

import { syncPostSearch } from "@/services/search.service";

export async function runSearchSyncJob(payload: Payload, input: SearchSyncJob) {
  if (input.entityType !== "post") {
    return { skipped: true, reason: "unsupported-entity-type" };
  }

  const document =
    input.document ??
    (input.documentId
      ? await payload.findByID({
          collection: "posts",
          id: input.documentId,
          depth: 0,
          overrideAccess: true,
        })
      : null);

  if (!document) {
    return { skipped: true, reason: "post-not-found" };
  }

  await syncPostSearch(document as never, {
    payload,
  });

  return {
    synced: true,
    publicId: input.publicId ?? ("publicId" in (document as Record<string, unknown>) ? document.publicId : null),
  };
}
