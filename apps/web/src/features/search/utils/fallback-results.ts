import { mapSearchSourceToResult } from "@pmtl/shared";

export const fallbackSearchResults = [
  mapSearchSourceToResult({
    id: "post-1",
    title: "Payload service layer",
    slug: "payload-service-layer",
    excerpt: "Tach validation, side effect va indexing khoi schema.",
    type: "post",
  }),
  mapSearchSourceToResult({
    id: "event-1",
    title: "Meilisearch indexing demo",
    slug: "meilisearch-indexing-demo",
    excerpt: "Projection index duoc dong bo tu CMS hooks/service.",
    type: "event",
  }),
];

