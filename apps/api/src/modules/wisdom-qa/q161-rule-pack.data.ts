export interface Q161RecitationCap {
  key: string;
  scope: "single_day_total" | "cross_day_total";
  maxCount: number;
  appliesTo: string;
}

export interface Q161CrossDayCap {
  key: string;
  window: string;
  maxCount: number;
}

export interface Q161AudienceCap {
  audience: string;
  maxCount: number;
}

export interface Q161LittleHouseCap {
  dayType: string;
  capType: "total_all_types" | "per_type" | "per_target_type";
  maxCount: number;
}

export interface Q161RulePack {
  sourceCode: "q161";
  reviewStatus: "human_review_required";
  recitationCaps: Q161RecitationCap[];
  crossDayCapRules: Q161CrossDayCap[];
  audienceCapRules: Q161AudienceCap[];
  littleHouseCapRules: Q161LittleHouseCap[];
}

export const Q161_RULE_PACK: Q161RulePack = {
  sourceCode: "q161",
  reviewStatus: "human_review_required",
  recitationCaps: [
    {
      key: "lphv_major_holiday_standard",
      scope: "single_day_total",
      maxCount: 27,
      appliesTo: "Tết Dương lịch, Tết Nguyên Tiêu và nhóm ngày lễ lớn chuẩn",
    },
    {
      key: "lphv_buddha_bodhisattva_standard",
      scope: "single_day_total",
      maxCount: 49,
      appliesTo: "Nhóm ngày vía Phật và Bồ Tát chuẩn",
    },
    {
      key: "lphv_dia_tang_special",
      scope: "single_day_total",
      maxCount: 79,
      appliesTo: "Khánh đản Địa Tạng Vương Bồ Tát (30/7 âm lịch)",
    },
    {
      key: "lphv_trung_cuu_special",
      scope: "single_day_total",
      maxCount: 63,
      appliesTo: "Tết Trùng Cửu (9/9 âm lịch)",
    },
    {
      key: "lphv_trung_nguyen_special",
      scope: "single_day_total",
      maxCount: 21,
      appliesTo: "Rằm tháng 7 (Lễ Trung Nguyên)",
    },
    {
      key: "lphv_regular_mung_1_ram",
      scope: "single_day_total",
      maxCount: 21,
      appliesTo: "Mùng 1 và Rằm bình thường",
    },
  ],
  crossDayCapRules: [
    {
      key: "lphv_tet_window_total",
      window: "30 Tết + Mùng 1 Tết (hoặc 29 Tết + Mùng 1 nếu không có 30)",
      maxCount: 87,
    },
  ],
  audienceCapRules: [
    { audience: "pregnant_or_postpartum", maxCount: 7 },
    { audience: "children_under_12", maxCount: 7 },
    { audience: "children_12_to_under_18_tet_window", maxCount: 49 },
    { audience: "adults_18_plus_tet_window", maxCount: 87 },
  ],
  littleHouseCapRules: [
    { dayType: "buddha_days_except_dia_tang", capType: "total_all_types", maxCount: 49 },
    { dayType: "buddha_days_except_dia_tang_special_case", capType: "total_all_types", maxCount: 69 },
    { dayType: "dia_tang_birthday", capType: "per_target_type", maxCount: 78 },
    { dayType: "new_year_day_1", capType: "total_all_types", maxCount: 69 },
    { dayType: "yuanxiao", capType: "total_all_types", maxCount: 49 },
    { dayType: "yuanxiao_special_case", capType: "total_all_types", maxCount: 69 },
    { dayType: "trung_thu_or_doan_ngo", capType: "total_all_types", maxCount: 49 },
    { dayType: "thanh_minh_or_trung_nguyen_or_dong_chi", capType: "per_type", maxCount: 49 },
    { dayType: "trung_cuu", capType: "per_type", maxCount: 21 },
    { dayType: "other_special_q161_days", capType: "per_type", maxCount: 21 },
  ],
};

export function mapQ161ForCalendar() {
  return {
    sourceCode: Q161_RULE_PACK.sourceCode,
    rulePackKey: "lphv_special_days_q161",
    recitationCaps: Q161_RULE_PACK.recitationCaps,
    crossDayCapRules: Q161_RULE_PACK.crossDayCapRules,
    audienceCapRules: Q161_RULE_PACK.audienceCapRules,
    littleHouseCapRules: Q161_RULE_PACK.littleHouseCapRules,
  };
}

export function mapQ161ForContent() {
  return {
    chantKey: "le_phat_dai_sam_hoi_van",
    reviewStatus: Q161_RULE_PACK.reviewStatus,
    recitationCaps: Q161_RULE_PACK.recitationCaps,
    crossDayCapRules: Q161_RULE_PACK.crossDayCapRules,
    audienceCapRules: Q161_RULE_PACK.audienceCapRules,
    littleHouseCapRules: Q161_RULE_PACK.littleHouseCapRules,
  };
}
