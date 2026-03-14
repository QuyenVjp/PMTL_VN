import type { CollectionConfig } from "payload";

import { eventAccess } from "./access";
import { eventFields } from "./fields";
import { eventHooks } from "./hooks";

export const Events: CollectionConfig = {
  slug: "events",
  labels: {
    singular: "Event",
    plural: "Events",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "startAt", "status"],
  },
  access: eventAccess,
  hooks: eventHooks,
  fields: eventFields,
};
