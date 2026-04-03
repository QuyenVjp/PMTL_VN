import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client.js";
import { handleApiError } from "@/lib/handle-api-error.js";
import { selfCultivationKeys, type SelfCultivationGuideGroup, type SelfCultivationStatus } from "./queries.js";

export interface CreateSelfCultivationGuideInput {
  title: string;
  slug?: string;
  summary: string;
  groupKey: SelfCultivationGuideGroup;
  sourceReference: string;
  boundaryNote?: string;
  warningNotes?: string[];
  displayOrder?: number;
}

export interface UpdateSelfCultivationGuideInput extends Partial<CreateSelfCultivationGuideInput> {
  publicId: string;
}

export interface CreateSelfCultivationFaqInput {
  question: string;
  answer: string;
  sourceReference: string;
  displayOrder?: number;
}

export interface UpdateSelfCultivationFaqInput extends Partial<CreateSelfCultivationFaqInput> {
  publicId: string;
}

export interface PublishSelfCultivationInput {
  status: SelfCultivationStatus;
  changeSummary: string;
}

export function useCreateSelfCultivationGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSelfCultivationGuideInput) => adminClient.post("/admin/content/self-cultivation/guides", input),
    onSuccess: () => {
      toast.success("Đã thêm guide Kinh văn tự tu.");
      void queryClient.invalidateQueries({ queryKey: selfCultivationKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateSelfCultivationGuide() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateSelfCultivationGuideInput) => adminClient.patch(`/admin/content/self-cultivation/guides/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật guide Kinh văn tự tu.");
      void queryClient.invalidateQueries({ queryKey: selfCultivationKeys.all });
    },
    onError: handleApiError,
  });
}

export function useCreateSelfCultivationFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSelfCultivationFaqInput) => adminClient.post("/admin/content/self-cultivation/faq", input),
    onSuccess: () => {
      toast.success("Đã thêm FAQ Kinh văn tự tu.");
      void queryClient.invalidateQueries({ queryKey: selfCultivationKeys.all });
    },
    onError: handleApiError,
  });
}

export function useUpdateSelfCultivationFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ publicId, ...input }: UpdateSelfCultivationFaqInput) => adminClient.patch(`/admin/content/self-cultivation/faq/${publicId}`, input),
    onSuccess: () => {
      toast.success("Đã cập nhật FAQ Kinh văn tự tu.");
      void queryClient.invalidateQueries({ queryKey: selfCultivationKeys.all });
    },
    onError: handleApiError,
  });
}

export function usePublishSelfCultivation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PublishSelfCultivationInput) => adminClient.post("/admin/content/self-cultivation/publish", input),
    onSuccess: (_data, variables) => {
      toast.success(variables.status === "PUBLISHED" ? "Đã publish Kinh văn tự tu." : "Đã đưa Kinh văn tự tu về nháp.");
      void queryClient.invalidateQueries({ queryKey: selfCultivationKeys.all });
    },
    onError: handleApiError,
  });
}
