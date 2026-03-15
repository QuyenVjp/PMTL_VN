import type { Field } from "payload";
import { moderationStatusValues } from "@pmtl/shared";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const postCommentFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Nội dung", "Content"),
        fields: [
          buildPublicIdField(),
          {
            name: "post",
            label: t("Bài viết", "Post"),
            type: "relationship",
            relationTo: "posts",
            required: true,
          },
          {
            name: "parent",
            label: t("Bình luận cha", "Parent comment"),
            type: "relationship",
            relationTo: "postComments",
          },
          {
            name: "content",
            label: t("Nội dung bình luận", "Comment content"),
            type: "textarea",
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                name: "authorName",
                label: t("Tên người gửi", "Author name"),
                type: "text",
                required: true,
              },
              {
                name: "authorAvatar",
                label: t("Avatar snapshot", "Avatar snapshot"),
                type: "text",
              },
            ],
          },
          {
            type: "row",
            fields: [
              {
                name: "badge",
                label: t("Nhãn hiển thị", "Badge"),
                type: "text",
              },
              {
                name: "isOfficialReply",
                label: t("Phản hồi chính thức", "Official reply"),
                type: "checkbox",
                defaultValue: false,
              },
            ],
          },
        ],
      },
      {
        label: t("Nguồn gửi", "Submission"),
        fields: [
          {
            name: "submittedByUser",
            label: t("Người dùng gửi", "Submitted by user"),
            type: "relationship",
            relationTo: "users",
          },
          {
            name: "submittedByIpHash",
            label: t("IP hash", "IP hash"),
            type: "text",
            admin: {
              readOnly: true,
            },
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
            required: true,
            options: moderationStatusValues.map((value) => ({
              label: value,
              value,
            })),
          },
          {
            type: "row",
            fields: [
              {
                name: "likes",
                label: t("Lượt thích", "Likes"),
                type: "number",
                defaultValue: 0,
                admin: {
                  readOnly: true,
                },
              },
              {
                name: "spamScore",
                label: t("Điểm spam", "Spam score"),
                type: "number",
                defaultValue: 0,
                admin: {
                  readOnly: true,
                },
              },
              {
                name: "reportCount",
                label: t("Số report", "Report count"),
                type: "number",
                defaultValue: 0,
                admin: {
                  readOnly: true,
                },
              },
            ],
          },
          {
            name: "lastReportReason",
            label: t("Lý do report gần nhất", "Last report reason"),
            type: "text",
            admin: {
              readOnly: true,
            },
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
