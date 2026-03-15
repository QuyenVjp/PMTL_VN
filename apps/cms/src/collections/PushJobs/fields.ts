import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const pushJobFields: Field[] = [
  buildPublicIdField(),
  {
    type: "row",
    fields: [
      {
        name: "kind",
        label: t("Loại job", "Kind"),
        type: "text",
        required: true,
      },
      {
        name: "status",
        label: t("Trạng thái", "Status"),
        type: "text",
        required: true,
      },
      {
        name: "chunkSize",
        label: t("Kích thước chunk", "Chunk size"),
        type: "number",
        defaultValue: 100,
      },
    ],
  },
  {
    name: "message",
    label: t("Nội dung thông báo", "Message"),
    type: "textarea",
  },
  {
    type: "row",
    fields: [
      {
        name: "url",
        label: t("URL", "URL"),
        type: "text",
      },
      {
        name: "tag",
        label: t("Tag", "Tag"),
        type: "text",
      },
    ],
  },
  {
    name: "payload",
    label: t("Payload", "Payload"),
    type: "json",
  },
  {
    type: "row",
    fields: [
      {
        name: "cursor",
        label: t("Cursor", "Cursor"),
        type: "number",
        defaultValue: 0,
      },
      {
        name: "sentCount",
        label: t("Đã gửi", "Sent count"),
        type: "number",
        defaultValue: 0,
        admin: { readOnly: true },
      },
      {
        name: "failedCount",
        label: t("Thất bại", "Failed count"),
        type: "number",
        defaultValue: 0,
        admin: { readOnly: true },
      },
    ],
  },
  {
    name: "errorSummary",
    label: t("Tóm tắt lỗi", "Error summary"),
    type: "textarea",
    admin: { readOnly: true },
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
        name: "finishedAt",
        label: t("Kết thúc lúc", "Finished at"),
        type: "date",
      },
    ],
  },
];
