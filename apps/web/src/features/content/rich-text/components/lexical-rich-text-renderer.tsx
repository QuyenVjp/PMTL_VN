import type { LexicalNode } from "@pmtl/shared";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { normalizeLexicalContent } from "../utils/lexical-content";
import styles from "./lexical-rich-text-renderer.module.css";

type LexicalRichTextRendererProps = {
  content: unknown;
  className?: string;
  emptyFallback?: ReactNode;
};

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 1 << 1;
const FORMAT_STRIKETHROUGH = 1 << 2;
const FORMAT_UNDERLINE = 1 << 3;
const FORMAT_CODE = 1 << 4;
const FORMAT_SUBSCRIPT = 1 << 5;
const FORMAT_SUPERSCRIPT = 1 << 6;

function applyTextFormat(text: ReactNode, format: unknown): ReactNode {
  if (typeof format !== "number") {
    return text;
  }

  let output = text;

  if (format & FORMAT_CODE) {
    output = <code>{output}</code>;
  }
  if (format & FORMAT_BOLD) {
    output = <strong>{output}</strong>;
  }
  if (format & FORMAT_ITALIC) {
    output = <em>{output}</em>;
  }
  if (format & FORMAT_UNDERLINE) {
    output = <u>{output}</u>;
  }
  if (format & FORMAT_STRIKETHROUGH) {
    output = <s>{output}</s>;
  }
  if (format & FORMAT_SUBSCRIPT) {
    output = <sub>{output}</sub>;
  }
  if (format & FORMAT_SUPERSCRIPT) {
    output = <sup>{output}</sup>;
  }

  return output;
}

function sanitizeLinkHref(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const href = value.trim();
  if (!href) {
    return null;
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return href;
  }

  try {
    const parsed = new URL(href);
    if (parsed.protocol === "http:" || parsed.protocol === "https:" || parsed.protocol === "mailto:" || parsed.protocol === "tel:") {
      return href;
    }
  } catch {
    return null;
  }

  return null;
}

function renderChildren(node: LexicalNode, keyPrefix: string): ReactNode[] {
  if (!Array.isArray(node.children)) {
    return [];
  }

  return node.children.map((child, index) => renderNode(child, `${keyPrefix}-${index}`));
}

function renderNode(node: LexicalNode, key: string): ReactNode {
  switch (node.type) {
    case "text": {
      const text = typeof node.text === "string" ? node.text : "";
      return <span key={key}>{applyTextFormat(text, node.format)}</span>;
    }
    case "linebreak": {
      return <br key={key} />;
    }
    case "heading": {
      const tag = typeof node.tag === "string" ? node.tag : "h2";
      const children = renderChildren(node, key);

      if (tag === "h1") return <h1 key={key} className={styles.h1}>{children}</h1>;
      if (tag === "h2") return <h2 key={key} className={styles.h2}>{children}</h2>;
      if (tag === "h3") return <h3 key={key} className={styles.h3}>{children}</h3>;
      if (tag === "h4") return <h4 key={key} className={styles.h4}>{children}</h4>;
      if (tag === "h5") return <h5 key={key} className={styles.h5}>{children}</h5>;
      return <h6 key={key} className={styles.h6}>{children}</h6>;
    }
    case "paragraph": {
      return <p key={key} className={styles.paragraph}>{renderChildren(node, key)}</p>;
    }
    case "quote": {
      return <blockquote key={key} className={styles.quote}>{renderChildren(node, key)}</blockquote>;
    }
    case "list": {
      const listType = typeof node.listType === "string" ? node.listType : "bullet";
      const children = renderChildren(node, key);

      if (listType === "number") {
        return <ol key={key} className={styles.orderedList}>{children}</ol>;
      }

      return <ul key={key} className={styles.unorderedList}>{children}</ul>;
    }
    case "listitem": {
      return <li key={key} className={styles.listItem}>{renderChildren(node, key)}</li>;
    }
    case "link": {
      const href = sanitizeLinkHref(node.url);
      const children = renderChildren(node, key);

      if (!href) {
        return <span key={key}>{children}</span>;
      }

      const isExternal = href.startsWith("http://") || href.startsWith("https://");

      return (
        <a
          key={key}
          href={href}
          className={styles.link}
          rel={isExternal ? "noopener noreferrer" : undefined}
          target={isExternal ? "_blank" : undefined}
        >
          {children}
        </a>
      );
    }
    default: {
      return <span key={key}>{renderChildren(node, key)}</span>;
    }
  }
}

export function LexicalRichTextRenderer({ content, className, emptyFallback }: LexicalRichTextRendererProps) {
  const normalized = normalizeLexicalContent(content);
  if (!normalized || normalized.root.children.length === 0) {
    if (emptyFallback !== undefined) {
      return <>{emptyFallback}</>;
    }

    return <p className={cn(styles.empty, "muted")}>No content.</p>;
  }

  return <div className={cn(styles.root, className)}>{normalized.root.children.map((node, index) => renderNode(node, `node-${index}`))}</div>;
}
