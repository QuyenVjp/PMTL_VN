import { Injectable, OnModuleInit } from "@nestjs/common";
import { FeatureFlagsRepository } from "./feature-flags.repository.js";
import { featureFlagKeys, type FeatureFlagKey } from "./feature-flags.schemas.js";

const FEATURE_FLAG_DESCRIPTIONS: Record<FeatureFlagKey, string> = {
  "notification.push.enabled": "Bật/tắt gửi push notification",
  "notification.email.enabled": "Bật/tắt gửi email notification",
  "offline.bundle.enabled": "Bật/tắt tải bundle offline",
  "search.meilisearch.enabled": "Bật/tắt search qua Meilisearch",
  "community.posting.enabled": "Bật/tắt đăng bài cộng đồng",
  "community.comments.enabled": "Bật/tắt bình luận cộng đồng",
  "engagement.tracking.enabled": "Bật/tắt tracking engagement",
  "maintenance.mode.enabled": "Bật/tắt chế độ bảo trì",
  "wisdom.ai.slug_suggest.enabled": "Bật/tắt gợi ý slug bằng Gemini cho Tri Tuệ",
  "wisdom.ai.translation_draft.enabled": "Bật/tắt tạo bản dịch nháp bằng Gemini cho Tri Tuệ",
  "wisdom_qa.enabled": "Bật/tắt tính năng hỏi đáp công khai (Wisdom Q&A)",
};

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
    const existing = await this.repository.findAll();
    const byKey = new Map(existing.map((flag) => [flag.key, flag]));
    return featureFlagKeys.map((key) => {
      const flag = byKey.get(key);
      if (flag) {
        return flag;
      }
      return {
        key,
        enabled: false,
        description: FEATURE_FLAG_DESCRIPTIONS[key] ?? null,
        metadata: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      };
    });
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
