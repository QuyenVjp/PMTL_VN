import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";
import { buildSeoGroupField } from "@/fields/seo-fields";
import { buildSlugField } from "@/fields/slug-field";

const postTypeOptions = [
  {
    label: t("Bài viết", "Article"),
    value: "article",
  },
  {
    label: t("Khai thị / ghi chép", "Transcript"),
    value: "transcript",
  },
  {
    label: t("Bài theo nguồn dẫn", "Source note"),
    value: "source-note",
  },
  {
    label: t("Tường thuật sự kiện", "Event recap"),
    value: "event-recap",
  },
];

export const postFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Nội dung", "Content"),
        fields: [
          buildPublicIdField(),
          {
            type: "row",
            fields: [
              {
                name: "postType",
                label: t("Loại bài", "Post type"),
                type: "select",
                defaultValue: "article",
                options: postTypeOptions,
                required: true,
              },
              {
                name: "sourceRef",
                label: t("Mã nguồn", "Source reference"),
                type: "text",
                index: true,
                admin: {
                  description: t(
                    "Giữ để tương thích với dữ liệu cũ và bài có nguồn dẫn cụ thể.",
                    "Retained for compatibility with legacy content and referenced source material.",
                  ),
                },
              },
            ],
          },
          {
            name: "title",
            label: t("Tiêu đề", "Title"),
            type: "text",
            required: true,
          },
          buildSlugField(),
          {
            name: "content",
            label: t("Nội dung", "Content"),
            type: "richText",
            required: true,
          },
          {
            name: "excerptOverride",
            label: t("Tóm tắt nhập tay", "Excerpt override"),
            type: "textarea",
            admin: {
              description: t("Để trống nếu muốn hệ thống tự sinh tóm tắt.", "Leave empty to let the system generate the excerpt."),
            },
          },
          {
            name: "excerptComputed",
            label: t("Tóm tắt tự sinh", "Generated excerpt"),
            type: "textarea",
            admin: {
              readOnly: true,
            },
          },
        ],
      },
      {
        label: t("Phân loại", "Classification"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "primaryCategory",
                label: t("Chủ đề chính", "Primary category"),
                type: "relationship",
                relationTo: "categories",
              },
              {
                name: "categories",
                label: t("Chủ đề phụ", "Categories"),
                type: "relationship",
                relationTo: "categories",
                hasMany: true,
              },
            ],
          },
          {
            name: "tags",
            label: t("Tags", "Tags"),
            type: "relationship",
            relationTo: "tags",
            hasMany: true,
          },
          {
            name: "postFlags",
            label: t("Cờ hiển thị", "Display flags"),
            type: "group",
            fields: [
              {
                type: "row",
                fields: [
                  {
                    name: "featured",
                    label: t("Nổi bật", "Featured"),
                    type: "checkbox",
                    defaultValue: false,
                  },
                  {
                    name: "allowComments",
                    label: t("Cho phép bình luận", "Allow comments"),
                    type: "checkbox",
                    defaultValue: true,
                  },
                ],
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
                name: "coverMedia",
                label: t("Ảnh bìa", "Cover media"),
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
        ],
      },
      {
        label: t("Nguồn", "Source"),
        fields: [
          {
            name: "source",
            label: t("Nguồn gốc", "Source"),
            type: "group",
            fields: [
              {
                type: "row",
                fields: [
                  {
                    name: "sourceName",
                    label: t("Tên nguồn", "Source name"),
                    type: "text",
                  },
                  {
                    name: "sourceTitle",
                    label: t("Tiêu đề nguồn", "Source title"),
                    type: "text",
                  },
                ],
              },
              {
                name: "sourceUrl",
                label: t("Đường dẫn nguồn", "Source URL"),
                type: "text",
              },
            ],
          },
        ],
      },
      {
        label: t("Liên kết", "Connections"),
        fields: [
          {
            name: "series",
            label: t("Chuỗi nội dung", "Series"),
            type: "group",
            fields: [
              {
                type: "row",
                fields: [
                  {
                    name: "seriesKey",
                    label: t("Mã series", "Series key"),
                    type: "text",
                  },
                  {
                    name: "seriesNumber",
                    label: t("Thứ tự", "Series order"),
                    type: "number",
                  },
                ],
              },
            ],
          },
          {
            name: "eventContext",
            label: t("Ngữ cảnh sự kiện", "Event context"),
            type: "group",
            fields: [
              {
                type: "row",
                fields: [
                  {
                    name: "eventDate",
                    label: t("Ngày sự kiện", "Event date"),
                    type: "date",
                  },
                  {
                    name: "location",
                    label: t("Địa điểm", "Location"),
                    type: "text",
                  },
                ],
              },
              {
                name: "relatedEvent",
                label: t("Sự kiện liên quan", "Related event"),
                type: "relationship",
                relationTo: "events",
              },
            ],
          },
          {
            name: "relatedPosts",
            label: t("Bài liên quan", "Related posts"),
            type: "relationship",
            relationTo: "posts",
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
            type: "collapsible",
            label: t("Search và thống kê", "Search and metrics"),
            admin: {
              initCollapsed: true,
            },
            fields: [
              {
                name: "contentPlainText",
                label: t("Nội dung plain text", "Plain text content"),
                type: "textarea",
                admin: {
                  readOnly: true,
                },
              },
              {
                name: "normalizedSearchText",
                label: t("Text tìm kiếm chuẩn hóa", "Normalized search text"),
                type: "textarea",
                admin: {
                  readOnly: true,
                },
              },
              {
                type: "row",
                fields: [
                  {
                    name: "commentCount",
                    label: t("Số bình luận", "Comment count"),
                    type: "number",
                    defaultValue: 0,
                    admin: {
                      readOnly: true,
                    },
                  },
                  {
                    name: "views",
                    label: t("Lượt xem", "Views"),
                    type: "number",
                    defaultValue: 0,
                    admin: {
                      readOnly: true,
                    },
                  },
                  {
                    name: "uniqueViews",
                    label: t("Lượt xem duy nhất", "Unique views"),
                    type: "number",
                    defaultValue: 0,
                    admin: {
                      readOnly: true,
                    },
                  },
                  {
                    name: "likes",
                    label: t("Lượt thích", "Likes"),
                    type: "number",
                    defaultValue: 0,
                    admin: {
                      readOnly: true,
                    },
                  },
                ],
              },
              {
                name: "publishedAt",
                label: t("Ngày xuất bản", "Published at"),
                type: "date",
                admin: {
                  readOnly: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
