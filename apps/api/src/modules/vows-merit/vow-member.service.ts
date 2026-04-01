import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type {
  CreateVowInput,
  UpdateVowProgressInput,
  FulfillVowInput,
  AddMeritTransferInput,
  MemberVowQuery,
  CreateMilestoneInput,
} from "./vow-member.schemas.js";

@Injectable()
export class VowMemberService {
  private readonly logger = new Logger(VowMemberService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createVow(input: CreateVowInput, userId: string) {
    const vow = await this.prisma.vow.create({
      data: {
        publicId: nanoid(21),
        userId,
        vowType: input.vowType,
        description: input.description,
        targetCount: input.targetCount ?? null,
        currentCount: 0,
        status: "ACTIVE",
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });
    this.logger.log({ msg: "vow.created", userId, publicId: vow.publicId, vowType: input.vowType });
    return this.toDto(vow, []);
  }

  async updateProgress(input: UpdateVowProgressInput, userId: string) {
    const vow = await this.prisma.vow.findFirst({
      where: { publicId: input.publicId, userId },
    });
    if (!vow) throw new NotFoundException("Nguyện lực không tồn tại");
    if (vow.status !== "ACTIVE") {
      throw new BadRequestException("Chỉ có thể cập nhật tiến độ nguyện lực đang active");
    }

    // Atomic increment — avoids read-modify-write race condition when concurrent
    // requests update the same vow simultaneously.
    const updated = await this.prisma.vow.update({
      where: { id: vow.id },
      data: { currentCount: { increment: input.addCount } },
    });

    this.logger.log({
      msg: "vow.progress_updated",
      userId,
      publicId: input.publicId,
      addCount: input.addCount,
      newTotal: updated.currentCount,
    });
    return this.toDto(updated, []);
  }

  async fulfillVow(input: FulfillVowInput, userId: string) {
    const vow = await this.prisma.vow.findFirst({
      where: { publicId: input.publicId, userId },
    });
    if (!vow) throw new NotFoundException("Nguyện lực không tồn tại");
    if (vow.status !== "ACTIVE") {
      throw new BadRequestException("Nguyện lực không ở trạng thái active");
    }

    const updated = await this.prisma.vow.update({
      where: { id: vow.id },
      data: { status: "COMPLETED" },
    });

    this.logger.log({ msg: "vow.fulfilled", userId, publicId: input.publicId });
    return this.toDto(updated, []);
  }

  async addMeritTransfer(input: AddMeritTransferInput, userId: string) {
    const vow = await this.prisma.vow.findFirst({
      where: { publicId: input.vowPublicId, userId },
    });
    if (!vow) throw new NotFoundException("Nguyện lực không tồn tại");

    // Validate: tổng % hồi hướng không vượt 100
    const existing = await this.prisma.meritTransfer.findMany({
      where: { vowId: vow.id },
    });
    const totalPercent = existing.reduce((sum, t) => sum + t.transferPercent, 0);
    if (totalPercent + input.transferPercent > 100) {
      throw new BadRequestException(
        `Tổng phần trăm hồi hướng vượt 100% (hiện tại: ${totalPercent}%, thêm: ${input.transferPercent}%)`,
      );
    }

    const transfer = await this.prisma.meritTransfer.create({
      data: {
        publicId: nanoid(21),
        vowId: vow.id,
        transferPercent: input.transferPercent,
        targetLabel: input.targetLabel,
        note: input.note ?? null,
      },
    });

    this.logger.log({
      msg: "merit_transfer.created",
      userId,
      vowPublicId: input.vowPublicId,
      transferPercent: input.transferPercent,
      targetLabel: input.targetLabel,
    });
    return {
      publicId: transfer.publicId,
      transferPercent: transfer.transferPercent,
      targetLabel: transfer.targetLabel,
      note: transfer.note,
      createdAt: transfer.createdAt,
    };
  }

  async listVows(userId: string, query: MemberVowQuery) {
    const where: Record<string, unknown> = { userId };
    if (query.status) where["status"] = query.status;

    const [data, total] = await Promise.all([
      this.prisma.vow.findMany({
        where,
        include: { meritTransfers: true },
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
      }),
      this.prisma.vow.count({ where }),
    ]);

    return {
      data: data.map((v) => this.toDto(v, v.meritTransfers)),
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

  async getVow(publicId: string, userId: string) {
    const vow = await this.prisma.vow.findFirst({
      where: { publicId, userId },
      include: { meritTransfers: true },
    });
    if (!vow) throw new NotFoundException("Nguyện lực không tồn tại");
    return this.toDto(vow, vow.meritTransfers);
  }

  async recordMilestone(vowPublicId: string, input: CreateMilestoneInput, userId: string) {
    const vow = await this.prisma.vow.findFirst({
      where: { publicId: vowPublicId, userId },
    });
    if (!vow) throw new NotFoundException("Nguyện lực không tồn tại");
    if (vow.status !== "ACTIVE") {
      throw new BadRequestException("Chỉ có thể ghi nhận cột mốc cho nguyện lực đang active");
    }

    // Atomic increment then check completion using DB-returned value — avoids
    // read-modify-write race. isCompleted must use the DB's actual new count,
    // not the stale pre-read value.
    const updated = await this.prisma.$transaction(async (tx) => {
      const afterIncrement = await tx.vow.update({
        where: { id: vow.id },
        data: { currentCount: { increment: input.addCount } },
      });
      const isCompleted = afterIncrement.targetCount !== null
        && afterIncrement.currentCount >= afterIncrement.targetCount;
      if (isCompleted) {
        return tx.vow.update({
          where: { id: vow.id },
          data: { status: "COMPLETED" },
          include: { meritTransfers: true },
        });
      }
      return tx.vow.findUniqueOrThrow({
        where: { id: vow.id },
        include: { meritTransfers: true },
      });
    });

    const isCompleted = vow.targetCount !== null && updated.currentCount >= vow.targetCount;

    this.logger.log({
      msg: "vow.milestone_recorded",
      userId,
      vowPublicId,
      addCount: input.addCount,
      newTotal: updated.currentCount,
      note: input.note,
      autoCompleted: isCompleted,
    });

    return {
      data: {
        ...this.toDto(updated, updated.meritTransfers),
        milestone: {
          addCount: input.addCount,
          note: input.note ?? null,
          autoCompleted: isCompleted,
        },
      },
    };
  }

  private toDto(
    vow: {
      publicId: string;
      vowType: string;
      description: string;
      targetCount: number | null;
      currentCount: number;
      status: string;
      startDate: Date;
      endDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    meritTransfers: Array<{
      publicId: string;
      transferPercent: number;
      targetLabel: string;
      note: string | null;
      createdAt: Date;
    }>,
  ) {
    const progressPercent =
      vow.targetCount && vow.targetCount > 0
        ? Math.min(Math.round((vow.currentCount / vow.targetCount) * 100), 100)
        : null;

    return {
      publicId: vow.publicId,
      vowType: vow.vowType,
      description: vow.description,
      targetCount: vow.targetCount,
      currentCount: vow.currentCount,
      progressPercent,
      status: vow.status,
      startDate: vow.startDate.toISOString().slice(0, 10),
      endDate: vow.endDate?.toISOString().slice(0, 10) ?? null,
      meritTransfers: meritTransfers.map((t) => ({
        publicId: t.publicId,
        transferPercent: t.transferPercent,
        targetLabel: t.targetLabel,
        note: t.note,
        createdAt: t.createdAt,
      })),
      totalTransferPercent: meritTransfers.reduce((s, t) => s + t.transferPercent, 0),
      createdAt: vow.createdAt,
      updatedAt: vow.updatedAt,
    };
  }
}
