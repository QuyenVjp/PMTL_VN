import { HttpError } from "@/lib/api/http-error";
import { cn } from "@/lib/utils";

export type FieldErrors = Record<string, string>;

type ValidationProperty = {
  errors?: unknown;
};

type ValidationDetails = {
  properties?: Record<string, ValidationProperty>;
};

export function extractValidationFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof HttpError)) return {};
  if (error.code !== "VALIDATION_ERROR") return {};

  const details = error.details as ValidationDetails | undefined;
  const properties = details?.properties;
  if (!properties || typeof properties !== "object") return {};

  const result: FieldErrors = {};
  for (const [key, value] of Object.entries(properties)) {
    const rawErrors = value?.errors;
    if (!Array.isArray(rawErrors)) continue;
    const first = rawErrors.find((item) => typeof item === "string");
    if (typeof first === "string" && first.length > 0) {
      result[key] = first;
    }
  }
  return result;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function invalidFieldClass(hasError: boolean): string {
  return cn(hasError && "border-destructive focus-visible:ring-destructive/30");
}

