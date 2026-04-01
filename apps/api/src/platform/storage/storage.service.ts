/**
 * Storage Service — Upload Hardening (Launch Blocker)
 *
 * Constitution: design/02-platform-baseline/api-runtime/NEST_REQUEST_PIPELINE.md
 * - Upload route must go through: interceptor → validation → storage owner
 * - Upload validation minimum: mime/type allowlist, size limit, count limit
 * - Multer defaults owner: platform/storage bootstrap
 * - Trust filename/originalname from client: FORBIDDEN
 *
 * Hardening checklist:
 * ✓ MIME allowlist validation (Content-Type header)
 * ✓ Magic bytes sniffing (file-type library — rejects type spoofing)
 * ✓ File size limits by type
 * ✓ Secure filename generation (nanoid — never trust client filename)
 * ✓ Delete auth (owner or ADMIN/SUPER_ADMIN)
 * ✓ Virus scan stub (hook for future ClamAV integration)
 * ✓ Audit logging via caller responsibility (appendInTransaction)
 */
import { Injectable, BadRequestException, ForbiddenException, Logger } from "@nestjs/common";
import { nanoid } from "nanoid";
import { fileTypeFromBuffer } from "file-type";
import { SignJWT } from "jose";
import net from "node:net";
import { ConfigService } from "../../common/config/config.service.js";
import { LocalStorageAdapter } from "./local-storage.adapter.js";
import { R2StorageAdapter } from "./r2-storage.adapter.js";
import { MediaAssetsRepository } from "./media-assets.repository.js";
import { ALL_ALLOWED_TYPES, MIME_TO_EXTENSIONS } from "./storage.schemas.js";
import type { StorageInterface } from "./storage.interface.js";
import type { UserRole } from "../../generated/prisma/client.js";

type AllowedMimeType = (typeof ALL_ALLOWED_TYPES)[number];

@Injectable()
export class StorageService {
  private static readonly MISSING_IMAGE_DATA_URI =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  private readonly adapter: StorageInterface;
  private readonly logger = new Logger(StorageService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly localAdapter: LocalStorageAdapter,
    private readonly r2Adapter: R2StorageAdapter,
    private readonly mediaRepo: MediaAssetsRepository,
  ) {
    this.adapter =
      this.configService.storageAdapter === "r2" ? this.r2Adapter : this.localAdapter;
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    uploaderId: string,
    metadata?: { width?: number; height?: number },
  ) {
    // Step 1: Validate declared MIME type against allowlist
    if (!this.isAllowedMimeType(mimeType)) {
      throw new BadRequestException(`Loại file không được hỗ trợ: ${mimeType}`);
    }

    // Step 2: Magic bytes sniffing — reject type spoofing
    const detectedType = await fileTypeFromBuffer(buffer);
    if (detectedType && detectedType.mime !== mimeType) {
      throw new BadRequestException(
        `Nội dung file không khớp với loại khai báo. Khai báo: ${mimeType}, thực tế: ${detectedType.mime}`,
      );
    }
    // If file-type can't detect (e.g., plain text), trust allowlist for known safe types
    if (!detectedType && !this.isSafeUndetectableType(mimeType)) {
      throw new BadRequestException("Không thể xác minh loại file");
    }

    // Step 3: File size limits
    const sizeMb = buffer.length / (1024 * 1024);
    const maxSize = this.getMaxSizeForType(mimeType);
    if (sizeMb > maxSize) {
      throw new BadRequestException(`File vượt quá dung lượng cho phép (${maxSize}MB)`);
    }

    // Step 4: Virus scan (optional by env)
    await this.virusScan(buffer);

    // Step 5: Secure filename — NEVER trust client filename
    const publicId = nanoid(21);
    const ext = this.getSafeExtension(mimeType);
    const storageKey = `${this.getFolder(mimeType)}/${publicId}${ext}`;

    // Step 6: Upload to storage adapter
    const url = await this.adapter.upload(storageKey, buffer, mimeType);

    // Step 7: Create asset record (UPLOADING status)
    const asset = await this.mediaRepo.create({
      publicId,
      filename: this.sanitizeFilename(filename),
      mimeType,
      size: buffer.length,
      storageKey,
      url,
      uploaderId,
      width: metadata?.width,
      height: metadata?.height,
    });

    // Step 8: Mark as ready
    await this.mediaRepo.updateStatus(publicId, "READY");

    return asset;
  }

  /**
   * Delete file — owner or ADMIN/SUPER_ADMIN only.
   * Constitution: "delete auth clear, audit logged"
   */
  async deleteFile(publicId: string, requesterId: string, requesterRole?: UserRole) {
    const asset = await this.mediaRepo.findByPublicId(publicId);

    if (!asset) {
      throw new BadRequestException("File không tồn tại");
    }

    // Owner check + admin override
    const isOwner = asset.uploaderId === requesterId;
    const isAdmin = requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN";
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException("Không có quyền xóa file này");
    }

    await this.adapter.delete(asset.storageKey);
    await this.mediaRepo.delete(publicId);

    return { success: true };
  }

  async getAsset(publicId: string) {
    return this.mediaRepo.findByPublicId(publicId);
  }

  async resolveAssetUrl(publicId: string | null | undefined): Promise<string | null> {
    if (!publicId) return null;
    const asset = await this.mediaRepo.findByPublicId(publicId);
    if (!asset) return null;
    if (this.configService.storageAdapter === "local") {
      const exists = await this.adapter.exists(asset.storageKey);
      if (!exists) {
        this.logger.warn(`Media binary missing for asset ${publicId} (${asset.storageKey})`);
        return StorageService.MISSING_IMAGE_DATA_URI;
      }
    }
    return asset.url;
  }

  async resolveAssetUrlById(id: string | null | undefined): Promise<string | null> {
    if (!id) return null;
    const asset = await this.mediaRepo.findById(id);
    if (!asset) return null;
    if (this.configService.storageAdapter === "local") {
      const exists = await this.adapter.exists(asset.storageKey);
      if (!exists) {
        this.logger.warn(`Media binary missing for asset id ${id} (${asset.storageKey})`);
        return asset.url;
      }
    }
    return asset.url;
  }

  async getUserAssets(uploaderId: string) {
    return this.mediaRepo.findByUploader(uploaderId);
  }

  /**
   * Generate a short-lived signed token for accessing a media file.
   * The token embeds the storageKey so it can only be used for that exact file.
   * Used when MEDIA_REQUIRE_SIGNED_URL=true.
   */
  async generateMediaToken(storageKey: string, ttlMinutes = 15): Promise<string> {
    const rawSecret =
      this.configService.mediaSignedUrlSecret ?? this.configService.jwtAccessSecret;
    const secretBytes = new TextEncoder().encode(rawSecret);
    return new SignJWT({ key: storageKey, purpose: "media" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${ttlMinutes}m`)
      .sign(secretBytes);
  }

  // --- Private hardening helpers ---

  private getMaxSizeForType(mimeType: string): number {
    if (mimeType.startsWith("image/")) return this.configService.maxImageMb;
    if (mimeType.startsWith("video/")) return this.configService.maxVideoMb;
    return this.configService.maxDocumentMb;
  }

  private getFolder(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "images";
    if (mimeType.startsWith("video/")) return "videos";
    if (mimeType.startsWith("audio/")) return "audio";
    return "documents";
  }

  /** Get safe extension from MIME type — never from client filename */
  private getSafeExtension(mimeType: string): string {
    return MIME_TO_EXTENSIONS[mimeType as AllowedMimeType] ?? "";
  }

  /** Sanitize client-provided filename for display only (never used for storage paths) */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^\w\s\-.()]/g, "_")
      .replace(/\s+/g, "_")
      .substring(0, 200);
  }

  /** Types where file-type library can't detect magic bytes but are still safe */
  private isSafeUndetectableType(mimeType: string): boolean {
    return mimeType === "application/pdf";
  }

  private isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
    return ALL_ALLOWED_TYPES.includes(mimeType as AllowedMimeType);
  }

  private async virusScan(buffer: Buffer): Promise<void> {
    if (!this.configService.clamavEnabled) {
      return;
    }
    const result = await this.scanWithClamavInstream(buffer);
    if (!result.ok) {
      throw new BadRequestException(`ClamAV scan lỗi: ${result.reason}`);
    }
    if (result.infected) {
      throw new BadRequestException("File bị phát hiện mã độc");
    }
  }

  private async scanWithClamavInstream(buffer: Buffer): Promise<{ ok: boolean; infected: boolean; reason?: string }> {
    return await new Promise((resolve) => {
      const socket = net.createConnection({
        host: this.configService.clamavHost,
        port: this.configService.clamavPort,
      });

      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ ok: false, infected: false, reason: "scan_timeout" });
      }, this.configService.clamavTimeoutMs);

      let response = "";

      socket.on("connect", () => {
        try {
          socket.write("zINSTREAM\0");

          const chunkSize = 64 * 1024;
          for (let offset = 0; offset < buffer.length; offset += chunkSize) {
            const end = Math.min(offset + chunkSize, buffer.length);
            const chunk = buffer.subarray(offset, end);
            const lenBuf = Buffer.alloc(4);
            lenBuf.writeUInt32BE(chunk.length, 0);
            socket.write(lenBuf);
            socket.write(chunk);
          }

          const endBuf = Buffer.alloc(4);
          endBuf.writeUInt32BE(0, 0);
          socket.write(endBuf);
          socket.end();
        } catch (error) {
          clearTimeout(timeout);
          socket.destroy();
          resolve({
            ok: false,
            infected: false,
            reason: error instanceof Error ? error.message : "scan_write_failed",
          });
        }
      });

      socket.on("data", (data) => {
        response += data.toString("utf8");
      });

      socket.on("end", () => {
        clearTimeout(timeout);
        const normalized = response.toUpperCase();
        if (normalized.includes("FOUND")) {
          resolve({ ok: true, infected: true });
          return;
        }
        if (normalized.includes("OK")) {
          resolve({ ok: true, infected: false });
          return;
        }
        resolve({ ok: false, infected: false, reason: response || "scan_unknown_response" });
      });

      socket.on("error", (error) => {
        clearTimeout(timeout);
        this.logger.warn(`ClamAV unavailable: ${error.message}`);
        resolve({ ok: false, infected: false, reason: "clamav_unreachable" });
      });
    });
  }
}
