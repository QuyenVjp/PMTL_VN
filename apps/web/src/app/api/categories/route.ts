import { getCategories } from "@/lib/api/categories";
import { logger } from "@/lib/logger";
import { connection } from "next/server";

export async function GET() {
  await connection();
  try {
    const data = await getCategories();
    const normalized = { data };

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("Categories API failed", { error });
    return new Response(
      JSON.stringify({ data: [], error: "Internal server error", message: errMsg }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
}
