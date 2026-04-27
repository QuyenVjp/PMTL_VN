import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  StreamableFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes } from "@nestjs/swagger";
import { z } from "zod";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Response } from "express";
import { nanoid } from "nanoid";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RateLimit } from "../../common/decorators/rate-limit.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { ConfigService } from "../../common/config/config.service.js";
import { StorageService } from "./storage.service.js";
import { AuditService } from "../../platform/audit/audit.service.js";
import { NotFoundError } from "../../common/errors/app-error.js";
import { ZodValidate } from "../../common/validation/zod-validation.pipe.js";

const mediaListQuerySchema = z.object({
  status: z
    .enum(["UPLOADING", "READY", "ORPHANED", "DELETED"])
    .optional(),
  mimeType: z.string().optional(),
  mediaKind: z.enum(["image", "video", "document"]).optional(),
  folderPublicId: z.string().trim().min(1).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

type MediaListQuery = z.infer<typeof mediaListQuerySchema>;

const mediaFolderListQuerySchema = z.object({
  mimeType: z.string().optional(),
  mediaKind: z.enum(["image", "video", "document"]).optional(),
});

type MediaFolderListQuery = z.infer<typeof mediaFolderListQuerySchema>;

const createMediaFolderSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

type CreateMediaFolderInput = z.infer<typeof createMediaFolderSchema>;

const updateMediaFolderSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

type UpdateMediaFolderInput = z.infer<typeof updateMediaFolderSchema>;

const moveMediaAssetSchema = z.object({
  folderPublicId: z.string().trim().min(1).nullable().optional(),
});

type MoveMediaAssetInput = z.infer<typeof moveMediaAssetSchema>;

const uploadMediaFieldsSchema = z.object({
  folderPublicId: z.string().trim().min(1).optional(),
});

type UploadMediaFields = z.infer<typeof uploadMediaFieldsSchema>;

const updateMediaMetadataSchema = z.object({
  altText:     z.string().max(500).optional(),
  caption:     z.string().max(1000).optional(),
  description: z.string().max(2000).optional(),
});

type UpdateMediaMetadataInput = z.infer<typeof updateMediaMetadataSchema>;

@ApiTags("admin-media")
@Controller("admin/media")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminMediaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
    private readonly audit: AuditService,
  ) {}

  @Post("upload")
  @RateLimit("upload.media")
  @ApiOperation({ summary: "Upload media file (admin)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 100 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException("Chưa chọn file để upload");
    }

    const fileBuffer = file.buffer?.length
      ? file.buffer
      : file.path
        ? await fs.readFile(file.path)
        : null;

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException("File upload không hợp lệ hoặc rỗng");
    }

    const parsedBody = uploadMediaFieldsSchema.parse(body);

    const asset = await this.storageService.uploadFile(
      fileBuffer,
      file.originalname,
      file.mimetype,
      user.id,
    );

    if (parsedBody.folderPublicId) {
      await this.addAssetToFolder(parsedBody.folderPublicId, asset.id, asset.mimeType);
    }

    await this.audit.append(
      { actorId: user.id, actorType: "user" },
      "media.upload",
      "media_asset",
      asset.publicId,
      { filename: asset.filename, mimeType: asset.mimeType, size: asset.size },
    );

    return {
      data: {
        publicId: asset.publicId,
        url: asset.url,
        filename: asset.filename,
        mimeType: asset.mimeType,
        size: asset.size,
      },
    };
  }

  @Get("folders")
  @ApiOperation({ summary: "Danh sách thư mục media (admin)" })
  async listFolders(@Query(ZodValidate(mediaFolderListQuerySchema)) query: MediaFolderListQuery) {
    const folders = await this.prisma.mediaCollection.findMany({
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

    const data = folders.map((folder) => {
      const itemCount = folder.items.filter((item) => {
        const asset = item.mediaAsset;
        if (!asset || asset.status === "DELETED") return false;
        return this.matchesMediaFilter(asset.mimeType, query.mediaKind, query.mimeType);
      }).length;

      return {
        publicId: folder.publicId,
        name: folder.title,
        slug: folder.slug,
        itemCount,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      };
    });

    return { data };
  }

  @Post("folders")
  @ApiOperation({ summary: "Tạo thư mục media (admin)" })
  async createFolder(
    @Body(ZodValidate(createMediaFolderSchema)) parsed: CreateMediaFolderInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const slugBase = this.slugifyFolderName(parsed.name);
    const slug = await this.nextFolderSlug(slugBase);
    const folder = await this.prisma.mediaCollection.create({
      data: {
        publicId: nanoid(21),
        title: parsed.name,
        slug,
        collectionType: "MEDIA_FOLDER",
        status: "PUBLISHED",
        createdById: user.id,
      },
      select: {
        publicId: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await this.audit.append(
      { actorId: user.id, actorType: "user" },
      "media.folder.create",
      "media_collection",
      folder.publicId,
      { title: folder.title, slug: folder.slug },
    );

    return {
      data: {
        publicId: folder.publicId,
        name: folder.title,
        slug: folder.slug,
        itemCount: 0,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
      },
    };
  }

  @Patch("folders/:publicId")
  @ApiOperation({ summary: "Đổi tên thư mục media (admin)" })
  async updateFolder(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateMediaFolderSchema)) parsed: UpdateMediaFolderInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const folder = await this.prisma.mediaCollection.findFirst({
      where: { publicId, collectionType: "MEDIA_FOLDER" },
      select: { id: true },
    });

    if (!folder) {
      throw new NotFoundError("Media folder", publicId);
    }

    const slugBase = this.slugifyFolderName(parsed.name);
    const slug = await this.nextFolderSlug(slugBase, publicId);
    const updated = await this.prisma.mediaCollection.update({
      where: { publicId },
      data: { title: parsed.name, slug },
      select: {
        publicId: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { items: true } },
      },
    });

    await this.audit.append(
      { actorId: user.id, actorType: "user" },
      "media.folder.update",
      "media_collection",
      publicId,
      { title: updated.title, slug: updated.slug },
    );

    return {
      data: {
        publicId: updated.publicId,
        name: updated.title,
        slug: updated.slug,
        itemCount: updated._count.items,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  }

  @Delete("folders/:publicId")
  @ApiOperation({ summary: "Xoá thư mục media (admin)" })
  async deleteFolder(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const folder = await this.prisma.mediaCollection.findFirst({
      where: { publicId, collectionType: "MEDIA_FOLDER" },
      select: { publicId: true, title: true },
    });

    if (!folder) {
      throw new NotFoundError("Media folder", publicId);
    }

    await this.prisma.mediaCollection.delete({ where: { publicId } });

    await this.audit.append(
      { actorId: user.id, actorType: "user" },
      "media.folder.delete",
      "media_collection",
      publicId,
      { title: folder.title },
    );

    return { data: { publicId, deleted: true } };
  }

  @Get()
  @ApiOperation({ summary: "Danh sách media assets (admin)" })
  async list(@Query(ZodValidate(mediaListQuerySchema)) query: MediaListQuery) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = { not: "DELETED" };
    }
    if (query.mediaKind === "image") {
      where.mimeType = { startsWith: "image/" };
    } else if (query.mediaKind === "video") {
      where.mimeType = { startsWith: "video/" };
    } else if (query.mediaKind === "document") {
      where.AND = [
        { mimeType: { not: { startsWith: "image/" } } },
        { mimeType: { not: { startsWith: "video/" } } },
      ];
    } else if (query.mimeType) {
      where.mimeType = { startsWith: query.mimeType };
    }
    if (query.search) {
      where.filename = { contains: query.search, mode: "insensitive" };
    }
    if (query.folderPublicId) {
      where.collectionItems = {
        some: {
          collection: {
            publicId: query.folderPublicId,
            collectionType: "MEDIA_FOLDER",
          },
        },
      };
    }

    const [assets, total] = await Promise.all([
      this.prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: query.offset,
        take: query.limit,
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

    const data = await Promise.all(
      assets.map(async (a) => ({
        publicId: a.publicId,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        url: (await this.storageService.resolveAssetUrl(a.publicId)) ?? a.url,
        width: a.width,
        height: a.height,
        status: a.status,
        uploaderPublicId: a.uploader.publicId,
        uploaderName: a.uploader.displayName,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    );

    return {
      data,
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

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết media asset (admin)" })
  async detail(@Param("publicId") publicId: string) {
    const asset = await this.prisma.mediaAsset.findUnique({
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

    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    return {
      data: {
        publicId: asset.publicId,
        filename: asset.filename,
        mimeType: asset.mimeType,
        size: asset.size,
        storageKey: asset.storageKey,
        url: (await this.storageService.resolveAssetUrl(asset.publicId)) ?? asset.url,
        width: asset.width,
        height: asset.height,
        status: asset.status,
        metadata: asset.metadata,
        uploaderPublicId: asset.uploader.publicId,
        uploaderName: asset.uploader.displayName,
        uploaderEmail: asset.uploader.email,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    };
  }

  @Get(":publicId/content")
  @Public()
  @Roles()
  @ApiOperation({ summary: "Lấy binary media cho preview/avatar trong admin" })
  async content(
    @Param("publicId") publicId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { publicId },
      select: {
        storageKey: true,
        mimeType: true,
        url: true,
      },
    });

    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    if (this.configService.storageAdapter !== "local") {
      res.redirect(asset.url);
      return;
    }

    const root = this.configService.localStorageRoot || "./uploads";
    const absolutePath = path.resolve(root, asset.storageKey);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(absolutePath);
    } catch {
      throw new NotFoundError("Media file", publicId);
    }

    res.setHeader("Content-Type", asset.mimeType);
    res.setHeader("Cache-Control", "private, max-age=300");
    return new StreamableFile(buffer);
  }

  @Patch(":publicId")
  @ApiOperation({ summary: "Cập nhật metadata media asset (admin)" })
  async updateMetadata(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateMediaMetadataSchema)) parsed: UpdateMediaMetadataInput,
  ) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { publicId } });
    if (!asset) throw new NotFoundError("Media asset", publicId);

    const existingMeta = (asset.metadata as Record<string, unknown> | null) ?? {};
    const updatedMeta = { ...existingMeta, ...parsed };

    await this.prisma.mediaAsset.update({
      where: { publicId },
      data: { metadata: updatedMeta },
    });

    return { data: { publicId, updated: true } };
  }

  @Patch(":publicId/folder")
  @ApiOperation({ summary: "Chuyển media asset vào thư mục (admin)" })
  async moveToFolder(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(moveMediaAssetSchema)) parsed: MoveMediaAssetInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { publicId },
      select: { id: true, filename: true, mimeType: true },
    });

    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    await this.prisma.mediaCollectionItem.deleteMany({
      where: {
        mediaAssetId: asset.id,
        collection: { collectionType: "MEDIA_FOLDER" },
      },
    });

    if (parsed.folderPublicId) {
      await this.addAssetToFolder(parsed.folderPublicId, asset.id, asset.mimeType);
    }

    await this.audit.append(
      { actorId: user.id, actorType: "user" },
      "media.folder.move_asset",
      "media_asset",
      publicId,
      { filename: asset.filename, folderPublicId: parsed.folderPublicId ?? null },
    );

    return { data: { publicId, folderPublicId: parsed.folderPublicId ?? null } };
  }

  @Delete(":publicId")
  @ApiOperation({ summary: "Soft-delete media asset (admin)" })
  async softDelete(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { publicId },
    });

    if (!asset) {
      throw new NotFoundError("Media asset", publicId);
    }

    await this.prisma.mediaAsset.update({
      where: { publicId },
      data: { status: "DELETED" },
    });

    await this.audit.append(
      { actorId: user.id, actorType: "user" },
      "media.delete",
      "media_asset",
      publicId,
      { filename: asset.filename, mimeType: asset.mimeType },
    );

    return { data: { publicId, deleted: true } };
  }

  private async addAssetToFolder(folderPublicId: string, mediaAssetId: string, mimeType: string) {
    const folder = await this.prisma.mediaCollection.findFirst({
      where: { publicId: folderPublicId, collectionType: "MEDIA_FOLDER" },
      select: {
        id: true,
        _count: { select: { items: true } },
      },
    });

    if (!folder) {
      throw new NotFoundError("Media folder", folderPublicId);
    }

    await this.prisma.mediaCollectionItem.create({
      data: {
        publicId: nanoid(21),
        collectionId: folder.id,
        mediaAssetId,
        itemType: this.itemTypeForMime(mimeType),
        sortOrder: folder._count.items + 1,
      },
    });
  }

  private itemTypeForMime(mimeType: string) {
    if (mimeType.startsWith("image/")) return "IMAGE";
    if (mimeType.startsWith("video/")) return "UPLOADED_VIDEO";
    return "DOCUMENT";
  }

  private matchesMediaFilter(mimeType: string, mediaKind?: "image" | "video" | "document", mimePrefix?: string) {
    if (mediaKind === "image") return mimeType.startsWith("image/");
    if (mediaKind === "video") return mimeType.startsWith("video/");
    if (mediaKind === "document") return !mimeType.startsWith("image/") && !mimeType.startsWith("video/");
    return mimePrefix ? mimeType.startsWith(mimePrefix) : true;
  }

  private slugifyFolderName(name: string) {
    const slug = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || `thu-muc-${nanoid(6).toLowerCase()}`;
  }

  private async nextFolderSlug(base: string, excludePublicId?: string) {
    let suffix = 0;
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
}
