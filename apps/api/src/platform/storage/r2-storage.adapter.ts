import { Injectable, InternalServerErrorException } from "@nestjs/common";
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { ConfigService } from "../../common/config/config.service.js";
import type { StorageInterface } from "./storage.interface.js";

@Injectable()
export class R2StorageAdapter implements StorageInterface {
  private readonly client?: S3Client;
  private readonly bucket?: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const bucket = this.configService.r2Bucket;
    const endpoint = this.configService.r2Endpoint;
    const accessKeyId = this.configService.r2AccessKeyId;
    const secretAccessKey = this.configService.r2SecretAccessKey;
    this.baseUrl = this.normalizeBaseUrl(this.configService.publicMediaBaseUrl);

    if (bucket && endpoint && accessKeyId && secretAccessKey) {
      this.bucket = bucket;
      this.client = new S3Client({
        region: this.configService.r2Region,
        endpoint,
        forcePathStyle: this.configService.r2ForcePathStyle,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const client = this.requireClient();
    const bucket = this.requireBucket();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const client = this.requireClient();
    const bucket = this.requireBucket();
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    const client = this.requireClient();
    const bucket = this.requireBucket();
    try {
      await client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
      return true;
    } catch (error) {
      if (error instanceof S3ServiceException) {
        return false;
      }
      throw error;
    }
  }

  private normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  }

  private requireClient(): S3Client {
    if (!this.client) {
      throw new InternalServerErrorException(
        "Thiếu cấu hình R2 (R2_BUCKET/R2_ENDPOINT/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY)",
      );
    }
    return this.client;
  }

  private requireBucket(): string {
    if (!this.bucket) {
      throw new InternalServerErrorException("Thiếu cấu hình R2 bucket");
    }
    return this.bucket;
  }
}
