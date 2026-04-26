import { HttpError } from "@/lib/api/http-error";
import { cn } from "@/lib/utils";

export type FieldErrors = Record<string, string>;
export type FieldLabels = Record<string, string>;

const DEFAULT_FIELD_LABELS: FieldLabels = {
  answer: "Câu trả lời",
  body: "Nội dung",
  categoryId: "Danh mục",
  displayName: "Tên hiển thị",
  email: "Email",
  entryType: "Loại bài",
  fileType: "Loại file",
  fileUrl: "Đường dẫn file",
  location: "Địa điểm",
  originalText: "Nguyên văn gốc",
  question: "Câu hỏi",
  role: "Vai trò",
  slug: "Slug",
  sourceCode: "Mã nguồn",
  sourceReference: "Nguồn tham chiếu",
  sourceUrl: "URL nguồn",
  startAt: "Ngày bắt đầu",
  targetAudience: "Đối tượng nhận",
  title: "Tiêu đề",
  translatedText: "Bản dịch tiếng Việt",
};

type ValidationProperty = {
  errors?: unknown;
};

type ValidationIssue = {
  path?: unknown;
  message?: unknown;
};

type ValidationDetails = {
  properties?: Record<string, ValidationProperty>;
  issues?: unknown;
  fields?: unknown;
  fieldErrors?: unknown;
};

export function extractValidationFieldErrors(error: unknown): FieldErrors {
  if (!(error instanceof HttpError)) return {};

  const details = error.details as ValidationDetails | undefined;
  const result: FieldErrors = {};

  const properties = details?.properties;
  if (properties && typeof properties === "object") {
    for (const [key, value] of Object.entries(properties)) {
      const rawErrors = value?.errors;
      if (!Array.isArray(rawErrors)) continue;
      const first = rawErrors.find((item) => typeof item === "string");
      if (typeof first === "string" && first.length > 0) {
        result[key] = first;
      }
    }
  }

  const fieldErrors = details?.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object" && !Array.isArray(fieldErrors)) {
    for (const [key, value] of Object.entries(fieldErrors)) {
      if (typeof value === "string" && value.length > 0) {
        result[key] = value;
      } else if (Array.isArray(value)) {
        const first = value.find((item) => typeof item === "string");
        if (typeof first === "string" && first.length > 0) {
          result[key] = first;
        }
      }
    }
  }

  if (Array.isArray(details?.issues)) {
    for (const issue of details.issues as ValidationIssue[]) {
      const path = Array.isArray(issue?.path) ? issue.path.join(".") : issue?.path;
      if (typeof path !== "string" || path.length === 0) continue;
      if (typeof issue.message !== "string" || issue.message.length === 0) continue;
      result[path] ??= issue.message;
    }
  }

  if (Array.isArray(details?.fields)) {
    for (const field of details.fields) {
      if (typeof field === "string" && field.length > 0) {
        result[field] ??= error.message;
      }
    }
  }

  return result;
}

export function fieldLabel(field: string, labels: FieldLabels = {}): string {
  return labels[field] ?? DEFAULT_FIELD_LABELS[field] ?? field;
}

export function firstFieldErrorMessage(errors: FieldErrors, labels: FieldLabels = {}): string | undefined {
  const [field, message] = Object.entries(errors).find(([, value]) => value.length > 0) ?? [];
  if (!field || !message) return undefined;
  return `${fieldLabel(field, labels)}: ${message}`;
}

export function formErrorMessage(error: unknown, labels: FieldLabels = {}): string {
  if (error instanceof HttpError) {
    const firstFieldError = firstFieldErrorMessage(extractValidationFieldErrors(error), labels);
    if (firstFieldError) return firstFieldError;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường trong form.";
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function invalidFieldClass(hasError: boolean): string {
  return cn(hasError && "border-destructive focus-visible:ring-destructive/30 aria-invalid:ring-destructive/20");
}

export function focusFirstInvalidField(errors: FieldErrors): void {
  const firstField = Object.keys(errors).find((field) => errors[field]?.length > 0);
  if (!firstField || typeof document === "undefined") return;

  const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(firstField) : firstField.replace(/"/g, '\\"');
  const target = document.querySelector<HTMLElement>(
    `[name="${escaped}"], [data-field="${escaped}"], #${escaped}`,
  );

  target?.focus();
  target?.scrollIntoView({ block: "center", behavior: "smooth" });
}
