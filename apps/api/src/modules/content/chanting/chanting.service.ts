import { Injectable, NotFoundException } from "@nestjs/common";
import { CacheService } from "../../../common/cache/cache.service.js";
import { Prisma, RuleProductizationMode, RuleSeverity } from "../../../generated/prisma/client.js";
import { ChantingRepository } from "./chanting.repository.js";
import { mapGroupToResponse } from "./chanting.mapper.js";
import { mapQ161ForContent } from "../../wisdom-qa/q161-rule-pack.data.js";
import type {
  AdminUpdateEnvironmentRuleInput,
  ChantEnvironmentRulesPageResponse,
  ChantEnvironmentRuleGroupResponse,
  GroupKey,
  ProductizationMode,
  Q161ContentRulePackResponse,
  Severity,
} from "../../../../packages/shared/src/schemas/content.js";

@Injectable()
export class ChantingService {
  constructor(
    private readonly repository: ChantingRepository,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * GET /content/chanting/environment-rules
   * Returns full page aggregate for /niem-kinh/luu-y-moi-truong-va-thoi-gian
   */
  async getEnvironmentRulesPage(): Promise<ChantEnvironmentRulesPageResponse> {
    return this.cacheService.getOrSet("content:chanting:environment-rules-page:v1", 60 * 15, async () => {
      const groups = await this.repository.findAllGroups();
      const ruleCounts = await this.repository.countRulesByGroup();

      // Map groups to response
      const mappedGroups = groups.map(mapGroupToResponse);

      // Build group cards
      const groupCards = groups.map((g) => ({
        groupKey: g.groupKey as GroupKey,
        title: g.title,
        summary: g.summary,
        ruleCount: ruleCounts[g.groupKey] || 0,
      }));

      // Find latest update across all groups
      const latestUpdate = groups.reduce(
        (latest, g) => (g.updatedAt > latest ? g.updatedAt : latest),
        new Date(0),
      );

      // Extract special location highlights from special-location-cautions group
      const specialLocationGroup = groups.find((g) => g.groupKey === "special-location-cautions");
      const specialLocationHighlights = specialLocationGroup
        ? specialLocationGroup.rules.slice(0, 3).map((r) => ({
            topic: r.title,
            summary: r.canonicalWording.substring(0, 150) + (r.canonicalWording.length > 150 ? "..." : ""),
          }))
        : [];

      // Extract reference-only cautions from non-interpretive-cautions group
      const nonInterpretiveGroup = groups.find((g) => g.groupKey === "non-interpretive-cautions");
      const referenceOnlyCautions = nonInterpretiveGroup
        ? nonInterpretiveGroup.rules
            .filter((r) => r.referenceOnly)
            .slice(0, 4)
            .map((r) => ({
              topic: r.title,
              summary: r.canonicalWording.substring(0, 100) + (r.canonicalWording.length > 100 ? "..." : ""),
              ctaLabel: "Xem chi tiết",
              ctaHref: `/niem-kinh/luu-y-moi-truong-va-thoi-gian#${r.ruleKey}`,
            }))
        : [];

      // Build quick checklist from rules marked as checklist_item
      const checklistItems = groups
        .flatMap((g) => g.rules)
        .filter((r) => r.productizationMode === "CHECKLIST_ITEM");

      const beforeYouStart = checklistItems
        .filter((r) => r.ruleKey.includes("before") || r.sortOrder < 3)
        .slice(0, 5)
        .map((r) => r.title);

      const whenToPause = checklistItems
        .filter((r) => r.ruleKey.includes("pause") || r.ruleKey.includes("stop"))
        .slice(0, 4)
        .map((r) => r.title);

      const safeLaneSuggestions = groups
        .flatMap((g) => g.rules)
        .filter((r) => r.productizationMode === "SAFE_LANE_SUGGESTION")
        .slice(0, 4)
        .map((r) => r.title);

      return {
        intro: {
          title: "Lưu ý môi trường và thời gian niệm kinh",
          summary:
            "Hướng dẫn về thời gian, địa điểm, và các điều kiện phù hợp để thực hành niệm kinh đạt hiệu quả cao nhất.",
          updatedAt: latestUpdate.toISOString(),
        },
        groupCards,
        groups: mappedGroups,
        quickChecklist: {
          beforeYouStart: beforeYouStart.length > 0 ? beforeYouStart : ["Chọn nơi yên tĩnh", "Vệ sinh thân thể sạch sẽ"],
          whenToPause:
            whenToPause.length > 0
              ? whenToPause
              : ["Khi quá mệt mỏi", "Khi có việc gấp cần giải quyết"],
          safeLaneSuggestions:
            safeLaneSuggestions.length > 0
              ? safeLaneSuggestions
              : ["Niệm thầm khi ở nơi công cộng", "Giảm số biến khi sức khỏe không tốt"],
        },
        specialLocationHighlights,
        referenceOnlyCautions,
        relatedGuideRefs: [
          {
            title: "Kinh Bài Tập Hằng Ngày",
            href: "/kinh-bai-tap",
            surface: "daily_practice",
          },
          {
            title: "Ngôi Nhà Nhỏ",
            href: "/ngoi-nha-nho",
            surface: "little_house",
          },
          {
            title: "Kinh Văn Tự Tu",
            href: "/kinh-van-tu-tu",
            surface: "self_cultivation",
          },
        ],
      };
    });
  }

  async getQ161RulePack(): Promise<Q161ContentRulePackResponse> {
    return this.cacheService.getOrSet("content:chanting:q161-rule-pack:v1", 60 * 30, async () => {
      const payload = mapQ161ForContent() as Q161ContentRulePackResponse;
      return await Promise.resolve(payload);
    });
  }

  /**
   * GET /content/chanting/environment-rules/:groupKey
   * Returns a single rule group with full rules
   */
  async getEnvironmentRuleGroup(groupKey: string): Promise<ChantEnvironmentRuleGroupResponse> {
    return this.cacheService.getOrSet(`content:chanting:environment-group:${groupKey}:v1`, 60 * 15, async () => {
      const group = await this.repository.findGroupByKey(groupKey);

      if (!group) {
        throw new NotFoundException(`Nhóm quy tắc '${groupKey}' không tồn tại`);
      }
      return mapGroupToResponse(group);
    });
  }

  async adminUpdateEnvironmentRule(
    ruleKey: string,
    input: AdminUpdateEnvironmentRuleInput,
  ): Promise<ChantEnvironmentRuleGroupResponse> {
    const existingRule = await this.repository.findRuleByKey(ruleKey);
    if (!existingRule) {
      throw new NotFoundException(`Quy tắc '${ruleKey}' không tồn tại`);
    }

    const data: Prisma.ChantEnvironmentRuleUpdateInput = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.canonicalWording !== undefined) data.canonicalWording = input.canonicalWording;
    if (input.severity !== undefined) data.severity = mapSeverityToDb(input.severity);
    if (input.productizationMode !== undefined) {
      data.productizationMode = mapProductizationModeToDb(input.productizationMode);
    }
    if (input.safeLaneRefs !== undefined) data.safeLaneRefs = input.safeLaneRefs.map((item) => item.trim());
    if (input.avoidItems !== undefined) data.avoidItems = input.avoidItems.map((item) => item.trim());
    if (input.shortReason !== undefined) data.shortReason = input.shortReason;
    if (input.sourceReference !== undefined) data.sourceReference = input.sourceReference;
    if (input.versionNote !== undefined) data.versionNote = input.versionNote;
    if (input.referenceOnly !== undefined) data.referenceOnly = input.referenceOnly;
    if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;

    const updated = await this.repository.updateRuleByKey(ruleKey, data);

    await this.cacheService.del("content:chanting:environment-rules-page:v1");
    await this.cacheService.del(`content:chanting:environment-group:${updated.group.groupKey}:v1`);

    const refreshedGroup = await this.repository.findGroupByKey(updated.group.groupKey);
    if (!refreshedGroup) {
      throw new NotFoundException(`Nhóm quy tắc '${updated.group.groupKey}' không tồn tại`);
    }

    return mapGroupToResponse(refreshedGroup);
  }
}

function mapSeverityToDb(value: Severity): RuleSeverity {
  const map: Record<Severity, RuleSeverity> = {
    advisory: RuleSeverity.ADVISORY,
    caution: RuleSeverity.CAUTION,
    strong_guardrail: RuleSeverity.STRONG_GUARDRAIL,
    quality_guidance: RuleSeverity.QUALITY_GUIDANCE,
    reference_only: RuleSeverity.REFERENCE_ONLY,
  };
  return map[value];
}

function mapProductizationModeToDb(value: ProductizationMode): RuleProductizationMode {
  const map: Record<ProductizationMode, RuleProductizationMode> = {
    warning_card: RuleProductizationMode.WARNING_CARD,
    checklist_item: RuleProductizationMode.CHECKLIST_ITEM,
    safe_lane_suggestion: RuleProductizationMode.SAFE_LANE_SUGGESTION,
    drawer_note: RuleProductizationMode.DRAWER_NOTE,
    reference_only_note: RuleProductizationMode.REFERENCE_ONLY_NOTE,
    do_not_automate: RuleProductizationMode.DO_NOT_AUTOMATE,
  };
  return map[value];
}
