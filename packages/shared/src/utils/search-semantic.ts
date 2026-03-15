const DIACRITIC_REGEX = /[\u0300-\u036f]/g;

type SemanticRule = {
  id: string;
  label: string;
  triggers: string[];
  expansions: string[];
};

type SearchRankingSource = {
  title?: string | null;
  excerpt?: string | null;
  sourceRef?: string | null;
  semanticHints?: string[] | null;
  featured?: boolean | null;
  views?: number | null;
  _rankingScore?: number | null;
};

const SEMANTIC_RULES: SemanticRule[] = [
  {
    id: "phat-phap",
    label: "Phật pháp và giáo pháp",
    triggers: ["phật pháp", "phat phap", "giáo pháp", "giao phap", "dharma", "kinh điển", "kinh dien"],
    expansions: ["phật pháp", "giáo pháp", "dharma", "kinh điển", "lời Phật dạy", "bài giảng"],
  },
  {
    id: "thien",
    label: "Thiền và chánh niệm",
    triggers: ["thiền", "thien", "thiền định", "thien dinh", "chánh niệm", "chanh niem", "tĩnh tâm", "tinh tam"],
    expansions: ["thiền", "thiền định", "chánh niệm", "tĩnh tâm", "an trú", "quán chiếu", "zen", "meditation"],
  },
  {
    id: "niem-phat",
    label: "Niệm Phật và trì tụng",
    triggers: ["niệm phật", "niem phat", "tụng kinh", "tung kinh", "trì chú", "tri chu", "niệm danh hiệu"],
    expansions: ["niệm phật", "tụng kinh", "trì chú", "trì tụng", "chanting", "recitation", "mantra"],
  },
  {
    id: "dai-bi",
    label: "Đại Bi và cầu nguyện",
    triggers: ["đại bi", "dai bi", "chú đại bi", "chu dai bi", "cầu nguyện", "cau nguyen", "quán thế âm", "quan the am"],
    expansions: ["chú đại bi", "quán thế âm", "cầu nguyện", "gia hộ", "từ bi", "thần chú"],
  },
  {
    id: "tinh-do",
    label: "Tịnh độ và vãng sinh",
    triggers: ["tịnh độ", "tinh do", "vãng sinh", "vang sinh", "a di đà", "a di da", "trợ niệm", "tro niem", "hộ niệm", "ho niem"],
    expansions: ["tịnh độ", "vãng sinh", "a di đà", "niệm phật", "trợ niệm", "hộ niệm"],
  },
  {
    id: "sam-hoi",
    label: "Sám hối và chuyển hóa",
    triggers: ["sám hối", "sam hoi", "giải nghiệp", "giai nghiep", "oan gia trái chủ", "oan gia trai chu", "nghiệp chướng", "nghiep chuong"],
    expansions: ["sám hối", "nghiệp chướng", "giải nghiệp", "oan gia trái chủ", "tu sửa", "chuyển nghiệp"],
  },
  {
    id: "an-lac",
    label: "Bình an và buông xả",
    triggers: ["bình an", "binh an", "buông xả", "buong xa", "lo âu", "lo au", "tâm an", "tam an", "mất ngủ", "mat ngu"],
    expansions: ["bình an", "buông xả", "tâm an", "an lạc", "giữ tâm", "an định", "ngủ ngon"],
  },
  {
    id: "gia-dinh",
    label: "Gia đình và ứng xử",
    triggers: ["gia đình", "gia dinh", "hôn nhân", "hon nhan", "vợ chồng", "vo chong", "con cái", "con cai", "cha mẹ", "cha me"],
    expansions: ["gia đình", "hôn nhân", "vợ chồng", "con cái", "hiếu đạo", "ứng xử", "quan hệ"],
  },
  {
    id: "bo-tat",
    label: "Bồ Tát và phát nguyện",
    triggers: ["bồ tát", "bo tat", "phát nguyện", "phat nguyen", "độ sinh", "do sinh", "hộ trì", "ho tri"],
    expansions: ["bồ tát", "phát nguyện", "độ sinh", "hộ trì", "từ bi", "đại nguyện"],
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

function getRuleVocabulary(rule: SemanticRule): string[] {
  const vocabulary = new Set<string>();

  for (const term of [...rule.triggers, ...rule.expansions]) {
    const normalized = normalizeSemanticText(term);
    if (normalized) {
      vocabulary.add(normalized);
    }
  }

  return Array.from(vocabulary);
}

function getMatchedRules(query: string): SemanticRule[] {
  const normalizedQuery = normalizeSemanticText(query);

  if (!normalizedQuery) {
    return [];
  }

  return SEMANTIC_RULES.filter((rule) =>
    getRuleVocabulary(rule).some((trigger) => normalizedQuery.includes(trigger)),
  );
}

export function buildSemanticHints(input: string): string[] {
  return getMatchedRules(input).map((rule) => rule.label);
}

export function expandSemanticQuery(query: string): string[] {
  const normalizedQuery = normalizeSemanticText(query);

  if (!normalizedQuery) {
    return [];
  }

  const expansions = new Set<string>([normalizedQuery]);

  for (const rule of getMatchedRules(normalizedQuery)) {
    const vocabulary = getRuleVocabulary(rule);
    expansions.add(vocabulary.join(" "));
    expansions.add(`${normalizedQuery} ${vocabulary.join(" ")}`.trim());
  }

  return Array.from(expansions).slice(0, 6);
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

export function buildSemanticSynonymMap(): Record<string, string[]> {
  const synonyms = new Map<string, Set<string>>();

  for (const rule of SEMANTIC_RULES) {
    const vocabulary = getRuleVocabulary(rule);

    for (const term of vocabulary) {
      const relatedTerms = new Set(vocabulary.filter((candidate) => candidate !== term));
      if (!synonyms.has(term)) {
        synonyms.set(term, relatedTerms);
        continue;
      }

      const existing = synonyms.get(term);
      if (!existing) {
        continue;
      }

      for (const related of relatedTerms) {
        existing.add(related);
      }
    }
  }

  return Object.fromEntries(
    Array.from(synonyms.entries()).map(([term, relatedTerms]) => [term, Array.from(relatedTerms)]),
  );
}

function scoreNormalizedMatch(text: string, query: string): number {
  if (!text || !query) {
    return 0;
  }

  if (text === query) {
    return 400;
  }

  if (text.startsWith(`${query} `) || text.startsWith(query)) {
    return 260;
  }

  if (text.includes(` ${query} `) || text.includes(query)) {
    return 160;
  }

  const tokens = query.split(" ").filter(Boolean);
  if (tokens.length === 0) {
    return 0;
  }

  const matchedTokens = tokens.filter((token) => text.includes(token)).length;
  return matchedTokens * 25;
}

export function calculateSearchRelevance(source: SearchRankingSource, query: string): number {
  const normalizedQuery = normalizeSemanticText(query);
  if (!normalizedQuery) {
    return source._rankingScore ?? 0;
  }

  const normalizedTitle = normalizeSemanticText(source.title ?? "");
  const normalizedExcerpt = normalizeSemanticText(source.excerpt ?? "");
  const normalizedSourceRef = normalizeSemanticText(source.sourceRef ?? "");
  const semanticHints = (source.semanticHints ?? []).map((hint) => normalizeSemanticText(hint));
  const expandedQueries = expandSemanticQuery(normalizedQuery);

  let score = source._rankingScore ?? 0;
  score += scoreNormalizedMatch(normalizedTitle, normalizedQuery);
  score += Math.round(scoreNormalizedMatch(normalizedExcerpt, normalizedQuery) * 0.45);
  score += Math.round(scoreNormalizedMatch(normalizedSourceRef, normalizedQuery) * 0.3);

  for (const expandedQuery of expandedQueries) {
    if (expandedQuery === normalizedQuery) {
      continue;
    }

    score += Math.round(scoreNormalizedMatch(normalizedTitle, expandedQuery) * 0.2);
    score += Math.round(scoreNormalizedMatch(normalizedExcerpt, expandedQuery) * 0.1);
  }

  if (semanticHints.some((hint) => normalizedQuery.includes(hint) || hint.includes(normalizedQuery))) {
    score += 35;
  }

  if (source.featured) {
    score += 6;
  }

  if (typeof source.views === "number" && source.views > 0) {
    score += Math.min(10, Math.log10(source.views + 1) * 2);
  }

  return score;
}

export function rerankSearchResults<T extends SearchRankingSource>(results: T[], query: string): T[] {
  return [...results].sort((left, right) => {
    const leftScore = calculateSearchRelevance(left, query);
    const rightScore = calculateSearchRelevance(right, query);

    if (leftScore === rightScore) {
      return 0;
    }

    return rightScore - leftScore;
  });
}
