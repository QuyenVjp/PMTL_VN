import { SectionTitle } from "@/components/ui/section-title";
import { getFeaturedPosts } from "@/features/posts/api/get-featured-posts";
import { PostList } from "@/features/posts/components/post-list";

export default function PostsPage() {
  const posts = getFeaturedPosts();

  return (
    <section className="section-stack">
      <SectionTitle
        title="Posts domain"
        description="Noi hien thi listing, pagination va filter. Contract du lieu map tu CMS sang PostSummary."
      />
      <PostList posts={posts} />
    </section>
  );
}
