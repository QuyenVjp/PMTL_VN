import type { PostSummary } from "@pmtl/shared";

import { EmptyState } from "@/components/common/empty-state";

import { PostCard } from "./post-card";

type PostListProps = {
  posts: PostSummary[];
};

export function PostList({ posts }: PostListProps) {
  if (!posts.length) {
    return (
      <EmptyState
        title="Chưa có bài viết"
        description="Khi Payload có dữ liệu, mục này sẽ lấy trực tiếp từ CMS thay vì fixture."
      />
    );
  }

  return (
    <div className="cards-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

