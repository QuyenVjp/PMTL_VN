import { z } from "zod";

export const storageAdapterSchema = z.enum(["local", "r2"]);

export const uploadFileSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  buffer: z.instanceof(Buffer),
});

export const mediaAssetSchema = z.object({
  publicId: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type StorageAdapter = z.infer<typeof storageAdapterSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type MediaAssetResponse = z.infer<typeof mediaAssetSchema>;

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
] as const;

export const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
] as const;

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_VIDEO_TYPES,
] as const;

/**
 * MIME → file extension map — used by StorageService for secure filename generation.
 * Constitution: "Trust filename/originalname from client: FORBIDDEN"
 * Extension is derived from validated MIME type, never from client input.
 */
export const MIME_TO_EXTENSIONS: Record<(typeof ALL_ALLOWED_TYPES)[number], string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/ogg": ".ogg",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};
