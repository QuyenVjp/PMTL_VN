import { Injectable, Logger } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { EncryptionService } from "../../common/encryption/encryption.service.js";
import { MentalHealthCondition } from "../../generated/prisma/enums.js";

export const updatePracticeProfileSchema = z.object({
  elderlyMode: z.boolean().optional(),
  assistMode: z.boolean().optional(),
  assistContactRef: z.string().max(200).optional().nullable(),
  // Phase 12 Logic 4: Mental health condition tracking
  // When set to a non-NONE value, daBeiZhouDailyLimit auto-sets to 21
  mentalHealthCondition: z
    .nativeEnum(MentalHealthCondition)
    .optional(),
});
export type UpdatePracticeProfileInput = z.infer<typeof updatePracticeProfileSchema>;

@Injectable()
export class PracticeProfileService {
  private readonly logger = new Logger(PracticeProfileService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async getOrCreate(userId: string) {
    const existing = await this.prisma.practiceProfile.findUnique({
      where: { userId },
    });
    if (existing) return this.toDto(existing, this.encryption.decrypt(existing.assistContactRef));

    const created = await this.prisma.practiceProfile.create({
      data: { userId, elderlyMode: false, assistMode: false },
    });
    return this.toDto(created, null);
  }

  async update(input: UpdatePracticeProfileInput, userId: string) {
    // Encrypt PII field before persisting — assistContactRef is emergency contact data
    const encryptedRef =
      input.assistContactRef != null
        ? this.encryption.encrypt(input.assistContactRef)
        : input.assistContactRef; // null or undefined pass through

    // Phase 12 Logic 4: auto-set daBeiZhouDailyLimit to 21 when any mental health condition is set
    const mentalHealthFields =
      input.mentalHealthCondition !== undefined
        ? {
            mentalHealthCondition: input.mentalHealthCondition,
            daBeiZhouDailyLimit:
              input.mentalHealthCondition !== MentalHealthCondition.NONE ? 21 : null,
          }
        : {};

    const profile = await this.prisma.practiceProfile.upsert({
      where: { userId },
      create: {
        userId,
        elderlyMode: input.elderlyMode ?? false,
        assistMode: input.assistMode ?? false,
        assistContactRef: encryptedRef ?? null,
        ...mentalHealthFields,
      },
      update: {
        ...(input.elderlyMode !== undefined ? { elderlyMode: input.elderlyMode } : {}),
        ...(input.assistMode !== undefined ? { assistMode: input.assistMode } : {}),
        ...(input.assistContactRef !== undefined
          ? { assistContactRef: encryptedRef ?? null }
          : {}),
        ...mentalHealthFields,
      },
    });

    this.logger.log({
      msg: "practice_profile.updated",
      userId,
      elderlyMode: profile.elderlyMode,
      assistMode: profile.assistMode,
      mentalHealthCondition: profile.mentalHealthCondition,
      daBeiZhouDailyLimit: profile.daBeiZhouDailyLimit,
    });
    // Decrypt for response — callers receive plaintext, DB stores ciphertext
    const decryptedRef = this.encryption.decrypt(profile.assistContactRef);
    return this.toDto(profile, decryptedRef);
  }

  private toDto(
    profile: {
      elderlyMode: boolean;
      assistMode: boolean;
      mentalHealthCondition: MentalHealthCondition;
      daBeiZhouDailyLimit: number | null;
      createdAt: Date;
      updatedAt: Date;
    },
    decryptedRef: string | null,
  ) {
    return {
      elderlyMode: profile.elderlyMode,
      assistMode: profile.assistMode,
      assistContactRef: decryptedRef,
      mentalHealthCondition: profile.mentalHealthCondition,
      daBeiZhouDailyLimit: profile.daBeiZhouDailyLimit,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
