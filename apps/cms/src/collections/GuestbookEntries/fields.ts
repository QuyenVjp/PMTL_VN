import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

const approvalOptions = [
  { label: t("Chờ duyệt", "Pending"), value: "pending" },
  { label: t("Đã duyệt", "Approved"), value: "approved" },
  { label: t("Từ chối", "Rejected"), value: "rejected" },
];

export const guestbookEntryFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Nội dung", "Content"),
        fields: [
          buildPublicIdField(),
          {
            name: "authorName",
            label: t("Người gửi", "Author"),
            type: "text",
            required: true,
          },
          {
            name: "message",
            label: t("Lời nhắn", "Message"),
            type: "textarea",
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                name: "country",
                label: t("Quốc gia", "Country"),
                type: "text",
              },
              {
                name: "avatar",
                label: t("Avatar URL", "Avatar URL"),
                type: "text",
              },
              {
                name: "badge",
                label: t("Badge", "Badge"),
                type: "text",
              },
            ],
          },
          {
            type: "row",
            fields: [
              {
                name: "entryType",
                label: t("Loại lời nhắn", "Entry type"),
                type: "text",
              },
              {
                name: "questionCategory",
                label: t("Nhóm câu hỏi", "Question category"),
                type: "text",
              },
            ],
          },
          {
            name: "submittedByUser",
            label: t("Người dùng gửi", "Submitted by user"),
            type: "relationship",
            index: true,
            relationTo: "users",
          },
          {
            name: "submittedByIpHash",
            label: t("IP hash", "IP hash"),
            type: "text",
            index: true,
            admin: { readOnly: true },
          },
        ],
      },
      {
        label: t("Phản hồi", "Reply"),
        fields: [
          {
            name: "adminReply",
            label: t("Phản hồi của admin", "Admin reply"),
            type: "textarea",
          },
          {
            name: "isAnswered",
            label: t("Đã phản hồi", "Answered"),
            type: "checkbox",
            defaultValue: false,
          },
        ],
      },
      {
        label: t("Moderation", "Moderation"),
        fields: [
          {
            name: "approvalStatus",
            label: t("Trạng thái duyệt", "Approval status"),
            type: "select",
            defaultValue: "pending",
            index: true,
            required: true,
            options: approvalOptions,
          },
        ],
      },
    ],
  },
];
