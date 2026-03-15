import { getPayload } from "payload";

import config from "@/payload.config";
import { enqueuePostReindexBatch } from "@/services/search.service";

function readNumberArg(name: string, fallback: number) {
  const flag = process.argv.find((arg) => arg.startsWith(`--${name}=`));

  if (!flag) {
    return fallback;
  }

  const value = Number(flag.split("=")[1]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

async function main() {
  const payload = await getPayload({ config });
  const limit = readNumberArg("limit", 100);
  let page = readNumberArg("page", 1);
  const allPages = process.argv.includes("--all-pages");
  const summaries: Array<{ page: number; queuedCount: number; totalDocs: number }> = [];

  let hasMore = true;

  while (hasMore) {
    const result = await enqueuePostReindexBatch(payload, { limit, page });
    summaries.push({
      page: result.page,
      queuedCount: result.queuedCount,
      totalDocs: result.totalDocs,
    });

    if (!allPages || page >= result.totalPages) {
      hasMore = false;
      continue;
    }

    page += 1;
  }

  const queuedTotal = summaries.reduce((sum, item) => sum + item.queuedCount, 0);

  console.log(
    JSON.stringify(
      {
        ok: true,
        queuedTotal,
        batches: summaries,
      },
      null,
      2,
    ),
  );

  process.exit(0);
}

void main().catch((error) => {
  console.error("[reindex-posts]", error);
  process.exit(1);
});
