import type { Field } from "payload";

import { t } from "@/admin/i18n";
import { buildPublicIdField } from "@/fields/public-id-field";

export const pushSubscriptionFields: Field[] = [
  buildPublicIdField(),
  {
    name: "user",
    label: t("Người dùng", "User"),
    type: "relationship",
    relationTo: "users",
  },
  {
    name: "endpoint",
    label: t("Endpoint", "Endpoint"),
    type: "text",
    required: true,
  },
  {
    name: "keys",
    label: t("Khóa mã hóa", "Keys"),
    type: "group",
    fields: [
      {
        name: "p256dh",
        label: t("p256dh", "p256dh"),
        type: "text",
      },
      {
        name: "auth",
        label: t("auth", "auth"),
        type: "text",
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "timezone",
        label: t("Múi giờ", "Timezone"),
        type: "text",
      },
      {
        name: "isActive",
        label: t("Đang hoạt động", "Active"),
        type: "checkbox",
        defaultValue: true,
      },
      {
        name: "failedCount",
        label: t("Số lần lỗi", "Failed count"),
        type: "number",
        defaultValue: 0,
        admin: { readOnly: true },
      },
    ],
  },
  {
    name: "notificationPrefs",
    label: t("Tùy chọn thông báo", "Notification preferences"),
    type: "group",
    fields: [
      {
        name: "posts",
        label: t("Bài viết", "Posts"),
        type: "checkbox",
        defaultValue: true,
      },
      {
        name: "events",
        label: t("Sự kiện", "Events"),
        type: "checkbox",
        defaultValue: true,
      },
      {
        name: "community",
        label: t("Cộng đồng", "Community"),
        type: "checkbox",
        defaultValue: false,
      },
    ],
  },
  {
    name: "quietHours",
    label: t("Giờ yên lặng", "Quiet hours"),
    type: "group",
    fields: [
      {
        name: "from",
        label: t("Từ", "From"),
        type: "text",
      },
      {
        name: "to",
        label: t("Đến", "To"),
        type: "text",
      },
    ],
  },
  {
    type: "row",
    fields: [
      {
        name: "lastSentAt",
        label: t("Gửi gần nhất", "Last sent at"),
        type: "date",
        admin: { readOnly: true },
      },
      {
        name: "lastError",
        label: t("Lỗi gần nhất", "Last error"),
        type: "text",
        admin: { readOnly: true },
      },
    ],
  },
];
