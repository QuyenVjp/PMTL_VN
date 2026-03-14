import type { CommentStatus } from "../enums/comment-status";
import type { ContentStatus } from "../enums/content-status";
import type { LexicalRichText } from "./lexical";

export type PostSummary = {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string | null;
  categories: string[];
  status: ContentStatus;
};

export type PostDetail = PostSummary & {
  content: LexicalRichText;
  author?: {
    id: string | number;
    displayName: string;
  };
  featuredImage?: {
    id: string | number;
    url: string;
  };
};

export type EventSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  startAt: string;
  endAt: string;
  location: string;
  status: ContentStatus;
};

export type CommentCreateInput = {
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
};

export type CommentSummary = {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  status: CommentStatus;
};

export type SearchResultItem = {
  id: string | number;
  type: "post" | "event";
  title: string;
  slug: string;
  excerpt: string;
  url: string;
};
