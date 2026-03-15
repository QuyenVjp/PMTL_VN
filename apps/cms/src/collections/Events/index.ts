import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { eventAccess } from "./access";
import { eventFields } from "./fields";
import { eventHooks } from "./hooks";

export const Events: CollectionConfig = {
  slug: "events",
  labels: {
    singular: t("Sự kiện", "Event"),
    plural: t("Sự kiện", "Events"),
  },
  admin: {
    group: t("Nội dung", "Nội dung"),
    useAsTitle: "title",
    defaultColumns: ["title", "location", "date", "eventStatus", "updatedAt"],
  },
  access: eventAccess,
  hooks: eventHooks,
  versions: {
    drafts: true,
  },
  fields: eventFields,
};
