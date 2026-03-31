import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  MemberLifeReleaseQuery,
  CreateLifeReleaseJournalInput,
  UpdateLifeReleaseJournalInput,
} from "./vow-member.schemas.js";

@Injectable()
export class LifeReleaseMemberService {
  private readonly logger = new Logger(LifeReleaseMemberService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: MemberLifeReleaseQuery) {
    const where = { userId };

    const [data, total] = await Promise.all([
      this.prisma.lifeReleaseJournal.findMany({
        where,
        orderBy: { journalDate: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.lifeReleaseJournal.count({ where }),
    ]);

    return {
      data: data.map((r) => this.toDto(r)),
      meta: {
        pagination: {
          total,
          limit: query.limit,
          offset: query.offset,
          hasMore: query.offset + query.limit < total,
        },
      },
    };
  }

  async getDetail(publicId: string, userId: string) {
    const record = await this.prisma.lifeReleaseJournal.findFirst({
      where: { publicId, userId },
    });
    if (!record) throw new NotFoundException("Nhật ký phóng sanh không tồn tại");
    return { data: this.toDto(record) };
  }

  async create(input: CreateLifeReleaseJournalInput, userId: string) {
    let vowId: string | null = null;
    if (input.vowPublicId) {
      const vow = await this.prisma.vow.findFirst({
        where: { publicId: input.vowPublicId, userId },
      });
      if (!vow) throw new NotFoundException("Nguyện lực không tồn tại");
      vowId = vow.id;
    }

    const record = await this.prisma.lifeReleaseJournal.create({
      data: {
        publicId: nanoid(21),
        userId,
        journalDate: new Date(input.journalDate),
        animalType: input.animalType,
        quantity: input.quantity,
        location: input.location ?? null,
        note: input.note ?? null,
        vowId,
      },
    });

    this.logger.log({
      msg: "life_release_journal.created",
      userId,
      publicId: record.publicId,
      animalType: input.animalType,
      quantity: input.quantity,
    });

    return { data: this.toDto(record) };
  }

  async update(publicId: string, input: UpdateLifeReleaseJournalInput, userId: string) {
    const record = await this.prisma.lifeReleaseJournal.findFirst({
      where: { publicId, userId },
    });
    if (!record) throw new NotFoundException("Nhật ký phóng sanh không tồn tại");

    const updated = await this.prisma.lifeReleaseJournal.update({
      where: { id: record.id },
      data: {
        ...(input.animalType !== undefined ? { animalType: input.animalType } : {}),
        ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.journalDate !== undefined ? { journalDate: new Date(input.journalDate) } : {}),
      },
    });

    this.logger.log({
      msg: "life_release_journal.updated",
      userId,
      publicId,
    });

    return { data: this.toDto(updated) };
  }

  private toDto(record: {
    publicId: string;
    journalDate: Date;
    animalType: string;
    quantity: number;
    location: string | null;
    note: string | null;
    vowId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      publicId: record.publicId,
      journalDate: record.journalDate.toISOString().slice(0, 10),
      animalType: record.animalType,
      quantity: record.quantity,
      location: record.location,
      note: record.note,
      vowId: record.vowId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
