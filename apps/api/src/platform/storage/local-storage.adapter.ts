import { Injectable } from "@nestjs/common";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { ConfigService } from "../../common/config/config.service.js";
import type { StorageInterface } from "./storage.interface.js";

@Injectable()
export class LocalStorageAdapter implements StorageInterface {
  private readonly rootPath: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.rootPath = configService.localStorageRoot || "./uploads";
    this.baseUrl = configService.publicMediaBaseUrl;
  }

  async upload(key: string, buffer: Buffer, mimeType: string): Promise<string> {
    const filePath = path.join(this.rootPath, key);
    const dir = path.dirname(filePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, buffer);

    void mimeType;
    return this.getUrl(key);
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.rootPath, key);
    try {
      await fs.unlink(filePath);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    const filePath = path.join(this.rootPath, key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
