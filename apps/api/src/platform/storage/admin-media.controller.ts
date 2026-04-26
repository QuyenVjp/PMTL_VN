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
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

type MediaListQuery = z.infer<typeof mediaListQuerySchema>;

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
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
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

    const asset = await this.storageService.uploadFile(
      fileBuffer,
      file.originalname,
      file.mimetype,
      user.id,
    );

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

  @Get()
  @ApiOperation({ summary: "Danh sách media assets (admin)" })
  async list(@Query(ZodValidate(mediaListQuerySchema)) query: MediaListQuery) {
    const where: Record<string, unknown> = {};

    if (query.status) {
      where.status = query.status;
    } else {
      where.status = { not: "DELETED" };
    }
    if (query.mimeType) {
      where.mimeType = { startsWith: query.mimeType };
    }
    if (query.search) {
      where.filename = { contains: query.search, mode: "insensitive" };
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
}
