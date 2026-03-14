import type { Field } from "payload";

import { buildSlugField } from "@/fields/slug-field";
import { buildContentStatusField } from "@/fields/status-field";

export const postFields: Field[] = [
  {
    name: "title",
    type: "text",
    required: true,
  },
  buildSlugField(),
  {
    name: "excerpt",
    type: "textarea",
    required: true,
  },
  {
    name: "content",
    type: "richText",
    required: true,
  },
  buildContentStatusField(),
  {
    name: "publishedAt",
    type: "date",
  },
  {
    name: "author",
    type: "relationship",
    relationTo: "users",
  },
  {
    name: "categories",
    type: "relationship",
    relationTo: "categories",
    hasMany: true,
  },
  {
    name: "featuredImage",
    type: "relationship",
    relationTo: "media",
  },
];

