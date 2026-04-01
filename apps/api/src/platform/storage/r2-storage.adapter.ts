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
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    const bucket = this.configService.r2Bucket;
    const endpoint = this.configService.r2Endpoint;
    const accessKeyId = this.configService.r2AccessKeyId;
    const secretAccessKey = this.configService.r2SecretAccessKey;

    if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException(
        "Thiếu cấu hình R2 (R2_BUCKET/R2_ENDPOINT/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY)",
      );
    }

    this.bucket = bucket;
    this.baseUrl = this.normalizeBaseUrl(this.configService.publicMediaBaseUrl);
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

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
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
}
