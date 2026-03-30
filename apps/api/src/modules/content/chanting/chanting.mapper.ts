import type {
  ChantEnvironmentRuleGroup,
  ChantEnvironmentRule,
  RuleSeverity,
  RuleProductizationMode,
} from "../../../generated/prisma/client.js";
import type {
  ChantEnvironmentRuleResponse,
  ChantEnvironmentRuleGroupResponse,
  Severity,
  ProductizationMode,
  GroupKey,
} from "../../../../packages/shared/src/schemas/content.js";

// Map DB enum to API string
function mapSeverity(dbValue: RuleSeverity): Severity {
  const map: Record<RuleSeverity, Severity> = {
    ADVISORY: "advisory",
    CAUTION: "caution",
    STRONG_GUARDRAIL: "strong_guardrail",
    QUALITY_GUIDANCE: "quality_guidance",
    REFERENCE_ONLY: "reference_only",
  };
  return map[dbValue];
}

function mapProductizationMode(dbValue: RuleProductizationMode): ProductizationMode {
  const map: Record<RuleProductizationMode, ProductizationMode> = {
    WARNING_CARD: "warning_card",
    CHECKLIST_ITEM: "checklist_item",
    SAFE_LANE_SUGGESTION: "safe_lane_suggestion",
    DRAWER_NOTE: "drawer_note",
    REFERENCE_ONLY_NOTE: "reference_only_note",
    DO_NOT_AUTOMATE: "do_not_automate",
  };
  return map[dbValue];
}

// Severity legend is static canonical content
export const SEVERITY_LEGEND = [
  {
    severity: "advisory" as const,
    label: "Khuyến cáo",
    description: "Nên thực hiện để đạt kết quả tốt hơn",
  },
  {
    severity: "caution" as const,
    label: "Lưu ý",
    description: "Cần chú ý để tránh ảnh hưởng đến việc tu tập",
  },
  {
    severity: "strong_guardrail" as const,
    label: "Quan trọng",
    description: "Quy tắc quan trọng cần tuân thủ nghiêm túc",
  },
  {
    severity: "quality_guidance" as const,
    label: "Hướng dẫn chất lượng",
    description: "Giúp nâng cao chất lượng tu tập",
  },
  {
    severity: "reference_only" as const,
    label: "Chỉ tham khảo",
    description: "Thông tin tham khảo, không tự động hóa",
  },
];

export function mapRuleToResponse(rule: ChantEnvironmentRule): ChantEnvironmentRuleResponse {
  return {
    ruleKey: rule.ruleKey,
    title: rule.title,
    canonicalWording: rule.canonicalWording,
    severity: mapSeverity(rule.severity),
    productizationMode: mapProductizationMode(rule.productizationMode),
    safeLaneRefs: rule.safeLaneRefs.length > 0 ? rule.safeLaneRefs : undefined,
    avoidItems: rule.avoidItems.length > 0 ? rule.avoidItems : undefined,
    shortReason: rule.shortReason,
    sourceReference: rule.sourceReference,
    versionNote: rule.versionNote,
    referenceOnly: rule.referenceOnly,
  };
}

export function mapGroupToResponse(
  group: ChantEnvironmentRuleGroup & { rules: ChantEnvironmentRule[] },
): ChantEnvironmentRuleGroupResponse {
  return {
    groupKey: group.groupKey as GroupKey,
    title: group.title,
    summary: group.summary,
    severityLegend: SEVERITY_LEGEND,
    rules: group.rules.map(mapRuleToResponse),
    lastReviewedAt: group.lastReviewedAt.toISOString(),
    versionNote: group.versionNote,
  };
}
