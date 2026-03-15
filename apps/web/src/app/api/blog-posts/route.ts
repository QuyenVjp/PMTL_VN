import { logger } from "@/lib/logger";
import { getPosts } from "@/lib/api/blog";

function isPrerenderInterrupted(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("NEXT_PRERENDER_INTERRUPTED") ||
      ("digest" in error && (error as { digest?: string }).digest === "NEXT_PRERENDER_INTERRUPTED"))
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const search = searchParams.get("search") || undefined;

    const normalized = await getPosts({
      page,
      pageSize,
      categorySlug,
      search,
      revalidate: search ? 0 : 600,
    });

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    if (isPrerenderInterrupted(error)) {
      return new Response(
        JSON.stringify({
          data: [],
          meta: {
            pagination: {
              page: 1,
              pageSize: 10,
              pageCount: 0,
              total: 0,
            },
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("Blog posts API failed", { error });
    return new Response(
      JSON.stringify({ error: "Internal server error", message: errMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
