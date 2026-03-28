import { PostsProvider } from "@/features/content/posts-context";
import { PostsDialogs } from "@/features/content/posts-dialogs";
import { PostsTable } from "@/features/content/posts-table";

export function PostsPage() {
  return (
    <PostsProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bài viết</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Biên tập, xuất bản và rà soát bài viết public của PMTL.
          </p>
        </div>

        <PostsTable />
      </div>

      <PostsDialogs />
    </PostsProvider>
  );
}
