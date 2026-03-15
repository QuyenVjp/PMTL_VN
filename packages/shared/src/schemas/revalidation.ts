import { z } from "zod";

export const revalidationEntityTypeSchema = z.enum(["collection", "global"]);
export const revalidationOperationSchema = z.enum(["create", "update", "delete"]);

export const revalidationDocumentSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    publicId: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
  })
  .strict();

export const revalidationWebhookSchema = z
  .object({
    source: z.literal("payload"),
    entityType: revalidationEntityTypeSchema,
    slug: z.string().min(1),
    operation: revalidationOperationSchema,
    document: revalidationDocumentSchema.optional(),
  })
  .strict();

export type RevalidationWebhookPayload = z.infer<typeof revalidationWebhookSchema>;
