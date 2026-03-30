import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { practiceHomeGuideKeys, type RuleItem } from "./queries.js";

// ── Inputs ──────────────────────────────────────────────────────────

export interface UpdatePracticeHomeGuideInput {
  vegetarianDisciplineRules?: RuleItem[];
  officeNutritionNotes?: string[];
  supplementalDietNotes?: string[];
}

// ── Mutations ───────────────────────────────────────────────────────

export function useUpdatePracticeHomeGuide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePracticeHomeGuideInput) =>
      adminClient.patch("/admin/content/practice-support/vietnam-home-practice-guide", input),
    onSuccess: () => {
      toast.success("Đã cập nhật hướng dẫn tự tu tại gia.");
      void qc.invalidateQueries({ queryKey: practiceHomeGuideKeys.all });
    },
    onError: handleApiError,
  });
}
