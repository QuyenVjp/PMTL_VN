export type ReactionType = "like" | "pray" | "inspire" | "gratitude";

export type Reaction = {
  id: string;
  targetType: "post" | "comment" | "community_post";
  targetId: string;
  reaction: ReactionType;
  userId: string;
  createdAt: string;
};

export type Bookmark = {
  id: string;
  targetType: "post" | "event" | "sutra" | "guide";
  targetId: string;
  userId: string;
  createdAt: string;
};
