import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const moderationReportFields: Field[] = [
  buildPublicIdField(),
  {
    type: "row",
    fields: [
      {
        name: "entityType",
        label: t("Loại entity", "Entity type"),
        type: "text",
        required: true,
      },
      {
        name: "entityPublicId",
        label: t("Public ID entity", "Entity public ID"),
        type: "text",
        required: true,
      },
      {
        name: "status",
        label: t("Trạng thái", "Status"),
        type: "text",
        required: true,
        defaultValue: "pending",
      },
    ],
  },
  {
    name: "entityRef",
    label: t("Tham chiếu entity", "Entity reference"),
    type: "group",
    fields: [
      {
        name: "collection",
        label: t("Collection", "Collection"),
        type: "text",
      },
      {
        name: "id",
        label: t("ID", "ID"),
        type: "text",
      },
    ],
  },
  {
    name: "reason",
    label: t("Lý do", "Reason"),
    type: "text",
    required: true,
  },
  {
    name: "notes",
    label: t("Ghi chú", "Notes"),
    type: "textarea",
  },
  {
    type: "row",
    fields: [
      {
        name: "reporterUser",
        label: t("Người report", "Reporter user"),
        type: "relationship",
        relationTo: "users",
      },
      {
        name: "reporterIpHash",
        label: t("IP hash", "IP hash"),
        type: "text",
        admin: { readOnly: true },
      },
    ],
  },
];
