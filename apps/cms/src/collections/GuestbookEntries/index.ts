import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { guestbookEntryAccess } from "./access";
import { guestbookEntryFields } from "./fields";
import { guestbookEntryHooks } from "./hooks";

export const GuestbookEntries: CollectionConfig = {
  slug: "guestbookEntries",
  labels: {
    singular: t("Sổ lưu niệm", "Guestbook entry"),
    plural: t("Sổ lưu niệm", "Guestbook entries"),
  },
  admin: {
    group: t("Nội dung", "Nội dung"),
    useAsTitle: "authorName",
    defaultColumns: ["authorName", "entryType", "approvalStatus", "isAnswered", "updatedAt"],
  },
  access: guestbookEntryAccess,
  hooks: guestbookEntryHooks,
  fields: guestbookEntryFields,
};
