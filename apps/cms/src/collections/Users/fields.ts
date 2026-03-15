import type { Field } from "payload";
import { userRoleValues } from "@pmtl/shared";

import { t } from "@/admin/i18n";
import { canManageUserRoles } from "./access";
import { buildPublicIdField } from "@/fields/public-id-field";

export const userFields: Field[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: t("Tài khoản", "Account"),
        fields: [
          buildPublicIdField(),
          {
            type: "row",
            fields: [
              {
                name: "fullName",
                label: t("Họ và tên", "Full name"),
                type: "text",
                required: true,
                admin: {
                  placeholder: t("Tên hiển thị chính thức của tài khoản", "Primary display name for the account"),
                },
              },
              {
                name: "username",
                label: t("Tên tài khoản", "Username"),
                type: "text",
                unique: true,
                admin: {
                  description: t("Dùng cho route public hoặc mention về sau nếu cần.", "Reserved for future public routes or mentions."),
                },
              },
            ],
          },
          {
            type: "row",
            fields: [
              {
                name: "phone",
                label: t("Số điện thoại", "Phone"),
                type: "text",
              },
              {
                name: "dharmaName",
                label: t("Pháp danh", "Dharma name"),
                type: "text",
              },
            ],
          },
        ],
      },
      {
        label: t("Hồ sơ", "Profile"),
        fields: [
          {
            name: "avatar",
            label: t("Ảnh đại diện", "Avatar"),
            type: "relationship",
            relationTo: "media",
          },
          {
            name: "bio",
            label: t("Giới thiệu ngắn", "Short bio"),
            type: "textarea",
            defaultValue: "",
            admin: {
              placeholder: t("Giới thiệu ngắn để hiển thị ở hồ sơ công khai hoặc nội bộ.", "Short introduction for public or internal profile display."),
            },
          },
        ],
      },
      {
        label: t("Phân quyền", "Roles"),
        fields: [
          {
            name: "role",
            label: t("Vai trò", "Role"),
            type: "select",
            defaultValue: "member",
            options: userRoleValues.map((value) => ({
              label:
                value === "super-admin"
                  ? t("Super admin", "Super admin")
                  : value === "admin"
                    ? t("Quản trị viên", "Admin")
                    : value === "editor"
                      ? t("Biên tập viên", "Editor")
                      : value === "moderator"
                        ? t("Điều phối viên", "Moderator")
                        : t("Thành viên", "Member"),
              value,
            })),
            saveToJWT: true,
            required: true,
            access: {
              create: canManageUserRoles,
              update: canManageUserRoles,
            },
          },
          {
            name: "isBlocked",
            label: t("Tạm khóa", "Blocked"),
            type: "checkbox",
            defaultValue: false,
            access: {
              create: canManageUserRoles,
              update: canManageUserRoles,
            },
          },
        ],
      },
      {
        label: t("Hệ thống", "System"),
        fields: [
          {
            name: "lastLoginAt",
            label: t("Đăng nhập gần nhất", "Last login at"),
            type: "date",
            admin: {
              readOnly: true,
            },
          },
        ],
      },
    ],
  },
];
