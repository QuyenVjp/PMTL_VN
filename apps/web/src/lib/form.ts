import { zodResolver as _zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Wrapper around zodResolver bridging the Zod 4.3.x / @hookform/resolvers 5.x
 * type incompatibility (_zod.version.minor mismatch).
 * Remove when @hookform/resolvers ships a build against zod >=4.3.
 */
export function zodResolver<T extends FieldValues>(
  schema: ZodType<T>,
): Resolver<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _zodResolver(schema as any) as any;
}
