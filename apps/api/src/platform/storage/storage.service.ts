import { Injectable, BadRequestException } from "@nestjs/common";
import { nanoid } from "nanoid";
import { ConfigService } from "../../common/config/config.service.js";
import { LocalStorageAdapter } from "./local-storage.adapter.js";
import { MediaAssetsRepository } from "./media-assets.repository.js";
import { ALL_ALLOWED_TYPES } from "./storage.schemas.js";
import type { StorageInterface } from "./storage.interface.js";

type AllowedMimeType = (typeof ALL_ALLOWED_TYPES)[number];

@Injectable()
export class StorageService {
  private readonly adapter: StorageInterface;

  constructor(
    private readonly configService: ConfigService,
    private readonly localAdapter: LocalStorageAdapter,
    private readonly mediaRepo: MediaAssetsRepository,
  ) {
    // Phase 1: local only
    this.adapter = this.localAdapter;
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    uploaderId: string,
    metadata?: { width?: number; height?: number },
  ) {
    // Validate MIME type
    if (!this.isAllowedMimeType(mimeType)) {
      throw new BadRequestException(`Loại file không được hỗ trợ: ${mimeType}`);
    }

    // Validate size
    const sizeMb = buffer.length / (1024 * 1024);
    const maxSize = this.getMaxSizeForType(mimeType);
    if (sizeMb > maxSize) {
      throw new BadRequestException(`File vượt quá dung lượng cho phép (${maxSize}MB)`);
    }

    // Generate storage key
    const publicId = nanoid(21);
    const ext = this.getExtension(filename);
    const storageKey = `${this.getFolder(mimeType)}/${publicId}${ext}`;

    // Upload to storage
    const url = await this.adapter.upload(storageKey, buffer, mimeType);

    // Create asset record
    const asset = await this.mediaRepo.create({
      publicId,
      filename,
      mimeType,
      size: buffer.length,
      storageKey,
      url,
      uploaderId,
      width: metadata?.width,
      height: metadata?.height,
    });

    // Mark as ready
    await this.mediaRepo.updateStatus(publicId, "READY");

    return asset;
  }

  async deleteFile(publicId: string, requesterId: string) {
    const asset = await this.mediaRepo.findByPublicId(publicId);
    
    if (!asset) {
      throw new BadRequestException("File không tồn tại");
    }

    if (asset.uploaderId !== requesterId) {
      throw new BadRequestException("Không có quyền xóa file này");
    }

    await this.adapter.delete(asset.storageKey);
    await this.mediaRepo.delete(publicId);

    return { success: true };
  }

  async getAsset(publicId: string) {
    return this.mediaRepo.findByPublicId(publicId);
  }

  async getUserAssets(uploaderId: string) {
    return this.mediaRepo.findByUploader(uploaderId);
  }

  private getMaxSizeForType(mimeType: string): number {
    if (mimeType.startsWith("image/")) {
      return this.configService.maxImageMb;
    }
    if (mimeType.startsWith("video/")) {
      return this.configService.maxVideoMb;
    }
    return this.configService.maxDocumentMb;
  }

  private getFolder(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "images";
    if (mimeType.startsWith("video/")) return "videos";
    if (mimeType.startsWith("audio/")) return "audio";
    return "documents";
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot > 0 ? filename.substring(lastDot) : "";
  }

  private isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
    return ALL_ALLOWED_TYPES.includes(mimeType as AllowedMimeType);
  }
}
