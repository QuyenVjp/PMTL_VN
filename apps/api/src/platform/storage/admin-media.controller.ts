import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
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
import type { Request, Response } from "express";
import { RolesGuard } from "../../common/auth/roles.guard.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { RateLimit } from "../../common/decorators/rate-limit.decorator.js";
import { CurrentUser } from "../../common/decorators/current-user.decorator.js";
import type { AuthenticatedUser } from "../../common/auth/auth-request.types.js";
import { ConfigService } from "../../common/config/config.service.js";
import { AdminMediaService } from "./admin-media.service.js";
import type { AuditContext } from "../../platform/audit/audit.service.js";
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
    private readonly service: AdminMediaService,
    private readonly configService: ConfigService,
  ) {}

  /** Build the audit context from the request — actor is the external publicId, IP is hashed downstream. */
  private auditContext(user: AuthenticatedUser, req: Request): AuditContext {
    return {
      actorId: user.publicId,
      actorType: "admin",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };
  }

  @Post("upload")
  @RateLimit("upload.media")
  @ApiOperation({ summary: "Upload media file (admin)" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: 100 * 1024 * 1024 } }))
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
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

    return this.service.upload(
      {
        buffer: fileBuffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        uploaderId: user.id,
        ...(parsedBody.folderPublicId ? { folderPublicId: parsedBody.folderPublicId } : {}),
      },
      this.auditContext(user, req),
    );
  }

  @Get("folders")
  @ApiOperation({ summary: "Danh sách thư mục media (admin)" })
  async listFolders(@Query(ZodValidate(mediaFolderListQuerySchema)) query: MediaFolderListQuery) {
    return this.service.listFolders(query);
  }

  @Post("folders")
  @ApiOperation({ summary: "Tạo thư mục media (admin)" })
  async createFolder(
    @Body(ZodValidate(createMediaFolderSchema)) parsed: CreateMediaFolderInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.createFolder(parsed, user.id, this.auditContext(user, req));
  }

  @Patch("folders/:publicId")
  @ApiOperation({ summary: "Đổi tên thư mục media (admin)" })
  async updateFolder(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(updateMediaFolderSchema)) parsed: UpdateMediaFolderInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.updateFolder(publicId, parsed, this.auditContext(user, req));
  }

  @Delete("folders/:publicId")
  @ApiOperation({ summary: "Xoá thư mục media (admin)" })
  async deleteFolder(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.deleteFolder(publicId, this.auditContext(user, req));
  }

  @Get()
  @ApiOperation({ summary: "Danh sách media assets (admin)" })
  async list(@Query(ZodValidate(mediaListQuerySchema)) query: MediaListQuery) {
    return this.service.list(query);
  }

  @Get(":publicId")
  @ApiOperation({ summary: "Chi tiết media asset (admin)" })
  async detail(@Param("publicId") publicId: string) {
    return this.service.detail(publicId);
  }

  @Get(":publicId/content")
  @Public()
  @Roles()
  @ApiOperation({ summary: "Lấy binary media cho preview/avatar trong admin" })
  async content(
    @Param("publicId") publicId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const asset = await this.service.getContent(publicId);

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
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.updateMetadata(publicId, parsed, this.auditContext(user, req));
  }

  @Patch(":publicId/folder")
  @ApiOperation({ summary: "Chuyển media asset vào thư mục (admin)" })
  async moveToFolder(
    @Param("publicId") publicId: string,
    @Body(ZodValidate(moveMediaAssetSchema)) parsed: MoveMediaAssetInput,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.moveToFolder(publicId, parsed, this.auditContext(user, req));
  }

  @Delete(":publicId")
  @ApiOperation({ summary: "Soft-delete media asset (admin)" })
  async softDelete(
    @Param("publicId") publicId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.service.softDelete(publicId, this.auditContext(user, req));
  }
}
