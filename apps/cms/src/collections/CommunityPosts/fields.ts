import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSlugField } from "@/fields/slug-field";

const communityPostTypeOptions = [
  { label: t("Chia sẻ", "Story"), value: "story" },
  { label: t("Hỏi đáp", "Question"), value: "question" },
  { label: t("Cảm nhận", "Reflection"), value: "reflection" },
  { label: t("Cảm ngộ", "Feedback"), value: "feedback" },
  { label: t("Video", "Video"), value: "video" },
];

const moderationOptions = [
  { label: t("Chờ duyệt", "Pending"), value: "pending" },
  { label: t("Đã duyệt", "Approved"), value: "approved" },
  { label: t("Từ chối", "Rejected"), value: "rejected" },
  { label: t("Cần xem lại", "Flagged"), value: "flagged" },
  { label: t("Ẩn", "Hidden"), value: "hidden" },
];

export const communityPostFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Nội dung", "Content"),
        fields: [
          buildPublicIdField(),
          {
            name: "title",
            label: t("Tiêu đề", "Title"),
            type: "text",
            index: true,
            required: true,
          },
          buildSlugField(),
          {
            name: "content",
            label: t("Nội dung", "Content"),
            type: "textarea",
            required: true,
          },
          {
            type: "row",
            fields: [
              {
                name: "type",
                label: t("Loại bài", "Post type"),
                type: "select",
                defaultValue: "story",
                index: true,
                options: communityPostTypeOptions,
                required: true,
              },
              {
                name: "category",
                label: t("Chuyên mục", "Category"),
                type: "text",
                index: true,
              },
              {
                name: "rating",
                label: t("Mức độ hữu ích", "Rating"),
                type: "number",
                min: 0,
                max: 5,
              },
            ],
          },
          {
            name: "tags",
            label: t("Tags", "Tags"),
            type: "array",
            fields: [
              {
                name: "value",
                label: t("Tag", "Tag"),
                type: "text",
              },
            ],
          },
        ],
      },
      {
        label: t("Media", "Media"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "coverImage",
                label: t("Ảnh bìa", "Cover image"),
                type: "relationship",
                relationTo: "media",
              },
              {
                name: "videoURL",
                label: t("Video URL", "Video URL"),
                type: "text",
              },
            ],
          },
        ],
      },
      {
        label: t("Nguồn gửi", "Submission"),
        fields: [
          {
            type: "row",
            fields: [
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
            type: "row",
            fields: [
              {
                name: "pinned",
                label: t("Ghim", "Pinned"),
                type: "checkbox",
                defaultValue: false,
                index: true,
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
      {
        label: t("Hệ thống", "System"),
        fields: [
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
                name: "views",
                label: t("Lượt xem", "Views"),
                type: "number",
                defaultValue: 0,
                admin: { readOnly: true },
              },
              {
                name: "commentsCount",
                label: t("Số bình luận", "Comments count"),
                type: "number",
                defaultValue: 0,
                admin: { readOnly: true },
              },
            ],
          },
        ],
      },
    ],
  },
];
