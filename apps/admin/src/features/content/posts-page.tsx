import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostsProvider, usePosts } from "@/features/content/posts-context";
import { PostsDialogs } from "@/features/content/posts-dialogs";
import { PostsTable } from "@/features/content/posts-table";

function PostsPrimaryButtons() {
  const { setOpen } = usePosts();
  return (
    <Button onClick={() => setOpen("create")}>
      <PlusIcon className="size-4" />
      Tạo bài viết
    </Button>
  );
}

export function PostsPage() {
  return (
    <PostsProvider>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bài viết</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Biên tập, xuất bản và rà soát bài viết public của PMTL.
            </p>
          </div>
          <PostsPrimaryButtons />
        </div>

        <PostsTable />
      </div>

      <PostsDialogs />
    </PostsProvider>
  );
}
