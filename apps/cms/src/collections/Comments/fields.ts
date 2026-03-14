import type { Field } from "payload";
import { commentStatusValues } from "@pmtl/shared";

export const commentFields: Field[] = [
  {
    name: "post",
    type: "relationship",
    relationTo: "posts",
    required: true,
  },
  {
    name: "authorName",
    type: "text",
    required: true,
  },
  {
    name: "authorEmail",
    type: "email",
    required: true,
  },
  {
    name: "content",
    type: "textarea",
    required: true,
  },
  {
    name: "status",
    type: "select",
    defaultValue: "pending",
    options: commentStatusValues.map((value) => ({ label: value, value })),
    required: true,
  },
  {
    name: "approvedAt",
    type: "date",
  },
];

