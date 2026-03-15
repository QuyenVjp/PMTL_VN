import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const downloadFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Cơ bản", "Basics"),
        fields: [
          buildPublicIdField(),
          {
            name: "title",
            label: t("Tiêu đề", "Title"),
            type: "text",
            required: true,
          },
          {
            name: "description",
            label: t("Mô tả", "Description"),
            type: "textarea",
          },
        ],
      },
      {
        label: t("Tệp", "Files"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "file",
                label: t("File upload", "Uploaded file"),
                type: "relationship",
                relationTo: "media",
              },
              {
                name: "externalURL",
                label: t("External URL", "External URL"),
                type: "text",
              },
            ],
          },
          {
            type: "row",
            fields: [
              {
                name: "fileType",
                label: t("Loại file", "File type"),
                type: "text",
              },
              {
                name: "fileSizeMB",
                label: t("Kích thước MB", "File size MB"),
                type: "number",
              },
            ],
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
                name: "category",
                label: t("Chuyên mục", "Category"),
                type: "text",
              },
              {
                name: "groupYear",
                label: t("Năm nhóm", "Group year"),
                type: "number",
              },
              {
                name: "groupLabel",
                label: t("Nhãn nhóm", "Group label"),
                type: "text",
              },
            ],
          },
          {
            name: "notes",
            label: t("Ghi chú", "Notes"),
            type: "textarea",
          },
          {
            name: "thumbnail",
            label: t("Ảnh thumbnail", "Thumbnail"),
            type: "relationship",
            relationTo: "media",
          },
        ],
      },
      {
        label: t("Hiển thị", "Display"),
        fields: [
          {
            type: "row",
            fields: [
              {
                name: "isUpdating",
                label: t("Đang cập nhật", "Updating"),
                type: "checkbox",
                defaultValue: false,
              },
              {
                name: "isNew",
                label: t("Mới", "New"),
                type: "checkbox",
                defaultValue: false,
              },
              {
                name: "sortOrder",
                label: t("Thứ tự", "Sort order"),
                type: "number",
                defaultValue: 0,
              },
            ],
          },
        ],
      },
    ],
  },
];
