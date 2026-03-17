import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

const moderationOptions = [
  { label: t("Chờ duyệt", "Pending"), value: "pending" },
  { label: t("Đã duyệt", "Approved"), value: "approved" },
  { label: t("Từ chối", "Rejected"), value: "rejected" },
  { label: t("Cần xem lại", "Flagged"), value: "flagged" },
  { label: t("Ẩn", "Hidden"), value: "hidden" },
];

export const communityCommentFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Nội dung", "Content"),
        fields: [
          buildPublicIdField(),
          {
            name: "post",
            label: t("Bài cộng đồng", "Community post"),
            type: "relationship",
            index: true,
            relationTo: "communityPosts",
            required: true,
          },
          {
            name: "parent",
            label: t("Bình luận cha", "Parent comment"),
            type: "relationship",
            index: true,
            relationTo: "communityComments",
          },
          {
            name: "content",
            label: t("Nội dung", "Content"),
            type: "textarea",
            required: true,
          },
          {
            name: "authorUser",
            label: t("Người dùng", "Author user"),
            type: "relationship",
            index: true,
            relationTo: "users",
          },
          {
            name: "authorNameSnapshot",
            label: t("Tên snapshot", "Author name snapshot"),
            type: "text",
          },
        ],
      },
      {
        label: t("Moderation", "Moderation"),
        fields: [
          {
            name: "moderationStatus",
            label: t("Trạng thái duyệt", "Moderation status"),
            type: "select",
            defaultValue: "pending",
            index: true,
            options: moderationOptions,
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                name: "likes",
                label: t("Lượt thích", "Likes"),
                type: "number",
                defaultValue: 0,
                admin: { readOnly: true },
              },
              {
                name: "spamScore",
                label: t("Spam score", "Spam score"),
                type: "number",
                defaultValue: 0,
                admin: { readOnly: true },
              },
              {
                name: "reportCount",
                label: t("Số report", "Report count"),
                type: "number",
                defaultValue: 0,
                admin: { readOnly: true },
              },
            ],
          },
          {
            name: "lastReportReason",
            label: t("Lý do report gần nhất", "Last report reason"),
            type: "text",
            admin: { readOnly: true },
          },
          {
            name: "isHidden",
            label: t("Ẩn khỏi public", "Hidden"),
            type: "checkbox",
            defaultValue: false,
          },
        ],
      },
    ],
  },
];
