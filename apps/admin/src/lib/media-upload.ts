export interface UploadMediaPayload {
  publicId?: string;
  url?: string;
  mimeType?: string;
  size?: number;
}

export function extractUploadMediaPayload(payload: unknown): UploadMediaPayload | null {
  const root = payload as Record<string, unknown> | null;
  if (!root) return null;

  const direct: UploadMediaPayload = {
    publicId: typeof root.publicId === "string" ? root.publicId : undefined,
    url: typeof root.url === "string" ? root.url : undefined,
    mimeType: typeof root.mimeType === "string" ? root.mimeType : undefined,
    size: typeof root.size === "number" ? root.size : undefined,
  };

  const level1 = root.data as Record<string, unknown> | undefined;
  if (!level1) {
    return direct.publicId || direct.url ? direct : null;
  }

  const nested: UploadMediaPayload = {
    publicId: typeof level1.publicId === "string" ? level1.publicId : direct.publicId,
    url: typeof level1.url === "string" ? level1.url : direct.url,
    mimeType: typeof level1.mimeType === "string" ? level1.mimeType : direct.mimeType,
    size: typeof level1.size === "number" ? level1.size : direct.size,
  };

  const level2 = level1.data as Record<string, unknown> | undefined;
  if (!level2) return nested;

  return {
    publicId: typeof level2.publicId === "string" ? level2.publicId : nested.publicId,
    url: typeof level2.url === "string" ? level2.url : nested.url,
    mimeType: typeof level2.mimeType === "string" ? level2.mimeType : nested.mimeType,
    size: typeof level2.size === "number" ? level2.size : nested.size,
  };
}

