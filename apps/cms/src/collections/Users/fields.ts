import type { Field } from "payload";
import { userRoleValues, userStatusValues } from "@pmtl/shared";

import { canManageUserRoles } from "./access";

export const userFields: Field[] = [
  {
    name: "displayName",
    type: "text",
    required: true,
  },
  {
    name: "avatar",
    type: "relationship",
    relationTo: "media",
  },
  {
    name: "bio",
    type: "textarea",
    defaultValue: "",
  },
  {
    name: "role",
    type: "select",
    defaultValue: "member",
    options: userRoleValues.map((value) => ({
      label: value,
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
    name: "status",
    type: "select",
    defaultValue: "active",
    options: userStatusValues.map((value) => ({
      label: value,
      value,
    })),
    saveToJWT: true,
    required: true,
    access: {
      create: canManageUserRoles,
      update: canManageUserRoles,
    },
  },
];
