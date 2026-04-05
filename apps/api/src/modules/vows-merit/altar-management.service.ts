import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  AltarItemQuery,
  CreateAltarItemInput,
  UpdateAltarItemConditionInput,
  ValidationLogQuery,
  CreateValidationLogInput,
} from "./altar-management.schemas.js";

@Injectable()
export class AltarManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Altar Items ──────────────────────────────────────────────────────────

  async listItems(query: AltarItemQuery) {
    const where = {
      ...(query.itemType && { itemType: query.itemType as never }),
      ...(query.condition && { condition: query.condition as never }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.userId && { userId: query.userId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.altarItem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: { user: { select: { publicId: true, displayName: true } } },
      }),
      this.prisma.altarItem.count({ where }),
    ]);
    return {
      data: data.map((item) => ({
        id: item.publicId,
        name: item.name,
        itemType: item.itemType,
        condition: item.condition,
        isActive: item.isActive,
        acquisitionAt: item.acquisitionAt,
        user: item.user ? { id: item.user.publicId, name: item.user.displayName } : null,
        createdAt: item.createdAt,
      })),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async getItem(publicId: string) {
    const item = await this.prisma.altarItem.findUnique({
      where: { publicId },
      include: {
        user: { select: { publicId: true, displayName: true } },
        validationLogs: { orderBy: { performedAt: "desc" }, take: 10 },
      },
    });
    if (!item) throw new NotFoundException("Vật phẩm thờ cúng không tồn tại");
    return item;
  }

  async createItem(input: CreateAltarItemInput, userId: string, auditCtx: AuditContext) {
    const item = await this.prisma.altarItem.create({
      data: {
        publicId: nanoid(21),
        userId,
        itemType: input.itemType as never,
        name: input.name,
        acquisitionAt: input.acquisitionAt ? new Date(input.acquisitionAt) : undefined,
        notes: input.notes,
        condition: "GOOD",
        isActive: true,
      },
    });
    await this.audit.append(auditCtx, "member.altar_item.create", "altar_item", item.publicId, {
      itemType: input.itemType,
      name: input.name,
    });
    return item;
  }

  async updateCondition(
    publicId: string,
    input: UpdateAltarItemConditionInput,
    adminId: string,
    auditCtx: AuditContext,
  ) {
    const item = await this.prisma.altarItem.findUnique({ where: { publicId } });
    if (!item) throw new NotFoundException("Vật phẩm thờ cúng không tồn tại");
    const updated = await this.prisma.altarItem.update({
      where: { publicId },
      data: {
        condition: input.condition as never,
        isActive: input.condition !== "RETIRED",
        notes: input.notes,
      },
    });
    await this.audit.append(auditCtx, "admin.altar_item.condition", "altar_item", publicId, {
      from: item.condition,
      to: input.condition,
    });
    return updated;
  }

  // ─── Validation Logs (read-only audit) ───────────────────────────────────

  async listValidationLogs(query: ValidationLogQuery) {
    const where = {
      ...(query.protocolType && { protocolType: query.protocolType as never }),
      ...(query.userId && { userId: query.userId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.altarValidationLog.findMany({
        where,
        orderBy: { performedAt: "desc" },
        take: query.limit,
        skip: query.offset,
        include: {
          user: { select: { publicId: true, displayName: true } },
          altarItem: { select: { publicId: true, name: true } },
        },
      }),
      this.prisma.altarValidationLog.count({ where }),
    ]);
    return {
      data: data.map((log) => ({
        id: log.id,
        protocolType: log.protocolType,
        passed: log.passed,
        notes: log.notes,
        performedAt: log.performedAt,
        user: log.user ? { id: log.user.publicId, name: log.user.displayName } : null,
        item: log.altarItem ? { id: log.altarItem.publicId, name: log.altarItem.name } : null,
      })),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async createValidationLog(input: CreateValidationLogInput, userId: string, auditCtx: AuditContext) {
    let altarItemId: string | undefined;
    if (input.altarItemPublicId) {
      const item = await this.prisma.altarItem.findUnique({ where: { publicId: input.altarItemPublicId } });
      if (!item) throw new NotFoundException("Vật phẩm thờ cúng không tồn tại");
      altarItemId = item.id;
    }
    const log = await this.prisma.altarValidationLog.create({
      data: {
        altarItemId,
        userId,
        protocolType: input.protocolType as never,
        passed: input.passed,
        notes: input.notes,
        performedAt: new Date(input.performedAt),
      },
    });
    if (!input.passed) {
      await this.audit.append(auditCtx, "member.altar_validation.fail", "altar_validation_log", log.id, {
        protocolType: input.protocolType,
      });
    }
    return log;
  }

  // ─── Protocol Templates ───────────────────────────────────────────────────

  async listProtocolTemplates() {
    return this.prisma.altarProtocolTemplate.findMany({
      where: { isActive: true },
      orderBy: { protocolType: "asc" },
    });
  }
}
