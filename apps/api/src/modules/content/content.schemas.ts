import { z } from "zod";

const POST_TYPES = ["ARTICLE", "TRANSCRIPT", "SOURCE_NOTE", "EVENT_RECAP"] as const;

// Create post
export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  postType: z.enum(POST_TYPES).default("ARTICLE"),
  sourceRef: z.string().max(500).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.record(z.string(), z.unknown()).default({}),
  featuredImageId: z.string().optional(),
  primaryCategoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  allowComments: z.boolean().default(true),
});

// Update post
export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  postType: z.enum(POST_TYPES).optional(),
  sourceRef: z.string().max(500).optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.record(z.string(), z.unknown()).optional(),
  featuredImageId: z.string().optional().nullable(),
  primaryCategoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  allowComments: z.boolean().optional(),
});

// List posts query
export const listPostsQuerySchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  postType: z.enum(POST_TYPES).optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Post response
export const postResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  postType: z.string(),
  sourceRef: z.string().nullable(),
  excerpt: z.string().nullable(),
  content: z.record(z.string(), z.unknown()),
  status: z.string(),
  featured: z.boolean(),
  allowComments: z.boolean(),
  author: z.object({
    id: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  primaryCategory: z.object({ id: z.string(), name: z.string(), slug: z.string() }).nullable(),
  tags: z.array(z.object({ id: z.string(), name: z.string(), slug: z.string() })),
  featuredImageUrl: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type PostResponse = z.infer<typeof postResponseSchema>;

// Type aliases for compatibility with controller imports
export type CreatePostRequest = CreatePostInput;
export type UpdatePostRequest = UpdatePostInput;

// --------------- Guide schemas ---------------

export const guideQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});
export type GuideQuery = z.infer<typeof guideQuerySchema>;

export const createGuideSchema = z.object({
  title: z.string().min(5).max(300),
  slug: z.string().min(3).max(200).optional(),
  content: z.record(z.string(), z.unknown()).default({}),
  excerpt: z.string().max(500).optional(),
  category: z.enum(["BEGINNER", "DAILY_PRACTICE", "LITTLE_HOUSE", "LIFE_RELEASE", "GENERAL"]),
  sortOrder: z.number().int().min(0).default(0),
  versionNote: z.string().max(500).optional(),
});
export type CreateGuideInput = z.infer<typeof createGuideSchema>;

export const updateGuideSchema = z.object({
  title: z.string().min(5).max(300).optional(),
  slug: z.string().min(3).max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  excerpt: z.string().max(500).optional(),
  category: z.enum(["BEGINNER", "DAILY_PRACTICE", "LITTLE_HOUSE", "LIFE_RELEASE", "GENERAL"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  versionNote: z.string().max(500).optional(),
  status: z.string().optional(),
});
export type UpdateGuideInput = z.infer<typeof updateGuideSchema>;

// Guide response
export const guideResponseSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  title: z.string(),
  slug: z.string(),
  content: z.record(z.string(), z.unknown()),
  excerpt: z.string().nullable(),
  category: z.string(),
  sortOrder: z.number(),
  versionNote: z.string().nullable(),
  status: z.string(),
  author: z.object({
    publicId: z.string(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
  }),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type GuideResponse = z.infer<typeof guideResponseSchema>;

// Type aliases for compatibility with controller imports
export type CreateGuideRequest = CreateGuideInput;
export type UpdateGuideRequest = UpdateGuideInput;

// --------------- Download schemas ---------------

export const downloadQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});
export type DownloadQuery = z.infer<typeof downloadQuerySchema>;

export const createDownloadSchema = z.object({
  title: z.string().min(3).max(300),
  description: z.string().max(2000).optional(),
  category: z.enum(["GUIDE", "TEMPLATE", "REFERENCE", "FAQ"]),
  fileUrl: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().min(0).default(0),
});
export type CreateDownloadInput = z.infer<typeof createDownloadSchema>;

export const updateDownloadSchema = createDownloadSchema.partial();
export type UpdateDownloadInput = z.infer<typeof updateDownloadSchema>;

// Type aliases for compatibility with controller imports  
export type CreateDownloadRequest = CreateDownloadInput;
export type UpdateDownloadRequest = UpdateDownloadInput;
