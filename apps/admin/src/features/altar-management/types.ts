export type AltarItemType =
  | "INCENSE_BURNER"
  | "CANDLE_HOLDER"
  | "FLOWER_VASE"
  | "WATER_CUP"
  | "FRUIT_PLATE"
  | "STATUE"
  | "LAMP"
  | "BELL"
  | "OTHER";

export type AltarCondition = "GOOD" | "NEEDS_ATTENTION" | "REQUIRES_REPLACEMENT" | "RETIRED";
export type AltarProtocolType =
  | "DAILY_CLEANING"
  | "INCENSE_INSERTION"
  | "WATER_REFRESH"
  | "FLOWER_REPLACEMENT"
  | "LAMP_CHECK"
  | "MONTHLY_DEEP_CLEAN";

export interface AltarItemListItem {
  id: string;
  name: string;
  itemType: AltarItemType;
  condition: AltarCondition;
  isActive: boolean;
  acquisitionAt: string | null;
  user: { id: string; name: string } | null;
  createdAt: string;
}

export interface ValidationLogItem {
  id: string;
  protocolType: AltarProtocolType;
  passed: boolean;
  notes: string | null;
  performedAt: string;
  user: { id: string; name: string } | null;
  item: { id: string; name: string } | null;
}

export const ALTAR_ITEM_TYPE_LABELS: Record<AltarItemType, string> = {
  INCENSE_BURNER: "Lư hương",
  CANDLE_HOLDER: "Chân nến",
  FLOWER_VASE: "Bình hoa",
  WATER_CUP: "Chén nước",
  FRUIT_PLATE: "Đĩa trái cây",
  STATUE: "Tượng Phật",
  LAMP: "Đèn dầu",
  BELL: "Chuông",
  OTHER: "Khác",
};

export const CONDITION_LABELS: Record<AltarCondition, string> = {
  GOOD: "Tốt",
  NEEDS_ATTENTION: "Cần chú ý",
  REQUIRES_REPLACEMENT: "Cần thay thế",
  RETIRED: "Đã ngưng sử dụng",
};

export const CONDITION_VARIANT: Record<AltarCondition, "default" | "secondary" | "destructive" | "outline"> = {
  GOOD: "secondary",
  NEEDS_ATTENTION: "default",
  REQUIRES_REPLACEMENT: "destructive",
  RETIRED: "outline",
};

export const PROTOCOL_LABELS: Record<AltarProtocolType, string> = {
  DAILY_CLEANING: "Lau dọn hàng ngày",
  INCENSE_INSERTION: "Cắm nhang",
  WATER_REFRESH: "Thay nước",
  FLOWER_REPLACEMENT: "Thay hoa",
  LAMP_CHECK: "Kiểm tra đèn",
  MONTHLY_DEEP_CLEAN: "Tổng vệ sinh hàng tháng",
};
