import type { Job } from "bullmq";
import type { SearchSyncJob } from "@pmtl/shared";

import { syncPostSearch } from "@/services/search.service";
import { getWorkerPayload } from "@/workers/payload";

export async function processSearchSyncJob(job: Job<SearchSyncJob>) {
  if (job.data.entityType !== "post") {
    return { skipped: true, reason: "unsupported-entity-type" };
  }

  const payload = await getWorkerPayload();
  const document =
    job.data.document ??
    (job.data.documentId
      ? await payload.findByID({
          collection: "posts",
          id: job.data.documentId,
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
    publicId: job.data.publicId ?? ("publicId" in (document as Record<string, unknown>) ? document.publicId : null),
  };
}
