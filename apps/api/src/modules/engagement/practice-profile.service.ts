import { Injectable, Logger } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../../common/prisma/prisma.service.js";

export const updatePracticeProfileSchema = z.object({
  elderlyMode: z.boolean().optional(),
  assistMode: z.boolean().optional(),
  assistContactRef: z.string().max(200).optional().nullable(),
});
export type UpdatePracticeProfileInput = z.infer<typeof updatePracticeProfileSchema>;

@Injectable()
export class PracticeProfileService {
  private readonly logger = new Logger(PracticeProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    const existing = await this.prisma.practiceProfile.findUnique({
      where: { userId },
    });
    if (existing) return this.toDto(existing);

    const created = await this.prisma.practiceProfile.create({
      data: { userId, elderlyMode: false, assistMode: false },
    });
    return this.toDto(created);
  }

  async update(input: UpdatePracticeProfileInput, userId: string) {
    const profile = await this.prisma.practiceProfile.upsert({
      where: { userId },
      create: {
        userId,
        elderlyMode: input.elderlyMode ?? false,
        assistMode: input.assistMode ?? false,
        assistContactRef: input.assistContactRef ?? null,
      },
      update: {
        ...(input.elderlyMode !== undefined ? { elderlyMode: input.elderlyMode } : {}),
        ...(input.assistMode !== undefined ? { assistMode: input.assistMode } : {}),
        ...(input.assistContactRef !== undefined ? { assistContactRef: input.assistContactRef } : {}),
      },
    });

    this.logger.log({
      msg: "practice_profile.updated",
      userId,
      elderlyMode: profile.elderlyMode,
      assistMode: profile.assistMode,
    });
    return this.toDto(profile);
  }

  private toDto(profile: {
    userId: string;
    elderlyMode: boolean;
    assistMode: boolean;
    assistContactRef: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      elderlyMode: profile.elderlyMode,
      assistMode: profile.assistMode,
      assistContactRef: profile.assistContactRef,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
