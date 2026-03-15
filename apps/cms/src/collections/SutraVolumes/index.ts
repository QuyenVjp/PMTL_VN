import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { sutraVolumeAccess } from "./access";
import { sutraVolumeFields } from "./fields";
import { sutraVolumeHooks } from "./hooks";

export const SutraVolumes: CollectionConfig = {
  slug: "sutraVolumes",
  labels: {
    singular: t("Quyển kinh", "Sutra volume"),
    plural: t("Quyển kinh", "Sutra volumes"),
  },
  admin: {
    group: t("Tu học", "Tu học"),
    useAsTitle: "title",
    defaultColumns: ["title", "sutra", "volumeNumber", "sortOrder", "updatedAt"],
  },
  access: sutraVolumeAccess,
  hooks: sutraVolumeHooks,
  fields: sutraVolumeFields,
};
