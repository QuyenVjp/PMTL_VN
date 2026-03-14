import type { Field } from "payload";

import { buildSlugField } from "@/fields/slug-field";

export const categoryFields: Field[] = [
  {
    name: "name",
    type: "text",
    required: true,
  },
  buildSlugField(),
  {
    name: "description",
    type: "textarea",
  },
];

