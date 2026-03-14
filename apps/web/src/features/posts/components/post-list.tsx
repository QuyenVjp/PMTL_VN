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
        title="Chua co bai viet"
        description="Khi Payload co du lieu, feature nay se lay tu CMS client thay vi fixture."
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

