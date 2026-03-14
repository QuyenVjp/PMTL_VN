import type { PostSummary } from "@pmtl/shared";

export const featuredPostFixtures: PostSummary[] = [
  {
    id: "post-1",
    title: "Tach collection config khoi business logic trong Payload",
    slug: "tach-collection-config-khoi-business-logic",
    excerpt: "Rule, side effect va indexing song o service layer de AI sua dung diem.",
    publishedAt: "2026-03-14T09:00:00.000Z",
    categories: ["architecture", "payload"],
    status: "published",
  },
  {
    id: "post-2",
    title: "Next.js App Router nen de route mong den muc nao",
    slug: "nextjs-app-router-route-mong",
    excerpt: "Page chi render va load data. Feature folder xu ly UI state va mapping.",
    publishedAt: "2026-03-12T04:00:00.000Z",
    categories: ["nextjs", "frontend"],
    status: "published",
  },
  {
    id: "post-3",
    title: "Monorepo cho solo dev: cach de AI doc code khong bi lac",
    slug: "monorepo-cho-solo-dev-ai-doc-code",
    excerpt: "Shared package giu contract on dinh giua web, cms va search.",
    publishedAt: "2026-03-10T07:15:00.000Z",
    categories: ["monorepo"],
    status: "published",
  },
];

