import type { PostSummary } from "@pmtl/shared";

import { featuredPostFixtures } from "../utils/fixtures";

export function getFeaturedPosts(): PostSummary[] {
  return featuredPostFixtures;
}
