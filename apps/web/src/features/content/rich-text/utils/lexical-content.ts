import type { LexicalNode, LexicalRichText } from "@pmtl/shared";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLexicalNodeArray(value: unknown): value is LexicalNode[] {
  return Array.isArray(value) && value.every((node) => isObject(node) && typeof node.type === "string");
}

function wrapLegacyStringToLexical(value: string): LexicalRichText {
  return {
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: value,
            },
          ],
        },
      ],
    },
  };
}

export function isLexicalRichText(value: unknown): value is LexicalRichText {
  if (!isObject(value) || !isObject(value.root)) {
    return false;
  }

  if (value.root.type !== "root") {
    return false;
  }

  return isLexicalNodeArray(value.root.children);
}

export function normalizeLexicalContent(value: unknown): LexicalRichText | null {
  if (isLexicalRichText(value)) {
    return value;
  }

  if (typeof value === "string") {
    const text = value.trim();
    return text ? wrapLegacyStringToLexical(text) : null;
  }

  return null;
}

export function hasLexicalContent(value: unknown): boolean {
  const normalized = normalizeLexicalContent(value);
  if (!normalized) {
    return false;
  }

  return normalized.root.children.length > 0;
}
