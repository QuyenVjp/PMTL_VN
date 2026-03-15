import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";

import { sutraGlossaryAccess } from "./access";
import { sutraGlossaryFields } from "./fields";
import { sutraGlossaryHooks } from "./hooks";

export const SutraGlossary: CollectionConfig = {
  slug: "sutraGlossary",
  labels: {
    singular: t("Thuật ngữ kinh", "Sutra glossary item"),
    plural: t("Thuật ngữ kinh", "Sutra glossary"),
  },
  admin: {
    group: t("Tu học", "Tu học"),
    useAsTitle: "term",
    defaultColumns: ["term", "sutra", "volume", "chapter", "sortOrder"],
  },
  access: sutraGlossaryAccess,
  hooks: sutraGlossaryHooks,
  fields: sutraGlossaryFields,
};
