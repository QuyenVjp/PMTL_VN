import { ArrowRight, Boxes, DatabaseZap, Search } from "lucide-react";

import { SectionTitle } from "@/components/ui/section-title";
import { AuthStatusPanel } from "@/features/auth/components/auth-status-panel";
import { CommentGuidelines } from "@/features/comments/components/comment-guidelines";
import { EventList } from "@/features/events/components/event-list";
import { upcomingEventFixtures } from "@/features/events/utils/fixtures";
import { getFeaturedPosts } from "@/features/posts/api/get-featured-posts";
import { PostList } from "@/features/posts/components/post-list";
import { SearchPanel } from "@/features/search/components/search-panel";

export default function HomePage() {
  const featuredPosts = getFeaturedPosts();

  return (
    <div className="section-stack" style={{ gap: 28 }}>
      <section className="hero-grid">
        <div className="panel" style={{ padding: 32 }}>
          <span className="eyebrow">Stage 1 + Stage 2 ready</span>
          <h1 style={{ fontSize: "clamp(2.8rem, 8vw, 5.2rem)", margin: "18px 0 16px" }}>
            Kien truc monorepo de AI doc code la biet sua dung cho.
          </h1>
          <p className="muted" style={{ fontSize: "1.08rem", lineHeight: 1.7 }}>
            Route o web mong, business rule nam o Payload service, shared schema o package rieng,
            infra compose ro rang theo tung boundary.
          </p>
          <div className="pill-list" style={{ marginTop: 20 }}>
            <span className="pill">
              <Boxes size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              apps/web + apps/cms
            </span>
            <span className="pill">
              <DatabaseZap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Postgres + Payload
            </span>
            <span className="pill">
              <Search size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Meilisearch projection
            </span>
          </div>
        </div>

        <SearchPanel />
      </section>

      <section className="content-grid">
        <div className="section-stack">
          <SectionTitle
            title="Featured posts"
            description="Feature folder tu quan ly api wrapper, component va type rieng."
          />
          <PostList posts={featuredPosts} />
        </div>
        <div className="section-stack">
          <SectionTitle
            title="Upcoming events"
            description="Event rules duoc validate o shared layer va CMS service."
          />
          <EventList events={upcomingEventFixtures} />
        </div>
      </section>

      <section className="cards-grid">
        <CommentGuidelines />
        <AuthStatusPanel />
        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Profile foundation</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Profile edit, role/status display va session protection da nam o route `/profile`.
          </p>
        </div>
      </section>

      <section className="panel" style={{ padding: 28 }}>
        <h2 style={{ marginTop: 0 }}>Boundary rules</h2>
        <div className="cards-grid">
          <div>
            <strong>Web route layer</strong>
            <p className="muted">Render page, load data, metadata, cache/revalidate.</p>
          </div>
          <div>
            <strong>Feature layer</strong>
            <p className="muted">UI state, form, fetch wrapper, client interaction.</p>
          </div>
          <div>
            <strong>CMS service layer</strong>
            <p className="muted">
              Validation, indexing, notification, queue handoff.
              <ArrowRight size={16} style={{ marginLeft: 8, verticalAlign: "middle" }} />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
