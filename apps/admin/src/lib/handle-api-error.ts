import { toast } from "sonner";
import { HttpError } from "@/lib/api/http-error";

/**
 * Unified API error handler for React Query mutations.
 * Maps HttpError status codes to actionable Vietnamese messages,
 * then fires a sonner toast.error().
 *
 * Usage: pass as the `onError` callback in useMutation hooks.
 */
export function handleApiError(error: unknown): void {
  if (error instanceof HttpError) {
    // 401 is handled by the auth guard (redirect to sign-in) — no toast needed.
    if (error.isUnauthorized) return;

    // Surface the server's own message — already in Vietnamese from the API.
    toast.error(error.message);
    return;
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    toast.error("Yêu cầu quá hạn. Kiểm tra kết nối và thử lại.");
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error("Lỗi không xác định. Vui lòng thử lại.");
}
