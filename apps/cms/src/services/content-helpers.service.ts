import { slugify } from "@pmtl/shared";

const EXCERPT_MAX_LENGTH = 220;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function extractLexicalPlainText(content: unknown): string {
  if (typeof content === "string") {
    return content.replace(/\s+/g, " ").trim();
  }

  if (!isRecord(content) || !isRecord(content.root) || !Array.isArray(content.root.children)) {
    return "";
  }

  const chunks: string[] = [];

  const visitNode = (node: unknown): void => {
    if (!isRecord(node)) {
      return;
    }

    if (node.type === "text" && typeof node.text === "string") {
      chunks.push(node.text);
    }

    if (node.type === "linebreak") {
      chunks.push("\n");
    }

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        visitNode(child);
      }
    }

    if (["paragraph", "heading", "quote", "listitem"].includes(String(node.type))) {
      chunks.push("\n");
    }
  };

  for (const child of content.root.children) {
    visitNode(child);
  }

  return chunks.join("").replace(/\s+/g, " ").trim();
}

export function buildExcerptFromText(value: string, maxLength = EXCERPT_MAX_LENGTH): string {
  const plainText = value.trim();

  if (!plainText) {
    return "";
  }

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trim()}...`;
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSlug(input?: string | null, fallback?: string | null): string | undefined {
  const preferred = input?.trim() || fallback?.trim();

  return preferred ? slugify(preferred) : undefined;
}
