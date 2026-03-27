import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { Prisma, AssetStatus } from "../../generated/prisma/client.js";

export interface CreateMediaAssetInput {
  publicId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  uploaderId: string;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class MediaAssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMediaAssetInput) {
    return this.prisma.mediaAsset.create({
      data: {
        publicId: data.publicId,
        filename: data.filename,
        mimeType: data.mimeType,
        size: data.size,
        storageKey: data.storageKey,
        url: data.url,
        uploaderId: data.uploaderId,
        width: data.width,
        height: data.height,
        metadata: data.metadata as Prisma.InputJsonValue,
        status: "UPLOADING",
      },
    });
  }

  async findByPublicId(publicId: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { publicId },
    });
  }

  async updateStatus(publicId: string, status: AssetStatus) {
    return this.prisma.mediaAsset.update({
      where: { publicId },
      data: { status },
    });
  }

  async delete(publicId: string) {
    return this.prisma.mediaAsset.update({
      where: { publicId },
      data: { status: "DELETED" },
    });
  }

  async findByUploader(uploaderId: string, limit = 50) {
    return this.prisma.mediaAsset.findMany({
      where: {
        uploaderId,
        status: { not: "DELETED" },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  async findOrphanedAssets(olderThanMinutes = 30) {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - olderThanMinutes);

    return this.prisma.mediaAsset.findMany({
      where: {
        status: "UPLOADING",
        createdAt: { lt: cutoff },
      },
    });
  }
}
