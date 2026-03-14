import type { EventSummary, PostSummary } from "@pmtl/shared";

export type HomePageData = {
  featuredPosts: PostSummary[];
  upcomingEvents: EventSummary[];
};
