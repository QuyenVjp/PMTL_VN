import type { PostSummary } from "@pmtl/shared";
import { format } from "date-fns";

type PostCardProps = {
  post: PostSummary;
};

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="panel" style={{ padding: 24 }}>
      <div className="pill-list" style={{ marginBottom: 16 }}>
        {post.categories.map((category) => (
          <span className="pill" key={category}>
            {category}
          </span>
        ))}
      </div>
      <h3 style={{ margin: "0 0 12px" }}>{post.title}</h3>
      <p className="muted">{post.excerpt}</p>
      <p style={{ marginBottom: 0, fontWeight: 600 }}>
        {post.publishedAt ? format(new Date(post.publishedAt), "dd/MM/yyyy") : "Draft"}
      </p>
    </article>
  );
}

