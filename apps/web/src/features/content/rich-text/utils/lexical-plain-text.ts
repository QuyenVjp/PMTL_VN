import type { LexicalNode } from "@pmtl/shared";

import { normalizeLexicalContent } from "./lexical-content";

type ExtractLexicalPlainTextOptions = {
  maxLength?: number;
};

const BLOCK_NODE_TYPES = new Set(["paragraph", "heading", "quote", "listitem"]);

function appendNodeText(node: LexicalNode, chunks: string[]): void {
  if (node.type === "text" && typeof node.text === "string") {
    chunks.push(node.text);
  }

  if (node.type === "linebreak") {
    chunks.push("\n");
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      appendNodeText(child, chunks);
    }
  }

  if (BLOCK_NODE_TYPES.has(node.type)) {
    chunks.push("\n");
  }
}

export function extractLexicalPlainText(content: unknown, options: ExtractLexicalPlainTextOptions = {}): string {
  if (typeof content === "string") {
    const plainText = content.replace(/\s+/g, " ").trim();
    return options.maxLength ? plainText.slice(0, options.maxLength).trim() : plainText;
  }

  const normalized = normalizeLexicalContent(content);
  if (!normalized) {
    return "";
  }

  const chunks: string[] = [];

  for (const node of normalized.root.children) {
    appendNodeText(node, chunks);
  }

  const plainText = chunks.join("").replace(/\s+/g, " ").trim();
  if (!options.maxLength) {
    return plainText;
  }

  return plainText.slice(0, options.maxLength).trim();
}
