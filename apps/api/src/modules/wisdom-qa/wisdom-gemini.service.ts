import { Injectable } from "@nestjs/common";
import { ValidationError } from "../../common/errors/app-error.js";
import { ConfigService } from "../../common/config/config.service.js";

type GeminiJson = Record<string, unknown>;

@Injectable()
export class WisdomGeminiService {
  constructor(private readonly configService: ConfigService) {}

  async suggestSlug(input: { title: string; sourceCode?: string }): Promise<{ slug: string; model: string }> {
    const model = this.configService.geminiModel;
    const payload = await this.generateJson({
      prompt: [
        "Bạn là trợ lý biên tập cho PMTL.",
        "Nhiệm vụ: gợi ý slug URL tiếng Việt không dấu, chữ thường, ngăn cách bằng dấu gạch ngang.",
        "Chỉ trả về JSON hợp lệ theo schema: {\"slug\":\"string\"}.",
        `Tiêu đề: ${input.title}`,
        input.sourceCode ? `Mã nguồn: ${input.sourceCode}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      temperature: 0.1,
    });

    const suggested = this.readString(payload, "slug");
    const slug = this.slugify(suggested || input.title);
    if (!slug || slug.length < 3) {
      throw new ValidationError("Gemini không tạo được slug hợp lệ");
    }
    return { slug, model };
  }

  async draftTranslation(input: {
    originalText: string;
    title?: string;
    sourceCode?: string;
  }): Promise<{ translatedText: string; model: string }> {
    const model = this.configService.geminiModel;
    const payload = await this.generateJson({
      prompt: [
        "Bạn là trợ lý dịch thuật nháp cho PMTL.",
        "Yêu cầu: tạo bản dịch nháp sang tiếng Việt có dấu, văn phong trung tính, giữ nguyên ý nghĩa, không thêm diễn giải mới.",
        "Không tự xuất bản. Kết quả phải để người biên tập duyệt lại.",
        "Chỉ trả về JSON hợp lệ theo schema: {\"translatedText\":\"string\"}.",
        input.title ? `Tiêu đề tham chiếu: ${input.title}` : "",
        input.sourceCode ? `Mã nguồn tham chiếu: ${input.sourceCode}` : "",
        `Nội dung gốc:\n${input.originalText}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
      temperature: 0.2,
    });

    const translatedText = this.readString(payload, "translatedText");
    if (!translatedText || translatedText.trim().length < 5) {
      throw new ValidationError("Gemini không tạo được bản dịch nháp hợp lệ");
    }
    return { translatedText: translatedText.trim(), model };
  }

  private async generateJson({
    prompt,
    temperature,
  }: {
    prompt: string;
    temperature: number;
  }): Promise<GeminiJson> {
    const apiKey = this.configService.geminiApiKey;
    if (!apiKey) {
      throw new ValidationError("Thiếu cấu hình GEMINI_API_KEY cho lane AI");
    }

    const model = this.configService.geminiModel;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.configService.geminiTimeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new ValidationError("Gemini API trả về lỗi", {
          status: response.status,
          body: text.slice(0, 500),
        });
      }

      const parsed = (await response.json()) as GeminiJson;
      const text = this.extractResponseText(parsed);
      if (!text) {
        throw new ValidationError("Gemini không trả về nội dung khả dụng");
      }

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? text.slice(jsonStart, jsonEnd + 1) : text;

      try {
        return JSON.parse(jsonText) as GeminiJson;
      } catch {
        throw new ValidationError("Gemini trả về JSON không hợp lệ", { preview: text.slice(0, 200) });
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractResponseText(payload: GeminiJson): string | null {
    const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
    const first = candidates[0] as GeminiJson | undefined;
    const content = first?.content as GeminiJson | undefined;
    const parts = Array.isArray(content?.parts) ? content.parts : [];
    for (const part of parts) {
      if (part && typeof part === "object" && typeof (part as GeminiJson).text === "string") {
        return String((part as GeminiJson).text);
      }
    }
    return null;
  }

  private readString(payload: GeminiJson, key: string): string | null {
    const value = payload[key];
    return typeof value === "string" ? value.trim() : null;
  }

  private slugify(input: string): string {
    return input
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
  }
}
