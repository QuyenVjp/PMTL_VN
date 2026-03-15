import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSeoGroupField } from "@/fields/seo-fields";
import { buildSlugField } from "@/fields/slug-field";

const eventTypeOptions = [
  { label: t("Pháp hội", "Ceremony"), value: "ceremony" },
  { label: t("Khóa tu", "Retreat"), value: "retreat" },
  { label: t("Pháp đàm", "Talk"), value: "talk" },
  { label: t("Phát trực tiếp", "Livestream"), value: "livestream" },
];

const eventStatusOptions = [
  { label: t("Sắp diễn ra", "Upcoming"), value: "upcoming" },
  { label: t("Đang diễn ra", "Live"), value: "live" },
  { label: t("Đã kết thúc", "Past"), value: "past" },
];

export const eventFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Cơ bản", "Basics"),
        fields: [
          buildPublicIdField(),
          {
            name: "title",
            label: t("Tên sự kiện", "Title"),
            type: "text",
            required: true,
          },
          buildSlugField(),
          {
            name: "description",
            label: t("Mô tả ngắn", "Description"),
            type: "textarea",
            required: true,
          },
          {
            name: "content",
            label: t("Nội dung chi tiết", "Content"),
            type: "richText",
          },
          {
            type: "row",
            fields: [
              {
                name: "date",
                label: t("Ngày diễn ra", "Date"),
                type: "date",
                required: true,
              },
              {
                name: "timeString",
                label: t("Khung giờ", "Time"),
                type: "text",
              },
            ],
          },
          {
            type: "row",
            fields: [
              {
                name: "location",
                label: t("Địa điểm", "Location"),
                type: "text",
              },
              {
                name: "type",
                label: t("Loại sự kiện", "Event type"),
                type: "select",
                options: eventTypeOptions,
                defaultValue: "talk",
                required: true,
              },
            ],
          },
        ],
      },
      {
        label: t("Liên kết", "Links"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "speaker",
                label: t("Diễn giả", "Speaker"),
                type: "text",
              },
              {
                name: "language",
                label: t("Ngôn ngữ", "Language"),
                type: "text",
              },
            ],
          },
          {
            type: "row",
            fields: [
              {
                name: "link",
                label: t("Link ngoài", "External link"),
                type: "text",
              },
              {
                name: "youtubeId",
                label: t("YouTube ID", "YouTube ID"),
                type: "text",
              },
              {
                name: "embedURL",
                label: t("Embed URL", "Embed URL"),
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
                name: "gallery",
                label: t("Bộ ảnh", "Gallery"),
                type: "relationship",
                relationTo: "media",
                hasMany: true,
              },
            ],
          },
          {
            name: "files",
            label: t("Tệp đính kèm", "Files"),
            type: "relationship",
            relationTo: "media",
            hasMany: true,
          },
        ],
      },
      {
        label: t("SEO", "SEO"),
        fields: [buildSeoGroupField()],
      },
      {
        label: t("Hệ thống", "System"),
        fields: [
          {
            name: "eventStatus",
            label: t("Trạng thái sự kiện", "Event status"),
            type: "select",
            options: eventStatusOptions,
            defaultValue: "upcoming",
            required: true,
            admin: {
              readOnly: true,
            },
          },
        ],
      },
    ],
  },
];
