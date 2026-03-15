import type { CollectionConfig } from "payload";

import { t } from "@/admin/i18n";
import { buildPasswordResetEmail } from "@/services/email-template.service";

import { buildResetPasswordURL } from "./service";

import { userAccess } from "./access";
import { userFields } from "./fields";
import { userHooks } from "./hooks";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: t("Người dùng", "User"),
    plural: t("Người dùng", "Users"),
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 24 * 7,
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token ?? "";
        const resetURL = buildResetPasswordURL(token);

        return buildPasswordResetEmail(resetURL);
      },
      generateEmailSubject: () => "PMTL_VN | Dat lai mat khau",
    },
  },
  admin: {
    group: t("Hệ thống", "Hệ thống"),
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "email", "role", "isBlocked", "updatedAt"],
  },
  access: userAccess,
  hooks: userHooks,
  fields: userFields,
};
