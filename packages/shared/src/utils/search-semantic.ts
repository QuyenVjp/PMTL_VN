const DIACRITIC_REGEX = /[\u0300-\u036f]/g;

type SemanticRule = {
  id: string;
  label: string;
  triggers: string[];
  expansions: string[];
};

const SEMANTIC_RULES: SemanticRule[] = [
  {
    id: "bao-hieu",
    label: "Bao hieu va cha me",
    triggers: ["hieu thao", "bao hieu", "cha me", "phu mau", "on cha me"],
    expansions: ["hieu thao", "bao hieu", "dia tang", "cha me", "an cha nghia me"],
  },
  {
    id: "vang-sinh",
    label: "Tinh do va vang sinh",
    triggers: ["vang sinh", "tinh do", "a di da", "niem phat", "tro niem", "ho niem"],
    expansions: ["vang sinh", "tinh do", "niem phat", "tro niem", "ho niem", "a di da"],
  },
  {
    id: "nghiep-chuong",
    label: "Nghiep chuong va giai nghiep",
    triggers: ["nghiep", "nghiep chuong", "giai nghiep", "oan gia trai chu", "sam hoi"],
    expansions: ["nghiep chuong", "giai nghiep", "oan gia trai chu", "sam hoi", "tu sua"],
  },
  {
    id: "tro-niem",
    label: "Tro niem va ho niem",
    triggers: ["tro niem", "ho niem", "ho tro luc lam chung", "luc lam chung"],
    expansions: ["tro niem", "ho niem", "luc lam chung", "niem phat", "tinh do"],
  },
  {
    id: "gia-dinh",
    label: "Gia dinh va doi song",
    triggers: ["gia dinh", "hon nhan", "vo chong", "con cai", "quan he"],
    expansions: ["gia dinh", "vo chong", "con cai", "hanh phuc", "ung xu"],
  },
  {
    id: "tam-an",
    label: "Tinh than va tam an",
    triggers: ["lo au", "bat an", "tram cam", "tam an", "binh an", "buong xa"],
    expansions: ["tam an", "binh an", "buong xa", "niem phat", "giu tam", "an dinh"],
  },
];

export function normalizeSemanticText(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITIC_REGEX, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getMatchedRules(query: string): SemanticRule[] {
  const normalizedQuery = normalizeSemanticText(query);

  if (!normalizedQuery) {
    return [];
  }

  return SEMANTIC_RULES.filter((rule) =>
    rule.triggers.some((trigger) => normalizedQuery.includes(trigger)),
  );
}

export function buildSemanticHints(input: string): string[] {
  return getMatchedRules(input).map((rule) => rule.label);
}

export function expandSemanticQuery(query: string): string[] {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const expansions = new Set<string>([normalizedQuery]);

  for (const rule of getMatchedRules(normalizedQuery)) {
    expansions.add(`${normalizedQuery} ${rule.expansions.join(" ")}`.trim());
    expansions.add(rule.expansions.join(" "));
  }

  return Array.from(expansions).slice(0, 4);
}

export function buildSemanticSearchText(parts: Array<string | null | undefined>): {
  semanticText: string;
  semanticHints: string[];
} {
  const semanticText = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    semanticText,
    semanticHints: buildSemanticHints(semanticText),
  };
}
