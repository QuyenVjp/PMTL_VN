export function buildMediaDescription(alt: string, caption?: string): string {
  return [alt, caption].filter(Boolean).join(" - ");
}

