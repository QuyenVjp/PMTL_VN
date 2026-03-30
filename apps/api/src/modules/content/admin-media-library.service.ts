import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { NotFoundError, ConflictError } from "../../common/errors/app-error.js";
import type {
  createCollectionSchema,
  updateCollectionSchema,
  listCollectionsSchema,
  addCollectionItemSchema,
  updateCollectionItemSchema,
  listItemsSchema,
} from "./admin-media-library.schemas.js";
import type { z } from "zod";

type CreateCollectionDto  = z.infer<typeof createCollectionSchema>;
type UpdateCollectionDto  = z.infer<typeof updateCollectionSchema>;
type ListCollectionsDto   = z.infer<typeof listCollectionsSchema>;
type AddItemDto           = z.infer<typeof addCollectionItemSchema>;
type UpdateItemDto        = z.infer<typeof updateCollectionItemSchema>;
type ListItemsDto         = z.infer<typeof listItemsSchema>;

@Injectable()
export class AdminMediaLibraryService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Collections ───────────────────────────────────────────────────

  async listCollections(dto: ListCollectionsDto) {
    const where: Record<string, unknown> = {};
    if (dto.status)         where.status         = dto.status;
    if (dto.collectionType) where.collectionType = dto.collectionType;
    if (dto.featured !== undefined) where.featured = dto.featured;
    if (dto.search) {
      where.OR = [
        { title:       { contains: dto.search, mode: "insensitive" } },
        { description: { contains: dto.search, mode: "insensitive" } },
      ];
    }

    const [collections, total] = await Promise.all([
      this.prisma.mediaCollection.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: dto.offset,
        take: dto.limit,
        select: {
          publicId:       true,
          title:          true,
          slug:           true,
          collectionType: true,
          description:    true,
          sourceNote:     true,
          featured:       true,
          sortOrder:      true,
          status:         true,
          publishedAt:    true,
          createdAt:      true,
          updatedAt:      true,
          createdBy: { select: { publicId: true, displayName: true } },
          coverMedia: {
            select: { publicId: true, url: true, filename: true, mimeType: true },
          },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.mediaCollection.count({ where }),
    ]);

    return {
      data: collections.map((c) => ({
        publicId:       c.publicId,
        title:          c.title,
        slug:           c.slug,
        collectionType: c.collectionType,
        description:    c.description,
        sourceNote:     c.sourceNote,
        featured:       c.featured,
        sortOrder:      c.sortOrder,
        status:         c.status,
        publishedAt:    c.publishedAt,
        itemCount:      c._count.items,
        coverImageUrl:  c.coverMedia?.url ?? null,
        coverMediaPublicId: c.coverMedia?.publicId ?? null,
        createdByName:  c.createdBy.displayName,
        createdAt:      c.createdAt,
        updatedAt:      c.updatedAt,
      })),
      meta: {
        pagination: { total, limit: dto.limit, offset: dto.offset, hasMore: dto.offset + dto.limit < total },
      },
    };
  }

  async getCollection(publicId: string) {
    const c = await this.prisma.mediaCollection.findUnique({
      where: { publicId },
      select: {
        publicId:       true,
        title:          true,
        slug:           true,
        collectionType: true,
        description:    true,
        sourceNote:     true,
        featured:       true,
        sortOrder:      true,
        status:         true,
        publishedAt:    true,
        createdAt:      true,
        updatedAt:      true,
        createdBy: { select: { publicId: true, displayName: true } },
        coverMedia: { select: { publicId: true, url: true, filename: true } },
        _count: { select: { items: true } },
      },
    });
    if (!c) throw new NotFoundError("MediaCollection", publicId);

    return {
      data: {
        publicId:           c.publicId,
        title:              c.title,
        slug:               c.slug,
        collectionType:     c.collectionType,
        description:        c.description,
        sourceNote:         c.sourceNote,
        featured:           c.featured,
        sortOrder:          c.sortOrder,
        status:             c.status,
        publishedAt:        c.publishedAt,
        itemCount:          c._count.items,
        coverImageUrl:      c.coverMedia?.url ?? null,
        coverMediaPublicId: c.coverMedia?.publicId ?? null,
        createdByName:      c.createdBy.displayName,
        createdAt:          c.createdAt,
        updatedAt:          c.updatedAt,
      },
    };
  }

  async createCollection(dto: CreateCollectionDto, creatorId: string) {
    const existing = await this.prisma.mediaCollection.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictError("Slug đã tồn tại");

    let coverMediaId: string | null = null;
    if (dto.coverMediaPublicId) {
      const asset = await this.prisma.mediaAsset.findUnique({ where: { publicId: dto.coverMediaPublicId } });
      if (!asset) throw new NotFoundError("MediaAsset", dto.coverMediaPublicId);
      coverMediaId = asset.id;
    }

    const collection = await this.prisma.mediaCollection.create({
      data: {
        publicId:       nanoid(),
        title:          dto.title,
        slug:           dto.slug,
        collectionType: dto.collectionType,
        description:    dto.description ?? null,
        sourceNote:     dto.sourceNote  ?? null,
        coverMediaId:   coverMediaId,
        featured:       dto.featured    ?? false,
        sortOrder:      dto.sortOrder   ?? 0,
        createdById:    creatorId,
      },
    });

    return { data: { publicId: collection.publicId } };
  }

  async updateCollection(publicId: string, dto: UpdateCollectionDto) {
    const existing = await this.prisma.mediaCollection.findUnique({ where: { publicId } });
    if (!existing) throw new NotFoundError("MediaCollection", publicId);

    if (dto.slug && dto.slug !== existing.slug) {
      const slugConflict = await this.prisma.mediaCollection.findUnique({ where: { slug: dto.slug } });
      if (slugConflict) throw new ConflictError("Slug đã tồn tại");
    }

    let coverMediaId: string | null | undefined;
    if (dto.coverMediaPublicId === null) {
      coverMediaId = null;
    } else if (dto.coverMediaPublicId) {
      const asset = await this.prisma.mediaAsset.findUnique({ where: { publicId: dto.coverMediaPublicId } });
      if (!asset) throw new NotFoundError("MediaAsset", dto.coverMediaPublicId);
      coverMediaId = asset.id;
    }

    await this.prisma.mediaCollection.update({
      where: { publicId },
      data: {
        ...(dto.title       !== undefined ? { title:       dto.title }       : {}),
        ...(dto.slug        !== undefined ? { slug:        dto.slug }        : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.sourceNote  !== undefined ? { sourceNote:  dto.sourceNote }  : {}),
        ...(dto.featured    !== undefined ? { featured:    dto.featured }    : {}),
        ...(dto.sortOrder   !== undefined ? { sortOrder:   dto.sortOrder }   : {}),
        ...(coverMediaId    !== undefined ? { coverMediaId }                  : {}),
      },
    });

    return { data: { publicId, updated: true } };
  }

  async publishCollection(publicId: string) {
    const collection = await this.prisma.mediaCollection.findUnique({ where: { publicId } });
    if (!collection) throw new NotFoundError("MediaCollection", publicId);

    await this.prisma.mediaCollection.update({
      where: { publicId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });

    return { data: { publicId, published: true } };
  }

  async unpublishCollection(publicId: string) {
    const collection = await this.prisma.mediaCollection.findUnique({ where: { publicId } });
    if (!collection) throw new NotFoundError("MediaCollection", publicId);

    await this.prisma.mediaCollection.update({
      where: { publicId },
      data: { status: "DRAFT", publishedAt: null },
    });

    return { data: { publicId, unpublished: true } };
  }

  async deleteCollection(publicId: string) {
    const collection = await this.prisma.mediaCollection.findUnique({ where: { publicId } });
    if (!collection) throw new NotFoundError("MediaCollection", publicId);

    await this.prisma.mediaCollection.delete({ where: { publicId } });
    return { data: { publicId, deleted: true } };
  }

  // ── Items ─────────────────────────────────────────────────────────

  async listItems(collectionPublicId: string, dto: ListItemsDto) {
    const collection = await this.prisma.mediaCollection.findUnique({ where: { publicId: collectionPublicId } });
    if (!collection) throw new NotFoundError("MediaCollection", collectionPublicId);

    const items = await this.prisma.mediaCollectionItem.findMany({
      where:   { collectionId: collection.id },
      orderBy: { sortOrder: "asc" },
      skip:    dto.offset,
      take:    dto.limit,
      select: {
        publicId:       true,
        itemType:       true,
        externalUrl:    true,
        title:          true,
        caption:        true,
        ownerModule:    true,
        ownerPublicRef: true,
        sortOrder:      true,
        createdAt:      true,
        mediaAsset: {
          select: { publicId: true, url: true, filename: true, mimeType: true, width: true, height: true, size: true },
        },
      },
    });

    return {
      data: items.map((item) => ({
        publicId:           item.publicId,
        itemType:           item.itemType,
        externalUrl:        item.externalUrl,
        title:              item.title,
        caption:            item.caption,
        ownerModule:        item.ownerModule,
        ownerPublicRef:     item.ownerPublicRef,
        sortOrder:          item.sortOrder,
        createdAt:          item.createdAt,
        mediaAssetPublicId: item.mediaAsset?.publicId ?? null,
        mediaAssetUrl:      item.mediaAsset?.url ?? null,
        mediaAssetFilename: item.mediaAsset?.filename ?? null,
        mediaAssetMimeType: item.mediaAsset?.mimeType ?? null,
        mediaAssetWidth:    item.mediaAsset?.width ?? null,
        mediaAssetHeight:   item.mediaAsset?.height ?? null,
        mediaAssetSize:     item.mediaAsset?.size ?? null,
      })),
    };
  }

  async addItem(collectionPublicId: string, dto: AddItemDto) {
    const collection = await this.prisma.mediaCollection.findUnique({ where: { publicId: collectionPublicId } });
    if (!collection) throw new NotFoundError("MediaCollection", collectionPublicId);

    let mediaAssetId: string | null = null;
    if (dto.mediaAssetPublicId) {
      const asset = await this.prisma.mediaAsset.findUnique({ where: { publicId: dto.mediaAssetPublicId } });
      if (!asset) throw new NotFoundError("MediaAsset", dto.mediaAssetPublicId);
      mediaAssetId = asset.id;
    }

    const maxSort = await this.prisma.mediaCollectionItem.aggregate({
      where: { collectionId: collection.id },
      _max:  { sortOrder: true },
    });

    const item = await this.prisma.mediaCollectionItem.create({
      data: {
        publicId:       nanoid(),
        collectionId:   collection.id,
        itemType:       dto.itemType,
        mediaAssetId,
        externalUrl:    dto.externalUrl,
        title:          dto.title,
        caption:        dto.caption,
        ownerModule:    dto.ownerModule,
        ownerPublicRef: dto.ownerPublicRef,
        sortOrder:      dto.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
      },
    });

    return { data: { publicId: item.publicId } };
  }

  async updateItem(collectionPublicId: string, itemPublicId: string, dto: UpdateItemDto) {
    const collection = await this.prisma.mediaCollection.findUnique({ where: { publicId: collectionPublicId } });
    if (!collection) throw new NotFoundError("MediaCollection", collectionPublicId);

    const item = await this.prisma.mediaCollectionItem.findFirst({
      where: { publicId: itemPublicId, collectionId: collection.id },
    });
    if (!item) throw new NotFoundError("MediaCollectionItem", itemPublicId);

    await this.prisma.mediaCollectionItem.update({
      where: { publicId: itemPublicId },
      data: {
        ...(dto.title     !== undefined ? { title:     dto.title }     : {}),
        ...(dto.caption   !== undefined ? { caption:   dto.caption }   : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      },
    });

    return { data: { publicId: itemPublicId, updated: true } };
  }

  async removeItem(collectionPublicId: string, itemPublicId: string) {
    const collection = await this.prisma.mediaCollection.findUnique({ where: { publicId: collectionPublicId } });
    if (!collection) throw new NotFoundError("MediaCollection", collectionPublicId);

    const item = await this.prisma.mediaCollectionItem.findFirst({
      where: { publicId: itemPublicId, collectionId: collection.id },
    });
    if (!item) throw new NotFoundError("MediaCollectionItem", itemPublicId);

    await this.prisma.mediaCollectionItem.delete({ where: { publicId: itemPublicId } });
    return { data: { publicId: itemPublicId, deleted: true } };
  }
}
