import { cmsFetch } from "@/lib/cms";
import type { CmsList, BlogPost } from "@/types/cms";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10", 10);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const categorySlug = searchParams.get("categorySlug") || undefined;
    const search = searchParams.get("search") || undefined;

    const normalized = await cmsFetch<CmsList<BlogPost>>("/blog-posts", {
      pagination: { page, pageSize },
      filters: {
        ...(categorySlug ? { categorySlug } : {}),
        ...(search ? { search } : {}),
      },
      next: { revalidate: 600, tags: ["blog-posts"] },
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
    console.error("[BlogPosts] Lỗi server:", errMsg);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: errMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
