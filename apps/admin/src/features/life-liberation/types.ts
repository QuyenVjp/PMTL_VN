export type LifeReleaseStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type LifeReleaseRecordType = "INDIVIDUAL" | "GROUP" | "PROXY";
export type PredatorySpecies = "TURTLE" | "FISH" | "BIRD" | "INSECT" | "FROG" | "CRAB" | "OTHER";

export interface LifeReleaseListItem {
  id: string;
  recordType: LifeReleaseRecordType;
  status: LifeReleaseStatus;
  releaseDate: string;
  locationName: string | null;
  totalAnimals: number;
  user: { id: string; name: string } | null;
  createdAt: string;
}

export interface SpeciesSummaryItem {
  species: PredatorySpecies;
  totalReleased: number;
}

export const LIFE_RELEASE_STATUS_LABELS: Record<LifeReleaseStatus, string> = {
  PENDING: "Chờ thực hiện",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

export const RECORD_TYPE_LABELS: Record<LifeReleaseRecordType, string> = {
  INDIVIDUAL: "Cá nhân",
  GROUP: "Nhóm",
  PROXY: "Hộ",
};

export const SPECIES_LABELS: Record<PredatorySpecies, string> = {
  TURTLE: "Rùa",
  FISH: "Cá",
  BIRD: "Chim",
  INSECT: "Côn trùng",
  FROG: "Ếch",
  CRAB: "Cua",
  OTHER: "Khác",
};

export const STATUS_VARIANT: Record<LifeReleaseStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
};
