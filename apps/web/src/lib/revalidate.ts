import type { RevalidationWebhookPayload } from "@pmtl/shared";

export interface RevalidationTarget {
  tags: string[];
  paths: string[];
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getSlug(payload: RevalidationWebhookPayload) {
  return typeof payload.document?.slug === "string" ? payload.document.slug : undefined;
}

export function getRevalidationTarget(payload: RevalidationWebhookPayload): RevalidationTarget {
  const slug = getSlug(payload);
  const tags: string[] = [];
  const paths: string[] = [];

  switch (payload.slug) {
    case "posts":
      tags.push("blog-posts", "blog-posts-slugs", "blog-posts-related");
      paths.push("/blog", "/search", "/archive");
      if (slug) {
        tags.push(`blog-post-${slug}`, `blog-post-seo-${slug}`);
        paths.push(`/blog/${slug}`);
      }
      if (payload.document?.id != null) {
        tags.push(`blog-post-${payload.document.id}`);
      }
      break;
    case "categories":
      tags.push("categories", "blog-posts");
      paths.push("/blog", "/search");
      if (slug) {
        tags.push(`category-${slug}`);
        paths.push(`/category/${slug}`);
      }
      break;
    case "tags":
      tags.push("blog-tags", "blog-posts");
      paths.push("/blog", "/search");
      if (slug) {
        paths.push(`/tag/${slug}`);
      }
      break;
    case "events":
      tags.push("events");
      paths.push("/events");
      if (slug) {
        paths.push(`/events/${slug}`);
      }
      break;
    case "homepage":
      tags.push("homepage-settings");
      paths.push("/");
      break;
    case "site-settings":
      tags.push("settings");
      paths.push("/");
      break;
    case "navigation":
      tags.push("global-navigation");
      break;
    case "sidebar-config":
      tags.push("sidebar-config");
      paths.push("/blog");
      break;
    case "chanting-settings":
      tags.push("chanting-setting");
      paths.push("/niem-kinh");
      break;
    case "hubPages":
      tags.push("hub-pages");
      if (slug) {
        paths.push(`/hub/${slug}`);
      }
      break;
    case "communityPosts":
      tags.push("community-posts");
      paths.push("/shares");
      if (slug) {
        tags.push(`community-post-${slug}`);
        paths.push(`/shares/${slug}`);
      }
      break;
    case "beginnerGuides":
      tags.push("guides");
      paths.push("/beginner-guide");
      break;
    case "downloads":
      tags.push("downloads");
      paths.push("/library");
      break;
    case "sutras":
      tags.push("sutras", "sutra-dictionary");
      paths.push("/kinh-dien");
      if (slug) {
        tags.push(`sutra-${slug}`, `sutra-${slug}-volumes`, `sutra-${slug}-chapters`, `sutra-${slug}-glossaries`);
        paths.push(`/kinh-dien/${slug}`);
      }
      break;
    default:
      break;
  }

  return {
    tags: unique(tags),
    paths: unique(paths),
  };
}
