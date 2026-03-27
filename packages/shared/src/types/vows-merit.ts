export type VowStatus = "active" | "completed" | "paused";

export type Vow = {
  id: string;
  userId: string;
  type: string;
  description?: string;
  status: VowStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
};

export type MeritLog = {
  id: string;
  vowId: string;
  userId: string;
  note?: string;
  completedAt: string;
  createdAt: string;
};
