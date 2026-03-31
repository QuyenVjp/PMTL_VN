import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { contactInfoKeys } from "./queries.js";

export interface UpdateContactInfoInput {
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: Record<string, string>;
}

export function useUpdateContactInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateContactInfoInput) =>
      adminClient.patch("/admin/contact-info", input),
    onSuccess: () => {
      toast.success("Đã cập nhật thông tin liên hệ.");
      void qc.invalidateQueries({ queryKey: contactInfoKeys.all });
    },
    onError: handleApiError,
  });
}
