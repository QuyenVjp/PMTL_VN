import type { CollectionConfig } from "payload";

import { buildResetPasswordURL } from "./service";

import { userAccess } from "./access";
import { userFields } from "./fields";
import { userHooks } from "./hooks";

export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "User",
    plural: "Users",
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 24 * 7,
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token ?? "";
        const resetURL = buildResetPasswordURL(token);

        return `<p>Mo link nay de dat lai mat khau:</p><p><a href="${resetURL}">${resetURL}</a></p>`;
      },
      generateEmailSubject: () => "PMTL_VN password reset",
    },
  },
  admin: {
    useAsTitle: "displayName",
    defaultColumns: ["displayName", "email", "role", "status", "updatedAt"],
  },
  access: userAccess,
  hooks: userHooks,
  fields: userFields,
};
