import type { Field } from "payload";

import { buildSlugField } from "@/fields/slug-field";
import { buildContentStatusField } from "@/fields/status-field";

export const eventFields: Field[] = [
  {
    name: "title",
    type: "text",
    required: true,
  },
  buildSlugField(),
  {
    name: "summary",
    type: "textarea",
    required: true,
  },
  {
    name: "startAt",
    type: "date",
    required: true,
  },
  {
    name: "endAt",
    type: "date",
    required: true,
  },
  {
    name: "location",
    type: "text",
    required: true,
  },
  buildContentStatusField(),
];

