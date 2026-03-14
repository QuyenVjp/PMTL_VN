export type LexicalNode = {
  type: string;
  children?: LexicalNode[];
  [key: string]: unknown;
};

export type LexicalRootNode = {
  type: "root";
  children: LexicalNode[];
  direction?: "ltr" | "rtl" | null;
  format?: "left" | "start" | "center" | "right" | "end" | "justify" | "";
  indent?: number;
  version?: number;
};

export type LexicalRichText = {
  root: LexicalRootNode;
  [key: string]: unknown;
};
