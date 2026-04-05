import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditService, type AuditContext } from "../../platform/audit/audit.service.js";
import { LifeLiberationRepository } from "./life-liberation.repository.js";
import { mapRecordToItem, mapRecordToDetail } from "./life-liberation.mapper.js";
import type {
  LifeReleaseQuery,
  CreateLifeReleaseInput,
  UpdateLifeReleaseStatusInput,
  ProxyReleaseInput,
} from "./life-liberation.schemas.js";

// Predatory species that require extra care (ba-ba turtle rule)
const HIGH_RISK_PREDATORY = ["TURTLE", "CRAB"];

@Injectable()
export class LifeLiberationService {
  constructor(
    private readonly repo: LifeLiberationRepository,
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
    // Predatory species guard: warn if releasing predatory species
    const hasPredatory = input.animals.some((a) => a.isPredatory);
    const hasHighRisk = input.animals.some((a) => HIGH_RISK_PREDATORY.includes(a.species) && a.isPredatory);
    if (hasHighRisk) {
      // Allow but flag — ba-ba turtles eat fish, need ecosystem awareness note
      // This is a soft warning, not a hard block
    }

    const record = await this.repo.create(input, userId, nanoid(21));
    await this.audit.append(auditCtx, "member.life_release.create", "life_release_record", record.publicId, {
      recordType: input.recordType,
      totalAnimals: input.animals.reduce((s, a) => s + a.quantity, 0),
      hasPredatory,
    });
    return { ...mapRecordToDetail(record), hasPredatoryWarning: hasPredatory };
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
}
