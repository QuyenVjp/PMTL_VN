import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { AssetStatus, Prisma, PrismaClient } from "../../generated/prisma/client.js";

/**
 * Prisma interactive-transaction client. Excludes lifecycle/extension methods
 * that are not available on the scoped `tx` handed to a `$transaction` callback.
 */
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

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

export interface ListAssetsFilter {
  status?: AssetStatus;
  mediaKind?: "image" | "video" | "document";
  mimeType?: string;
  search?: string;
  folderPublicId?: string;
  limit: number;
  offset: number;
}

@Injectable()
export class MediaAssetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Opens an interactive transaction owned by the repository so the service can
   * atomically wrap a write + its audit append without importing Prisma itself.
   * If the callback throws (e.g. the audit chain write fails), Prisma rolls the
   * whole transaction back — the domain write is never committed.
   */
  runInTransaction<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => fn(tx));
  }

  /** Resolve the active client: the scoped tx when inside a transaction, else the base client. */
  private db(tx?: TransactionClient): TransactionClient {
    return tx ?? this.prisma;
  }

  async create(data: CreateMediaAssetInput) {
    const createData: Prisma.MediaAssetCreateInput = {
      publicId: data.publicId,
      filename: data.filename,
      mimeType: data.mimeType,
      size: data.size,
      storageKey: data.storageKey,
      url: data.url,
      uploader: { connect: { id: data.uploaderId } },
      status: "UPLOADING",
      ...(data.width !== undefined ? { width: data.width } : {}),
      ...(data.height !== undefined ? { height: data.height } : {}),
      ...(data.metadata !== undefined ? { metadata: data.metadata as Prisma.InputJsonValue } : {}),
    };

    return this.prisma.mediaAsset.create({
      data: createData,
    });
  }

  async findByPublicId(publicId: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { publicId },
    });
  }

  async findManyByPublicIds(publicIds: string[]) {
    if (publicIds.length === 0) return [];
    return this.prisma.mediaAsset.findMany({
      where: { publicId: { in: publicIds } },
      select: { publicId: true, url: true, storageKey: true },
    });
  }

  async findById(id: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { id },
    });
  }

  // ── Admin list / detail / content ─────────────────────────────────────────────

  /** Paginated admin listing with mime/status/folder filters. */
  async listAssets(filter: ListAssetsFilter) {
    const where: Prisma.MediaAssetWhereInput = {};

    if (filter.status) {
      where.status = filter.status;
    } else {
      where.status = { not: "DELETED" };
    }

    if (filter.mediaKind === "image") {
      where.mimeType = { startsWith: "image/" };
    } else if (filter.mediaKind === "video") {
      where.mimeType = { startsWith: "video/" };
    } else if (filter.mediaKind === "document") {
      where.AND = [
        { mimeType: { not: { startsWith: "image/" } } },
        { mimeType: { not: { startsWith: "video/" } } },
      ];
    } else if (filter.mimeType) {
      where.mimeType = { startsWith: filter.mimeType };
    }

    if (filter.search) {
      where.filename = { contains: filter.search, mode: "insensitive" };
    }

    if (filter.folderPublicId) {
      where.collectionItems = {
        some: {
          collection: {
            publicId: filter.folderPublicId,
            collectionType: "MEDIA_FOLDER",
          },
        },
      };
    }

    const [assets, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: filter.offset,
        take: filter.limit,
        select: {
          publicId: true,
          filename: true,
          mimeType: true,
          size: true,
          storageKey: true,
          url: true,
          width: true,
          height: true,
          status: true,
          uploaderId: true,
          createdAt: true,
          updatedAt: true,
          uploader: {
            select: {
              publicId: true,
              displayName: true,
            },
          },
        },
      }),
      this.prisma.mediaAsset.count({ where }),
    ]);

    return { assets, total };
  }

  /** Full detail projection for the admin detail endpoint. */
  async findDetailByPublicId(publicId: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { publicId },
      select: {
        publicId: true,
        filename: true,
        mimeType: true,
        size: true,
        storageKey: true,
        url: true,
        width: true,
        height: true,
        status: true,
        metadata: true,
        uploaderId: true,
        createdAt: true,
        updatedAt: true,
        uploader: {
          select: {
            publicId: true,
            displayName: true,
            email: true,
          },
        },
      },
    });
  }

  /** Minimal projection for binary streaming/redirect in the controller. */
  async findContentByPublicId(publicId: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { publicId },
      select: {
        storageKey: true,
        mimeType: true,
        url: true,
      },
    });
  }

  /** Internal id + filename/mime for the move-to-folder flow. */
  async findForMove(publicId: string) {
    return this.prisma.mediaAsset.findUnique({
      where: { publicId },
      select: { id: true, filename: true, mimeType: true },
    });
  }

  // ── Mutations ──────────────────────────────────────────────────────────────────

  async updateStatus(publicId: string, status: AssetStatus, tx?: TransactionClient) {
    return this.db(tx).mediaAsset.update({
      where: { publicId },
      data: { status },
    });
  }

  /** Merge + persist the metadata JSON blob for an asset. */
  async updateMetadata(
    publicId: string,
    metadata: Record<string, unknown>,
    tx?: TransactionClient,
  ) {
    return this.db(tx).mediaAsset.update({
      where: { publicId },
      data: { metadata: metadata as Prisma.InputJsonValue },
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
