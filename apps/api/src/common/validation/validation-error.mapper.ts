import type { ZodError, ZodIssue } from "zod";

export interface ValidationErrorItem {
  path: string;
  message: string;
  code: string;
}

export function mapZodErrorToValidationErrors(error: ZodError): ValidationErrorItem[] {
  return error.issues.map((issue: ZodIssue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
}

export function formatValidationErrors(errors: ValidationErrorItem[]): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const error of errors) {
    const key = error.path || "_root";
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(error.message);
  }

  return result;
}
