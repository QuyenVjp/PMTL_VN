import type { AccessArgs } from "./types";

export function ownedByUserField(fieldName: string) {
  return ({ req }: AccessArgs) => {
    if (!req.user?.id) {
      return false;
    }

    return {
      [fieldName]: {
        equals: req.user.id,
      },
    };
  };
}
