import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { PrismaClient } from "../../generated/prisma/client.js";
import type { CreateLifeReleaseInput, LifeReleaseQuery, ProxyReleaseInput } from "./life-liberation.schemas.js";

type TransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

@Injectable()
export class LifeLiberationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: LifeReleaseQuery) {
    const where = {
      ...(query.status && { status: query.status as never }),
      ...(query.recordType && { recordType: query.recordType as never }),
      ...(query.userId && { userId: query.userId }),
    };
    const [data, total] = await Promise.all([
      this.prisma.lifeReleaseRecord.findMany({
        where,
        orderBy: { releaseDate: "desc" },
        take: query.limit,
        skip: query.offset,
        include: {
          user: { select: { publicId: true, displayName: true } },
          animals: true,
        },
      }),
      this.prisma.lifeReleaseRecord.count({ where }),
    ]);
    return { data, total };
  }

  private detailInclude(includeEmail: boolean) {
    return {
      user: {
        select: {
          publicId: true,
          displayName: true,
          ...(includeEmail ? { email: true } : {}),
        },
      },
      animals: true,
      proxyItems: true,
    };
  }

  /** Member lane — required owner scope. Never returns email. */
  async findMemberByPublicId(publicId: string, ownerUserId: string) {
    return this.prisma.lifeReleaseRecord.findFirst({
      where: { publicId, userId: ownerUserId },
      include: this.detailInclude(false),
    });
  }

  /** Admin lane — unscoped; may include owner email for ops. */
  async findAdminByPublicId(publicId: string) {
    return this.prisma.lifeReleaseRecord.findUnique({
      where: { publicId },
      include: this.detailInclude(true),
    });
  }

  /**
   * @deprecated Prefer findMemberByPublicId / findAdminByPublicId.
   */
  async findByPublicId(publicId: string, ownerUserId?: string) {
    if (ownerUserId !== undefined) {
      return this.findMemberByPublicId(publicId, ownerUserId);
    }
    return this.findAdminByPublicId(publicId);
  }

  async create(input: CreateLifeReleaseInput, userId: string, publicId: string, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.lifeReleaseRecord.create({
      data: {
        publicId,
        userId,
        recordType: input.recordType as never,
        releaseDate: new Date(input.releaseDate),
        locationName: input.locationName,
        locationCoords: input.locationCoords,
        merit: input.merit,
        notes: input.notes,
        status: "PENDING",
        animals: {
          create: input.animals.map((a) => ({
            species: a.species as never,
            quantity: a.quantity,
            sourceLocation: a.sourceLocation,
            isPredatory: a.isPredatory,
            notes: a.notes,
          })),
        },
      },
      include: { animals: true },
    });
  }

  async updateStatus(id: string, status: string, tx?: TransactionClient) {
    const db = tx ?? this.prisma;
    return db.lifeReleaseRecord.update({
      where: { id },
      data: { status: status as never },
    });
  }

  async addProxyRelease(
    recordId: string,
    sponsorId: string,
    input: ProxyReleaseInput,
    tx?: TransactionClient,
  ) {
    const db = tx ?? this.prisma;
    return db.proxyLifeRelease.create({
      data: {
        recordId,
        sponsorId,
        beneficiary: input.beneficiary,
        merit: input.merit,
      },
    });
  }

  async countBySpecies() {
    return this.prisma.releaseAnimalEntry.groupBy({
      by: ["species"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
    });
  }
}
