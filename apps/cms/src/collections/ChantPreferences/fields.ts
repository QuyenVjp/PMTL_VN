import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const chantPreferenceFields: Field[] = [
  buildPublicIdField(),
  {
    type: "row",
    fields: [
      {
        name: "user",
        label: t("Người dùng", "User"),
        type: "relationship",
        relationTo: "users",
        required: true,
      },
      {
        name: "plan",
        label: t("Kế hoạch", "Plan"),
        type: "relationship",
        relationTo: "chantPlans",
        required: true,
      },
    ],
  },
  {
    name: "enabledOptionalItems",
    label: t("Bài niệm bật thêm", "Enabled optional items"),
    type: "array",
    fields: [
      {
        name: "chantItem",
        label: t("Bài niệm", "Chant item"),
        type: "relationship",
        relationTo: "chantItems",
      },
    ],
  },
  {
    name: "targetsByItem",
    label: t("Target theo bài", "Targets by item"),
    type: "array",
    fields: [
      {
        name: "chantItem",
        label: t("Bài niệm", "Chant item"),
        type: "relationship",
        relationTo: "chantItems",
      },
      {
        name: "target",
        label: t("Số lượng", "Target"),
        type: "number",
      },
    ],
  },
  {
    name: "intentionsByItem",
    label: t("Ý nguyện theo bài", "Intentions by item"),
    type: "array",
    fields: [
      {
        name: "chantItem",
        label: t("Bài niệm", "Chant item"),
        type: "relationship",
        relationTo: "chantItems",
      },
      {
        name: "intention",
        label: t("Ý nguyện", "Intention"),
        type: "text",
      },
    ],
  },
];
