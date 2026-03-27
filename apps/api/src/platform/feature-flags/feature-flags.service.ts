import { Injectable, OnModuleInit } from "@nestjs/common";
import { FeatureFlagsRepository } from "./feature-flags.repository.js";
import type { FeatureFlagKey } from "./feature-flags.schemas.js";

@Injectable()
export class FeatureFlagsService implements OnModuleInit {
  private cache = new Map<string, boolean>();

  constructor(private readonly repository: FeatureFlagsRepository) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  async isEnabled(key: FeatureFlagKey): Promise<boolean> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Fallback to database
    const flag = await this.repository.findByKey(key);
    const enabled = flag?.enabled ?? false;
    this.cache.set(key, enabled);
    return enabled;
  }

  async setEnabled(key: FeatureFlagKey, enabled: boolean): Promise<void> {
    await this.repository.upsert(key, {
      key,
      enabled,
    });
    this.cache.set(key, enabled);
  }

  async getAll() {
    return this.repository.findAll();
  }

  async refreshCache(): Promise<void> {
    const flags = await this.repository.findAll();
    this.cache.clear();
    for (const flag of flags) {
      this.cache.set(flag.key, flag.enabled);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
