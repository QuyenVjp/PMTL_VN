import type { Field } from "payload";
import { contentStatusValues } from "@pmtl/shared";

export function buildContentStatusField(): Field {
  return {
    name: "status",
    type: "select",
    defaultValue: "draft",
    options: contentStatusValues.map((value) => ({
      label: value,
      value,
    })),
    required: true,
  };
}

