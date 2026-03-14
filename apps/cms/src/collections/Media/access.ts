import { isAuthenticated } from "@/access/is-authenticated";

export const mediaAccess = {
  read: () => true,
  create: isAuthenticated,
  update: isAuthenticated,
  delete: isAuthenticated,
};

