import type { Field } from "payload";

export function buildSlugField(): Field {
  return {
    name: "slug",
    type: "text",
    index: true,
    unique: true,
    required: true,
    admin: {
      description: "URL-friendly slug, tu dong sinh neu de trong.",
    },
  };
}

