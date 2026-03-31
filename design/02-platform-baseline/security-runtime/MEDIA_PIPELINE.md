# MEDIA_PIPELINE — Upload Security & Asset Management

File này chốt pipeline xử lý media upload cho PMTL_VN.

> **Related**: `design/02-platform-baseline/security-runtime/`, `apps/api/src/platform/storage/`

---

## 1. Pipeline Overview

```
User uploads file
        │
        ▼
┌───────────────────────────────────────┐
│ 1. Pre-validation                     │
│    - Size limit check                 │
│    - Extension whitelist              │
│    - Rate limit per user              │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 2. MIME Detection (magic bytes)       │
│    - Read actual file type            │
│    - Reject extension mismatch        │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 3. Virus Scan (ClamAV)                │
│    - Scan for malware                 │
│    - Quarantine infected files        │
│    - Log to audit                     │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 4. Image Processing                   │
│    - Strip EXIF metadata              │
│    - Generate thumbnails              │
│    - Convert to WebP (optional)       │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 5. Deduplication                      │
│    - SHA-256 hash of content          │
│    - Check existing hash              │
│    - Reuse if exists                  │
└───────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│ 6. Storage                            │
│    - Store to local/S3                │
│    - CDN cache headers                │
│    - Return public URL                │
└───────────────────────────────────────┘
```

---

## 2. File Type Whitelist

### Images
| Extension | MIME Type | Max Size |
|-----------|-----------|----------|
| `.jpg`, `.jpeg` | `image/jpeg` | 10 MB |
| `.png` | `image/png` | 10 MB |
| `.gif` | `image/gif` | 5 MB |
| `.webp` | `image/webp` | 10 MB |
| `.svg` | `image/svg+xml` | 1 MB (sanitized) |

### Documents
| Extension | MIME Type | Max Size |
|-----------|-----------|----------|
| `.pdf` | `application/pdf` | 20 MB |

### Audio (Phase 2)
| Extension | MIME Type | Max Size |
|-----------|-----------|----------|
| `.mp3` | `audio/mpeg` | 50 MB |
| `.m4a` | `audio/mp4` | 50 MB |

---

## 3. MIME Detection Service

```typescript
// apps/api/src/platform/storage/mime-detector.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { fileTypeFromBuffer } from "file-type";

const ALLOWED_MIMES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],
  "application/pdf": [".pdf"],
};

@Injectable()
export class MimeDetectorService {
  async validate(
    buffer: Buffer,
    originalName: string,
  ): Promise<{ mime: string; ext: string }> {
    // 1. Detect actual MIME from magic bytes
    const detected = await fileTypeFromBuffer(buffer);

    // 2. Get claimed extension
    const claimedExt = this.getExtension(originalName).toLowerCase();

    // 3. Handle SVG separately (text-based, no magic bytes)
    if (claimedExt === ".svg") {
      return this.validateSvg(buffer);
    }

    // 4. Check detection result
    if (!detected) {
      throw new BadRequestException("Không thể xác định loại tệp tin");
    }

    // 5. Check if MIME is allowed
    const allowedExts = ALLOWED_MIMES[detected.mime];
    if (!allowedExts) {
      throw new BadRequestException(
        `Loại tệp ${detected.mime} không được hỗ trợ`,
      );
    }

    // 6. Check extension matches claimed type
    if (!allowedExts.includes(claimedExt)) {
      throw new BadRequestException(
        `Phần mở rộng ${claimedExt} không khớp với nội dung tệp (${detected.mime})`,
      );
    }

    return { mime: detected.mime, ext: detected.ext };
  }

  private validateSvg(buffer: Buffer): { mime: string; ext: string } {
    const content = buffer.toString("utf8", 0, 1000);

    // Basic SVG validation
    if (!content.includes("<svg") || !content.includes("xmlns")) {
      throw new BadRequestException("Tệp SVG không hợp lệ");
    }

    // Check for dangerous elements
    const dangerous = [
      "<script",
      "javascript:",
      "onclick",
      "onerror",
      "onload",
      "<foreignObject",
    ];

    for (const pattern of dangerous) {
      if (content.toLowerCase().includes(pattern)) {
        throw new BadRequestException("Tệp SVG chứa nội dung không an toàn");
      }
    }

    return { mime: "image/svg+xml", ext: "svg" };
  }

  private getExtension(filename: string): string {
    const match = filename.match(/\.[^.]+$/);
    return match ? match[0] : "";
  }
}
```

---

## 4. ClamAV Virus Scan

### Docker Sidecar

```yaml
# compose.prod.yml - ClamAV sidecar
services:
  clamav:
    image: clamav/clamav:1.4
    restart: unless-stopped
    volumes:
      - clamav-data:/var/lib/clamav
    # Socket-based for performance
    command: ["clamd", "--socket=/var/run/clamav/clamd.sock"]
    healthcheck:
      test: ["CMD", "clamdscan", "--ping", "3"]
      interval: 60s
      timeout: 10s
      retries: 3

  api:
    depends_on:
      clamav:
        condition: service_healthy
    volumes:
      - clamav-socket:/var/run/clamav:ro

volumes:
  clamav-data:
  clamav-socket:
```

### Scan Service

```typescript
// apps/api/src/platform/storage/virus-scanner.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { spawn } from "child_process";

export interface ScanResult {
  clean: boolean;
  threat?: string;
  scannedAt: Date;
}

@Injectable()
export class VirusScannerService {
  private readonly logger = new Logger(VirusScannerService.name);
  private enabled = process.env.CLAMAV_ENABLED === "true";

  async scan(filePath: string): Promise<ScanResult> {
    if (!this.enabled) {
      this.logger.warn("ClamAV disabled, skipping scan");
      return { clean: true, scannedAt: new Date() };
    }

    return new Promise((resolve, reject) => {
      const clam = spawn("clamdscan", ["--no-summary", filePath]);
      
      let stdout = "";
      let stderr = "";

      clam.stdout.on("data", (data) => (stdout += data.toString()));
      clam.stderr.on("data", (data) => (stderr += data.toString()));

      clam.on("close", (code) => {
        const scannedAt = new Date();

        if (code === 0) {
          // Clean
          resolve({ clean: true, scannedAt });
        } else if (code === 1) {
          // Virus found
          const threat = this.parseThreat(stdout);
          this.logger.error({
            msg: "virus.detected",
            filePath,
            threat,
          });
          resolve({ clean: false, threat, scannedAt });
        } else {
          // Error
          reject(new Error(`ClamAV error: ${stderr}`));
        }
      });
    });
  }

  private parseThreat(output: string): string {
    // Output format: "/path/file: ThreatName FOUND"
    const match = output.match(/:\s+(.+?)\s+FOUND/);
    return match ? match[1] : "Unknown threat";
  }
}
```

---

## 5. Image Processing

```typescript
// apps/api/src/platform/storage/image-processor.service.ts
import { Injectable, Logger } from "@nestjs/common";
import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  thumbnails: Map<string, Buffer>;
}

const THUMBNAIL_SIZES = {
  thumb: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 800, height: 600 },
};

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  async process(
    buffer: Buffer,
    options: { generateThumbnails?: boolean; convertToWebP?: boolean } = {},
  ): Promise<ProcessedImage> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // 1. Strip EXIF metadata (privacy)
    image.rotate(); // Auto-rotate based on EXIF, then strip
    
    let processed = image.withMetadata({
      exif: undefined, // Strip EXIF
      icc: undefined,  // Strip ICC profile
    });

    // 2. Optionally convert to WebP
    if (options.convertToWebP && metadata.format !== "webp") {
      processed = processed.webp({ quality: 85 });
    }

    const processedBuffer = await processed.toBuffer();
    const finalMeta = await sharp(processedBuffer).metadata();

    // 3. Generate thumbnails
    const thumbnails = new Map<string, Buffer>();
    
    if (options.generateThumbnails) {
      for (const [name, size] of Object.entries(THUMBNAIL_SIZES)) {
        const thumbBuffer = await sharp(buffer)
          .resize(size.width, size.height, {
            fit: "cover",
            position: "attention", // Smart crop
          })
          .webp({ quality: 80 })
          .toBuffer();
        
        thumbnails.set(name, thumbBuffer);
      }
    }

    return {
      buffer: processedBuffer,
      width: finalMeta.width || 0,
      height: finalMeta.height || 0,
      format: finalMeta.format || "unknown",
      thumbnails,
    };
  }
}
```

---

## 6. Deduplication

```typescript
// apps/api/src/platform/storage/dedup.service.ts
import { Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service.js";

@Injectable()
export class DedupService {
  constructor(private readonly prisma: PrismaService) {}

  computeHash(buffer: Buffer): string {
    return createHash("sha256").update(buffer).digest("hex");
  }

  async findExisting(hash: string): Promise<string | null> {
    const existing = await this.prisma.mediaAsset.findFirst({
      where: { contentHash: hash },
      select: { storageKey: true },
    });
    return existing?.storageKey ?? null;
  }

  async isDuplicate(buffer: Buffer): Promise<{
    duplicate: boolean;
    hash: string;
    existingKey?: string;
  }> {
    const hash = this.computeHash(buffer);
    const existingKey = await this.findExisting(hash);

    return {
      duplicate: !!existingKey,
      hash,
      existingKey: existingKey ?? undefined,
    };
  }
}
```

---

## 7. CDN Cache Invalidation

```typescript
// apps/api/src/platform/storage/cdn.service.ts
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class CdnService {
  private readonly logger = new Logger(CdnService.name);
  private readonly cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  private readonly cfZoneId = process.env.CLOUDFLARE_ZONE_ID;

  async invalidate(urls: string[]): Promise<void> {
    if (!this.cfApiToken || !this.cfZoneId) {
      this.logger.warn("Cloudflare not configured, skipping CDN invalidation");
      return;
    }

    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${this.cfZoneId}/purge_cache`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.cfApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: urls }),
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Cloudflare purge failed: ${error}`);
      }

      this.logger.log({
        msg: "cdn.cache.invalidated",
        urls: urls.length,
      });
    } catch (error) {
      this.logger.error({
        msg: "cdn.cache.invalidation.failed",
        error: (error as Error).message,
      });
      // Don't throw - CDN invalidation is best-effort
    }
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    // For prefix-based invalidation (Cloudflare Pro+)
    await this.invalidate([`${process.env.CDN_BASE_URL}/${prefix}*`]);
  }
}
```

---

## 8. Upload Controller Integration

```typescript
// apps/api/src/platform/storage/upload.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MimeDetectorService } from "./mime-detector.service.js";
import { VirusScannerService } from "./virus-scanner.service.js";
import { ImageProcessorService } from "./image-processor.service.js";
import { DedupService } from "./dedup.service.js";
import { StorageService } from "./storage.service.js";
import { AuditService } from "../audit/audit.service.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Controller("api/upload")
export class UploadController {
  constructor(
    private readonly mimeDetector: MimeDetectorService,
    private readonly virusScanner: VirusScannerService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly dedup: DedupService,
    private readonly storage: StorageService,
    private readonly audit: AuditService,
  ) {}

  @Post("image")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // 1. Validate MIME
    const { mime } = await this.mimeDetector.validate(
      file.buffer,
      file.originalname,
    );

    // 2. Virus scan
    const scanResult = await this.virusScanner.scan(file.path);
    if (!scanResult.clean) {
      await this.audit.log({
        action: "upload.virus_detected",
        target: file.originalname,
        details: { threat: scanResult.threat },
      });
      throw new BadRequestException("Tệp không an toàn");
    }

    // 3. Check deduplication
    const dupCheck = await this.dedup.isDuplicate(file.buffer);
    if (dupCheck.duplicate) {
      return {
        url: this.storage.getPublicUrl(dupCheck.existingKey!),
        deduplicated: true,
      };
    }

    // 4. Process image
    const processed = await this.imageProcessor.process(file.buffer, {
      generateThumbnails: true,
      convertToWebP: mime !== "image/gif", // Keep GIF animated
    });

    // 5. Store
    const key = await this.storage.store({
      buffer: processed.buffer,
      hash: dupCheck.hash,
      mime,
      metadata: {
        width: processed.width,
        height: processed.height,
      },
    });

    // 6. Store thumbnails
    for (const [name, thumbBuffer] of processed.thumbnails) {
      await this.storage.storeThumbnail(key, name, thumbBuffer);
    }

    // 7. Audit log
    await this.audit.log({
      action: "upload.image",
      target: key,
      details: {
        originalName: file.originalname,
        size: file.size,
        mime,
      },
    });

    return {
      url: this.storage.getPublicUrl(key),
      thumbnails: {
        thumb: this.storage.getThumbnailUrl(key, "thumb"),
        small: this.storage.getThumbnailUrl(key, "small"),
        medium: this.storage.getThumbnailUrl(key, "medium"),
      },
    };
  }
}
```

---

## 9. Checklist

- [ ] MIME detection with magic bytes
- [ ] SVG sanitization
- [ ] ClamAV sidecar in compose.prod.yml
- [ ] Virus scan integration
- [ ] EXIF stripping
- [ ] Thumbnail generation (3 sizes)
- [ ] Content-based deduplication (SHA-256)
- [ ] CDN cache invalidation
- [ ] Audit logging for all uploads
- [ ] Rate limiting per user
- [ ] Storage quota per user

---

*Owner: `apps/api/src/platform/storage/` · Last updated: 2026-03-31*
