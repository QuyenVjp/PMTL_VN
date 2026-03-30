import { z } from "zod";

const COLLECTION_TYPES = [
  "PHOTO_ALBUM",
  "VIDEO_PLAYLIST",
  "MIXED_GALLERY",
  "FEATURED_STORY_GALLERY",
] as const;

const ITEM_TYPES = [
  "IMAGE",
  "VIDEO_EMBED",
  "UPLOADED_VIDEO",
  "POSTER",
  "EXTERNAL_PLAYLIST_LINK",
] as const;

// ── Collection schemas ────────────────────────────────────────────────

export const createCollectionSchema = z.object({
  title:              z.string().min(1).max(200),
  slug:               z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  collectionType:     z.enum(COLLECTION_TYPES),
  description:        z.string().max(2000).optional(),
  sourceNote:         z.string().max(1000).optional(),
  coverMediaPublicId: z.string().optional(),
  featured:           z.boolean().optional(),
  sortOrder:          z.coerce.number().int().min(0).optional(),
});

export const updateCollectionSchema = z.object({
  title:              z.string().min(1).max(200).optional(),
  slug:               z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  description:        z.string().max(2000).optional().nullable(),
  sourceNote:         z.string().max(1000).optional().nullable(),
  coverMediaPublicId: z.string().optional().nullable(),
  featured:           z.boolean().optional(),
  sortOrder:          z.coerce.number().int().min(0).optional(),
});

export const listCollectionsSchema = z.object({
  search:         z.string().optional(),
  collectionType: z.enum(COLLECTION_TYPES).optional(),
  status:         z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured:       z.coerce.boolean().optional(),
  limit:          z.coerce.number().int().min(1).max(100).default(20),
  offset:         z.coerce.number().int().min(0).default(0),
});

// ── Item schemas ──────────────────────────────────────────────────────

export const addCollectionItemSchema = z.object({
  itemType:          z.enum(ITEM_TYPES),
  mediaAssetPublicId: z.string().optional(),
  externalUrl:       z.string().url("URL không hợp lệ").optional(),
  title:             z.string().max(300).optional(),
  caption:           z.string().max(1000).optional(),
  ownerModule:       z.string().max(50).optional(),
  ownerPublicRef:    z.string().max(200).optional(),
  sortOrder:         z.coerce.number().int().min(0).optional(),
}).refine(
  (d) => d.mediaAssetPublicId !== undefined || d.externalUrl !== undefined,
  "Phải có mediaAssetPublicId hoặc externalUrl",
);

export const updateCollectionItemSchema = z.object({
  title:      z.string().max(300).optional().nullable(),
  caption:    z.string().max(1000).optional().nullable(),
  sortOrder:  z.coerce.number().int().min(0).optional(),
});

export const listItemsSchema = z.object({
  limit:  z.coerce.number().int().min(1).max(200).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});
