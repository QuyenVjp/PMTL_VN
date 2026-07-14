import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import type { MediaItemType, PrismaClient } from "../../generated/prisma/client.js";

/**
 * Prisma interactive-transaction client. Excludes lifecycle/extension methods
 * that are not available on the scoped `tx` handed to a `$transaction` callback.
 */
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export interface CreateFolderData {
  publicId: string;
  title: string;
  slug: string;
  createdById: string;
}

export interface UpdateFolderData {
  title: string;
  slug: string;
}

export interface CreateCollectionItemData {
  publicId: string;
  collectionId: string;
  mediaAssetId: string;
  itemType: MediaItemType;
  sortOrder: number;
}

export interface FolderFilter {
  mediaKind?: "image" | "video" | "document";
  mimeType?: string;
}

/**
 * Owns all Prisma access for media folders (mediaCollection with collectionType
 * MEDIA_FOLDER) and their collection-item links. Kept separate from
 * MediaAssetsRepository so each repository stays cohesive and under ~400 lines.
 */
@Injectable()
export class MediaFoldersRepository {
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

  // ── Folders ─────────────────────────────────────────────────────────────────

  /** All non-archived folders with their items' asset mime/status (for itemCount). */
  async listFolders() {
    return this.prisma.mediaCollection.findMany({
      where: {
        collectionType: "MEDIA_FOLDER",
        status: { not: "ARCHIVED" },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        publicId: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            mediaAsset: {
              select: {
                mimeType: true,
                status: true,
              },
            },
          },
        },
      },
    });
  }

  /** Internal id lookup for a folder (update guard). */
  async findFolderRefByPublicId(publicId: string) {
    return this.prisma.mediaCollection.findFirst({
      where: { publicId, collectionType: "MEDIA_FOLDER" },
      select: { id: true },
    });
  }

  /** publicId + title lookup for a folder (delete audit metadata). */
  async findFolderForDelete(publicId: string) {
    return this.prisma.mediaCollection.findFirst({
      where: { publicId, collectionType: "MEDIA_FOLDER" },
      select: { publicId: true, title: true },
    });
  }

  /** Folder internal id + current item count (for computing the next sortOrder). */
  async findFolderIdWithCount(publicId: string) {
    const folder = await this.prisma.mediaCollection.findFirst({
      where: { publicId, collectionType: "MEDIA_FOLDER" },
      select: {
        id: true,
        _count: { select: { items: true } },
      },
    });
    if (!folder) return null;
    return { id: folder.id, itemCount: folder._count.items };
  }

  /**
   * Resolve the next available unique slug for a folder, skipping the row being
   * updated (excludePublicId). The uniqueness loop is pure Prisma, so it lives here.
   */
  async nextFolderSlug(base: string, excludePublicId?: string): Promise<string> {
    let suffix = 0;
    // Bounded by the number of colliding slugs; each iteration is a unique lookup.
    while (true) {
      const slug = suffix === 0 ? base : `${base}-${suffix + 1}`;
      const existing = await this.prisma.mediaCollection.findUnique({
        where: { slug },
        select: { publicId: true },
      });
      if (!existing || existing.publicId === excludePublicId) return slug;
      suffix += 1;
    }
  }

  async createFolder(data: CreateFolderData, tx?: TransactionClient) {
    return this.db(tx).mediaCollection.create({
      data: {
        publicId: data.publicId,
        title: data.title,
        slug: data.slug,
        collectionType: "MEDIA_FOLDER",
        status: "PUBLISHED",
        createdById: data.createdById,
      },
      select: {
        publicId: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateFolder(publicId: string, data: UpdateFolderData, tx?: TransactionClient) {
    return this.db(tx).mediaCollection.update({
      where: { publicId },
      data: { title: data.title, slug: data.slug },
      select: {
        publicId: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
    });
  }

  async deleteFolder(publicId: string, tx?: TransactionClient) {
    return this.db(tx).mediaCollection.delete({ where: { publicId } });
  }

  // ── Collection items ──────────────────────────────────────────────────────────

  async createCollectionItem(data: CreateCollectionItemData, tx?: TransactionClient) {
    return this.db(tx).mediaCollectionItem.create({
      data: {
        publicId: data.publicId,
        collectionId: data.collectionId,
        mediaAssetId: data.mediaAssetId,
        itemType: data.itemType,
        sortOrder: data.sortOrder,
      },
    });
  }

  /** Remove all folder links for an asset (by internal media asset id). */
  async deleteAssetFolderLinks(mediaAssetId: string, tx?: TransactionClient) {
    return this.db(tx).mediaCollectionItem.deleteMany({
      where: {
        mediaAssetId,
        collection: { collectionType: "MEDIA_FOLDER" },
      },
    });
  }
}
