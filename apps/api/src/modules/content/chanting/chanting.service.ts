import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { CacheService } from "../../../common/cache/cache.service.js";
import { AuditService } from "../../../platform/audit/audit.service.js";
import { Prisma, RuleProductizationMode, RuleSeverity, type ChantingSession } from "../../../generated/prisma/client.js";
import { ChantingRepository } from "./chanting.repository.js";
import { mapGroupToResponse } from "./chanting.mapper.js";
import { mapQ161ForContent } from "../../wisdom-qa/q161-rule-pack.data.js";
import type { AuditContext } from "../../../platform/audit/audit.service.js";
import type {
  AdminUpdateEnvironmentRuleInput,
  ChantEnvironmentRulesPageResponse,
  ChantEnvironmentRuleGroupResponse,
  GroupKey,
  ProductizationMode,
  Q161ContentRulePackResponse,
  Severity,
  CreateChantingSessionInput,
  UpdateChantingSessionInput,
} from "./chanting.schemas.js";

@Injectable()
export class ChantingService {
  constructor(
    private readonly repository: ChantingRepository,
    private readonly cacheService: CacheService,
    private readonly audit: AuditService,
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
    if (input.safeLaneRefs !== undefined) data.safeLaneRefs = input.safeLaneRefs.map((item: string) => item.trim());
    if (input.avoidItems !== undefined) data.avoidItems = input.avoidItems.map((item: string) => item.trim());
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

  // ============================================================================
  // Chanting Sessions
  // ============================================================================

  /**
   * Get user's chanting sessions with pagination
   */
  async getUserChantingSessions(page: number, limit: number, userId: string) {
    const offset = (page - 1) * limit;
    
    const [sessions, total] = await Promise.all([
      this.repository.findChantingSessions({
        where: { userId },
        orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }],
        skip: offset,
        take: limit,
      }),
      this.repository.countChantingSessions({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      sessions: sessions.map(this.mapChantingSessionToResponse),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create a new chanting session
   */
  async createChantingSession(input: CreateChantingSessionInput, userId: string, auditCtx: AuditContext) {
    const session = await this.repository.createChantingSession({
      ...input,
      userId,
    });

    // Audit log the creation
    await this.audit.append(
      auditCtx,
      "content.create",
      "chanting_session",
      session.id,
      {
        sessionDate: input.sessionDate,
        durationMinutes: input.durationMinutes,
        location: input.location,
      }
    );

    return this.mapChantingSessionToResponse(session);
  }

  /**
   * Get a specific chanting session
   */
  async getChantingSession(sessionId: string, userId: string) {
    const session = await this.repository.findChantingSessionById(sessionId);
    
    if (!session) {
      throw new NotFoundException(`Phiên niệm kinh với ID ${sessionId} không tồn tại`);
    }

    // Check if session belongs to current user
    if (session.userId !== userId) {
      throw new ForbiddenException('Không có quyền truy cập phiên niệm kinh này');
    }

    return this.mapChantingSessionToResponse(session);
  }

  /**
   * Update a chanting session
   */
  async updateChantingSession(sessionId: string, input: UpdateChantingSessionInput, userId: string, auditCtx: AuditContext) {
    const session = await this.repository.findChantingSessionById(sessionId);
    
    if (!session) {
      throw new NotFoundException(`Phiên niệm kinh với ID ${sessionId} không tồn tại`);
    }

    // Check ownership
    if (session.userId !== userId) {
      throw new ForbiddenException('Không có quyền cập nhật phiên niệm kinh này');
    }

    const updatedSession = await this.repository.updateChantingSession(sessionId, input);

    // Audit log the update
    await this.audit.append(
      auditCtx,
      "content.update",
      "chanting_session",
      sessionId,
      {
        changes: input,
      }
    );

    return this.mapChantingSessionToResponse(updatedSession);
  }

  /**
   * Delete a chanting session
   */
  async deleteChantingSession(sessionId: string, userId: string, auditCtx: AuditContext): Promise<{ success: boolean }> {
    const session = await this.repository.findChantingSessionById(sessionId);
    
    if (!session) {
      throw new NotFoundException(`Phiên niệm kinh với ID ${sessionId} không tồn tại`);
    }

    // Check ownership
    if (session.userId !== userId) {
      throw new ForbiddenException('Không có quyền xóa phiên niệm kinh này');
    }

    await this.repository.deleteChantingSession(sessionId);

    // Audit log the deletion
    await this.audit.append(
      auditCtx,
      "content.delete",
      "chanting_session",
      sessionId,
      {
        sessionDate: session.sessionDate.toISOString().split('T')[0],
        durationMinutes: session.durationMinutes,
      }
    );

    return { success: true };
  }

  // ============================================================================
  // Admin Chanting Sessions
  // ============================================================================

  /**
   * Get all chanting sessions for admin (with optional user filter)
   */
  async getAllChantingSessions(page: number, limit: number, userId?: string, _auditCtx?: AuditContext) {
    const offset = (page - 1) * limit;
    const where = userId ? { userId } : {};

    const [sessions, total] = await Promise.all([
      this.repository.findChantingSessionsAdminList({
        where,
        orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }],
        skip: offset,
        take: limit,
      }),
      this.repository.countChantingSessions({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      sessions: sessions.map((session) => ({
        ...this.mapChantingSessionToResponse(session),
        user: session.user,
      })),
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get chanting session details for admin
   */
  async getChantingSessionAdmin(sessionId: string, _auditCtx?: AuditContext) {
    const session = await this.repository.findChantingSessionByIdAdmin(sessionId);

    if (!session) {
      throw new NotFoundException(`Phiên niệm kinh với ID ${sessionId} không tồn tại`);
    }

    return {
      ...this.mapChantingSessionToResponse(session),
      user: session.user,
    };
  }

  /**
   * Delete chanting session as admin
   */
  async deleteChantingSessionAdmin(sessionId: string, auditCtx?: AuditContext): Promise<{ success: boolean }> {
    const session = await this.repository.findChantingSessionById(sessionId);
    
    if (!session) {
      throw new NotFoundException(`Phiên niệm kinh với ID ${sessionId} không tồn tại`);
    }

    await this.repository.deleteChantingSession(sessionId);

    // Audit log the admin deletion
    if (auditCtx) {
      await this.audit.append(
        auditCtx,
        "content.delete",
        "chanting_session",
        sessionId,
        {
          userId: session.userId,
          sessionDate: session.sessionDate.toISOString().split('T')[0],
          durationMinutes: session.durationMinutes,
        }
      );
    }

    return { success: true };
  }

  // ============================================================================
  // Private helpers
  // ============================================================================

  private mapChantingSessionToResponse(session: ChantingSession) {
    return {
      id: session.id,
      userId: session.userId,
      sessionDate: session.sessionDate.toISOString().split('T')[0], // YYYY-MM-DD
      startTime: session.startTime, // Already in string format from Prisma TIME
      durationMinutes: session.durationMinutes,
      location: session.location,
      notes: session.notes,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
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
