export type LhStatus = "DRAFT" | "SIGNED" | "CHANTED" | "BURNED" | "CANCELLED";
export type FraudSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface LhListItem {
  id: string;
  beneficiaryName: string;
  status: LhStatus;
  draftedAt: string | null;
  signedAt: string | null;
  chantedAt: string | null;
  burnedAt: string | null;
  user: { id: string; name: string } | null;
  createdAt: string;
}

export interface LhFraudItem {
  id: string;
  reason: string;
  severity: FraudSeverity;
  flaggedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  record: { id: string; beneficiary: string } | null;
}

export const LH_STATUS_LABELS: Record<LhStatus, string> = {
  DRAFT: "Bản nháp",
  SIGNED: "Đã ký",
  CHANTED: "Đã tụng",
  BURNED: "Đã hóa",
  CANCELLED: "Đã hủy",
};

export const LH_STATUS_VARIANT: Record<LhStatus, "default" | "secondary" | "destructive" | "outline"> = {
  DRAFT: "outline",
  SIGNED: "default",
  CHANTED: "default",
  BURNED: "secondary",
  CANCELLED: "destructive",
};

export const FRAUD_SEVERITY_LABELS: Record<FraudSeverity, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Nghiêm trọng",
};

export const FRAUD_SEVERITY_VARIANT: Record<FraudSeverity, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "destructive",
  CRITICAL: "destructive",
};

// Valid next states per current state
export const NEXT_STATES: Record<LhStatus, LhStatus[]> = {
  DRAFT: ["SIGNED", "CANCELLED"],
  SIGNED: ["CHANTED", "CANCELLED"],
  CHANTED: ["BURNED", "CANCELLED"],
  BURNED: [],
  CANCELLED: [],
};
