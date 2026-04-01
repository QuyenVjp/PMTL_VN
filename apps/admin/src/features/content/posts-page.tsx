import { PlusIcon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { PostsTable } from "@/features/content/posts-table";

export function PostsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bài viết</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Biên tập, xuất bản và rà soát bài viết public của PMTL.
          </p>
        </div>
        <Button onClick={() => void navigate({ to: "/noi-dung/bai-viet/tao-moi" })}>
          <PlusIcon className="size-4" />
          Tạo bài viết
        </Button>
      </div>

      <PostsTable />
    </div>
  );
}
