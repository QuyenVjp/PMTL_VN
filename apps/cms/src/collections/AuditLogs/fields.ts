import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const auditLogFields: Field[] = [
  buildPublicIdField(),
  {
    type: "row",
    fields: [
      {
        name: "action",
        label: t("Hành động", "Action"),
        type: "text",
        required: true,
      },
      {
        name: "actorType",
        label: t("Loại actor", "Actor type"),
        type: "text",
      },
      {
        name: "targetType",
        label: t("Loại target", "Target type"),
        type: "text",
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "actorUser",
        label: t("Người thực hiện", "Actor user"),
        type: "relationship",
        relationTo: "users",
      },
      {
        name: "targetPublicId",
        label: t("Public ID target", "Target public ID"),
        type: "text",
      },
      {
        name: "targetRef",
        label: t("Target ref", "Target ref"),
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
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "requestId",
        label: t("Request ID", "Request ID"),
        type: "text",
      },
      {
        name: "ipHash",
        label: t("IP hash", "IP hash"),
        type: "text",
      },
      {
        name: "userAgent",
        label: t("User agent", "User agent"),
        type: "text",
      },
    ],
  },
  {
    name: "changedFields",
    label: t("Field đã đổi", "Changed fields"),
    type: "array",
    fields: [
      {
        name: "field",
        label: t("Field", "Field"),
        type: "text",
      },
    ],
  },
  {
    name: "metadata",
    label: t("Metadata", "Metadata"),
    type: "json",
  },
];
