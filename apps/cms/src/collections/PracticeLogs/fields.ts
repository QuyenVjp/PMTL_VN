import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const practiceLogFields: Field[] = [
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
      {
        name: "practiceDate",
        label: t("Ngày công phu", "Practice date"),
        type: "date",
        required: true,
      },
    ],
  },
  {
    name: "itemStates",
    label: t("Trạng thái từng bài", "Item states"),
    type: "array",
    fields: [
      {
        name: "chantItem",
        label: t("Bài niệm", "Chant item"),
        type: "relationship",
        relationTo: "chantItems",
      },
      {
        name: "completed",
        label: t("Hoàn thành", "Completed"),
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "count",
        label: t("Số lượng", "Count"),
        type: "number",
      },
    ],
  },
  {
    name: "sessionConfig",
    label: t("Cấu hình buổi công phu", "Session config"),
    type: "group",
    fields: [
      {
        name: "durationMinutes",
        label: t("Số phút", "Duration minutes"),
        type: "number",
      },
      {
        name: "notes",
        label: t("Ghi chú", "Notes"),
        type: "text",
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "startedAt",
        label: t("Bắt đầu lúc", "Started at"),
        type: "date",
      },
      {
        name: "completedAt",
        label: t("Hoàn thành lúc", "Completed at"),
        type: "date",
      },
      {
        name: "isCompleted",
        label: t("Đã hoàn thành", "Completed"),
        type: "checkbox",
        defaultValue: false,
      },
    ],
  },
];
