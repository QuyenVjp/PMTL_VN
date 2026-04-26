import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type {
  FieldPath,
  FieldValues,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

import {
  extractValidationFieldErrors,
  focusFirstInvalidField,
  formErrorMessage,
  type FieldLabels,
} from "@/lib/form-validation";

type AdminFormOptions<TValues extends FieldValues> = Omit<UseFormProps<TValues>, "resolver">;

export function useAdminZodForm<TValues extends FieldValues>(
  schema: z.ZodType<TValues, TValues>,
  options: AdminFormOptions<TValues> = {},
): UseFormReturn<TValues> {
  return useForm<TValues>({
    ...options,
    resolver: zodResolver(schema),
  });
}

export function applyApiFieldErrors<TValues extends FieldValues>(
  form: Pick<UseFormReturn<TValues>, "setError">,
  error: unknown,
): boolean {
  const fieldErrors = extractValidationFieldErrors(error);
  const entries = Object.entries(fieldErrors).filter(([, message]) => message.length > 0);
  if (entries.length === 0) {
    form.setError("root.server" as FieldPath<TValues>, {
      type: "server",
      message: adminFormErrorMessage(error),
    });
    return false;
  }

  for (const [index, [field, message]] of entries.entries()) {
    form.setError(
      field as FieldPath<TValues>,
      { type: "server", message },
      { shouldFocus: index === 0 },
    );
  }

  window.setTimeout(() => focusFirstInvalidField(fieldErrors), 0);
  return true;
}

export function adminFormErrorMessage(error: unknown, labels: FieldLabels = {}): string {
  return formErrorMessage(error, labels);
}
