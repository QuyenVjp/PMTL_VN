import type { Field } from "payload";

export const mediaFields: Field[] = [
  {
    name: "alt",
    type: "text",
    required: true,
  },
  {
    name: "caption",
    type: "textarea",
  },
];

