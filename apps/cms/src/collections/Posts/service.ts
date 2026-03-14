import { buildPostData, ensurePostCanPublish } from "@/services/post.service";

type PostInput = {
  title?: string | null;
  slug?: string | null;
  status?: string | null;
  publishedAt?: string | null;
};

export function preparePostData(input: PostInput): PostInput {
  ensurePostCanPublish(input);
  return buildPostData(input);
}

