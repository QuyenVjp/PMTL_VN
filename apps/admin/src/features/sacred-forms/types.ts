export type SacredFormType =
  | "REFUGE_FORM"
  | "VOW_FORM"
  | "MERIT_TRANSFER_FORM"
  | "RECITATION_CERTIFICATE"
  | "DHARMA_STUDY_FORM";

export type ApplicantStatus = "PENDING" | "UNDER_REVIEW" | "PROBATION" | "APPROVED" | "REJECTED" | "REVOKED";

export interface TemplateListItem {
  id: string;
  formType: SacredFormType;
  titleVi: string;
  titleZh: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApplicantListItem {
  id: string;
  status: ApplicantStatus;
  probationEndsAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  template: { id: string; titleVi: string; formType: string } | null;
  user: { id: string; name: string } | null;
  createdAt: string;
}

export const FORM_TYPE_LABELS: Record<SacredFormType, string> = {
  REFUGE_FORM: "Đơn quy y",
  VOW_FORM: "Đơn phát nguyện",
  MERIT_TRANSFER_FORM: "Đơn hồi hướng công đức",
  RECITATION_CERTIFICATE: "Chứng nhận tụng kinh",
  DHARMA_STUDY_FORM: "Đơn học pháp",
};

export const APPLICANT_STATUS_LABELS: Record<ApplicantStatus, string> = {
  PENDING: "Chờ xét duyệt",
  UNDER_REVIEW: "Đang xét duyệt",
  PROBATION: "Thử thách",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  REVOKED: "Thu hồi",
};

export const APPLICANT_STATUS_VARIANT: Record<ApplicantStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  UNDER_REVIEW: "default",
  PROBATION: "secondary",
  APPROVED: "secondary",
  REJECTED: "destructive",
  REVOKED: "destructive",
};
