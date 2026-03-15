import { createPublicId } from "@pmtl/shared";

export function ensurePublicId<T extends { publicId?: string | null | undefined }>(data: T, prefix?: string): T {
  return {
    ...data,
    publicId: data.publicId?.trim() || createPublicId(prefix),
  } as T;
}
