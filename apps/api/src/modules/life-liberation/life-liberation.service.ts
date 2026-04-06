import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { LifeLiberationRepository } from "./life-liberation.repository.js";
import { mapRecordToItem, mapRecordToDetail } from "./life-liberation.mapper.js";
import type {
  LifeReleaseQuery,
  CreateLifeReleaseInput,
  UpdateLifeReleaseStatusInput,
  ProxyReleaseInput,
} from "./life-liberation.schemas.js";

// Species that are predatory per design/03-domains/life-liberation/CONTRACTS.md
// Hard-block: cá lóc (snakehead), cá trê (catfish), ba ba hung dữ (carnivore turtle/crab)
const PREDATORY_HARD_BLOCK_SPECIES = new Set(["SNAKEHEAD", "CATFISH", "TURTLE", "CRAB"]);

@Injectable()
export class LifeLiberationService {
  private readonly logger = new Logger(LifeLiberationService.name);

  constructor(
    private readonly repo: LifeLiberationRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listRecords(query: LifeReleaseQuery) {
    const { data, total } = await this.repo.findMany(query);
    return {
      data: data.map(mapRecordToItem),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  }

  async getRecord(publicId: string) {
    const record = await this.repo.findByPublicId(publicId);
    if (!record) throw new NotFoundException("Hồ sơ phóng sinh không tồn tại");
    return mapRecordToDetail(record);
  }

  async createRecord(input: CreateLifeReleaseInput, userId: string, auditCtx: AuditContext) {
    // HARD BLOCK: predatory species require habitat verification per CONTRACTS.md
    // "predatory species (cá lóc, cá trê, ba ba hung dữ) là hard-block"
    const predatoryAnimals = input.animals.filter(
      (a) => a.isPredatory || PREDATORY_HARD_BLOCK_SPECIES.has(a.species),
    );

    if (predatoryAnimals.length > 0) {
      // habitatVerified must be explicitly true to proceed
      if (!input.habitatVerified) {
        throw new BadRequestException(
          "Loài ăn thịt yêu cầu xác nhận môi trường sống (habitatVerified=true). " +
          "Vùng nước phải cực lớn, sâu, không có cá nhỏ. Mã lỗi: PREDATORY_HABITAT_VERIFICATION_REQUIRED",
        );
      }
      if (input.habitatSafe === false) {
        throw new BadRequestException(
          "Môi trường sống không phù hợp cho loài ăn thịt. " +
          "Không thể phóng sinh tại hồ nhỏ hoặc ao có cá khác. Mã lỗi: UNSAFE_HABITAT_FOR_PREDATORY_SPECIES",
        );
      }

      // Log audit with HIGH risk level per design spec
      this.logger.warn({
        msg: "LIFE_RELEASE_PREDATORY_SPECIES",
        riskLevel: "HIGH",
        userId,
        species: predatoryAnimals.map((a) => a.species),
      });
    }

    // Proxy release: money transfer confirmation required when moneyTransferRequired=true
    if (input.recordType === "PROXY" && input.moneyTransferRequired && !input.altarDedicationConfirmed) {
      throw new BadRequestException(
        "Phóng sinh hộ dùng tiền riêng yêu cầu xác nhận đã khấn tại bàn thờ xin Bồ Tát chuyển tiền. " +
        "Mã lỗi: MONEY_TRANSFER_NOT_CONFIRMED",
      );
    }

    const hasPredatory = predatoryAnimals.length > 0;
    const record = await this.repo.create(input, userId, nanoid(21));

    await this.audit.append(auditCtx, "member.life_release.create", "life_release_record", record.publicId, {
      recordType: input.recordType,
      totalAnimals: input.animals.reduce((s, a) => s + a.quantity, 0),
      hasPredatory,
      riskLevel: hasPredatory ? "HIGH" : "NORMAL",
    });

    return mapRecordToDetail(record);
  }

  async updateStatus(
    publicId: string,
    input: UpdateLifeReleaseStatusInput,
    adminId: string,
    auditCtx: AuditContext,
  ) {
    const record = await this.repo.findByPublicId(publicId);
    if (!record) throw new NotFoundException("Hồ sơ phóng sinh không tồn tại");
    if (record.status === "CANCELLED") throw new BadRequestException("Hồ sơ đã bị hủy");
    const updated = await this.repo.updateStatus(record.id, input.status);
    await this.audit.append(auditCtx, "admin.life_release.status", "life_release_record", publicId, {
      from: record.status,
      to: input.status,
    });
    return mapRecordToItem(updated);
  }

  async addProxyRelease(recordPublicId: string, input: ProxyReleaseInput, sponsorId: string, auditCtx: AuditContext) {
    const record = await this.repo.findByPublicId(recordPublicId);
    if (!record) throw new NotFoundException("Hồ sơ phóng sinh không tồn tại");
    if (record.recordType !== "PROXY") {
      throw new BadRequestException("Chỉ hồ sơ PROXY mới được thêm người thụ hưởng");
    }
    const proxy = await this.repo.addProxyRelease(record.id, sponsorId, input);
    await this.audit.append(auditCtx, "member.life_release.proxy_add", "proxy_life_release", proxy.id, {
      beneficiary: input.beneficiary,
    });
    return proxy;
  }

  async getSpeciesSummary() {
    const data = await this.repo.countBySpecies();
    return {
      data: data.map((row) => ({
        species: row.species,
        totalReleased: row._sum.quantity ?? 0,
      })),
    };
  }

  /** Admin status overview per CONTRACTS.md: số release theo status, audit cần review, predatory gần đây */
  async getAdminStatus() {
    const [statusCounts, pendingAuditCount, predatoryRecent] = await Promise.all([
      this.prisma.lifeReleaseRecord.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Count records that are completed but not yet audited
      this.prisma.lifeReleaseRecord.count({
        where: { status: "COMPLETED" },
      }),
      // Predatory species releases in last 30 days
      this.prisma.releaseAnimalEntry.findMany({
        where: {
          isPredatory: true,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: {
          species: true,
          quantity: true,
          createdAt: true,
          record: { select: { publicId: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const byStatus = Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.id]),
    );

    return {
      releasesByStatus: byStatus,
      pendingAuditCount,
      recentPredatoryReleases: predatoryRecent.map((e) => ({
        species: e.species,
        quantity: e.quantity,
        createdAt: e.createdAt,
        recordPublicId: e.record.publicId,
        recordStatus: e.record.status,
      })),
      checkedAt: new Date().toISOString(),
    };
  }
}
