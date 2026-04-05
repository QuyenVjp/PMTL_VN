export type CharityStatus = "ACTIVE" | "SUSPENDED" | "FLAGGED" | "PENDING_REVIEW";
export type CharityType = "FOOD_BANK" | "MEDICAL" | "EDUCATION" | "DISASTER_RELIEF" | "ANIMAL_WELFARE" | "OTHER";
export type FraudSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type PurityLevel = "FULL" | "EMOTIONAL" | "PHYSICAL";
export type VowStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "RELEASED";
export type GuidanceUrgency = "ROUTINE" | "URGENT" | "CRISIS";

export interface CharityListItem {
  id: string;
  name: string;
  charityType: CharityType;
  status: CharityStatus;
  registrationNumber: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  createdAt: string;
}

export interface FraudAlertItem {
  id: string;
  severity: FraudSeverity;
  alertType: string;
  description: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolution: string | null;
  charity: { id: string; name: string } | null;
  createdAt: string;
}

export interface VowListItem {
  id: string;
  purityLevel: PurityLevel;
  status: VowStatus;
  vowDate: string;
  kissAllowed: boolean;
  hugAllowed: boolean;
  sleepArrangement: string;
  practitioner: { id: string; name: string } | null;
  createdAt: string;
}

export interface GuidanceQueueItem {
  id: string;
  category: string;
  question: string;
  urgency: GuidanceUrgency;
  status: string;
  response: string | null;
  practitioner: string | null;
  vowId: string | null;
  createdAt: string;
}

export const CHARITY_STATUS_LABELS: Record<CharityStatus, string> = {
  ACTIVE: "Hoạt động",
  SUSPENDED: "Tạm dừng",
  FLAGGED: "Đánh dấu",
  PENDING_REVIEW: "Chờ xét duyệt",
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

export const VOW_STATUS_LABELS: Record<VowStatus, string> = {
  ACTIVE: "Đang giữ",
  PAUSED: "Tạm dừng",
  COMPLETED: "Hoàn thành",
  RELEASED: "Đã giải nguyện",
};

export const GUIDANCE_URGENCY_VARIANT: Record<GuidanceUrgency, "default" | "secondary" | "destructive"> = {
  ROUTINE: "secondary",
  URGENT: "default",
  CRISIS: "destructive",
};
