import { cmsFetch } from "@/lib/cms";
import type { CmsList, Category } from "@/types/cms";

export async function GET() {
  try {
    const normalized = await cmsFetch<CmsList<Category>>("/blog-tags", {
      pagination: { page: 1, pageSize: 1000 },
      next: { revalidate: 600, tags: ["categories"] },
    });

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[DanhMuc] Lỗi server:", errMsg);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: errMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
