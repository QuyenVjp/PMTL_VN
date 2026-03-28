import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes } from "@nestjs/swagger";
import { z } from "zod";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { StorageService } from "./storage.service.js";
import { NotFoundError } from "../../common/errors/app-error.js";

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

@ApiTags("admin-media")
@Controller("admin/media")
@UseGuards(RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class AdminMediaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  @Post("upload")
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

    const asset = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      user.id,
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
  async list(@Query() rawQuery: Record<string, unknown>) {
    const query: MediaListQuery = mediaListQuerySchema.parse(rawQuery);

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

    return {
      data: assets.map((a) => ({
        publicId: a.publicId,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        url: a.url,
        width: a.width,
        height: a.height,
        status: a.status,
        uploaderPublicId: a.uploader.publicId,
        uploaderName: a.uploader.displayName,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
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
        url: asset.url,
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

  @Delete(":publicId")
  @ApiOperation({ summary: "Soft-delete media asset (admin)" })
  async softDelete(@Param("publicId") publicId: string) {
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

    return { data: { publicId, deleted: true } };
  }
}
