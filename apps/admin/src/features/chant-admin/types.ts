export type ChantEnvironmentRuleRow = {
  groupKey: string;
  groupTitle: string;
  ruleKey: string;
  title: string;
  canonicalWording: string;
  severity: string;
  productizationMode: string;
  referenceOnly: boolean;
};

export type ChantEnvironmentRuleGroup = {
  groupKey: string;
  title: string;
  summary: string;
  rules: Array<{
    ruleKey: string;
    title: string;
    canonicalWording: string;
    severity: string;
    productizationMode: string;
    referenceOnly: boolean;
  }>;
  lastReviewedAt: string;
};

export type ChantEnvironmentRulesResponse = {
  intro: {
    title: string;
    summary: string;
    updatedAt: string;
  };
  groupCards: Array<{
    groupKey: string;
    title: string;
    summary: string;
    ruleCount: number;
  }>;
  groups: ChantEnvironmentRuleGroup[];
};
