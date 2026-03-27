"use client";

import Link from "next/link";
import type { Route } from "next";

interface EnvironmentRulesData {
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
  groups: Array<{
    groupKey: string;
    title: string;
    summary: string;
    severityLegend: Array<{
      severity: string;
      label: string;
      description: string;
    }>;
    rules: Array<{
      ruleKey: string;
      title: string;
      canonicalWording: string;
      severity: string;
      productizationMode: string;
      safeLaneRefs?: string[];
      avoidItems?: string[];
      shortReason: string | null;
      referenceOnly: boolean;
    }>;
    lastReviewedAt: string;
    versionNote: string | null;
  }>;
  quickChecklist: {
    beforeYouStart: string[];
    whenToPause: string[];
    safeLaneSuggestions: string[];
  };
  specialLocationHighlights: Array<{
    topic: string;
    summary: string;
  }>;
  referenceOnlyCautions: Array<{
    topic: string;
    summary: string;
    ctaLabel: string;
    ctaHref: string;
  }>;
  relatedGuideRefs: Array<{
    title: string;
    href: string;
    surface: string;
  }>;
}

const SEVERITY_COLORS: Record<string, string> = {
  advisory: "bg-blue-50 border-blue-200 text-blue-800",
  caution: "bg-amber-50 border-amber-200 text-amber-800",
  strong_guardrail: "bg-red-50 border-red-200 text-red-800",
  quality_guidance: "bg-green-50 border-green-200 text-green-800",
  reference_only: "bg-gray-50 border-gray-200 text-gray-600",
};

const SEVERITY_LABELS: Record<string, string> = {
  advisory: "Khuyến cáo",
  caution: "Lưu ý",
  strong_guardrail: "Quan trọng",
  quality_guidance: "Hướng dẫn",
  reference_only: "Tham khảo",
};

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function RuleBadge({ severity }: { severity: string }) {
  const colorClass = SEVERITY_COLORS[severity] || SEVERITY_COLORS.advisory;
  const label = SEVERITY_LABELS[severity] || severity;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}

function RuleCard({
  rule,
}: {
  rule: {
    ruleKey: string;
    title: string;
    canonicalWording: string;
    severity: string;
    safeLaneRefs?: string[];
    avoidItems?: string[];
    shortReason: string | null;
    referenceOnly: boolean;
  };
}) {
  return (
    <article
      id={rule.ruleKey}
      className="border rounded-lg p-4 hover:border-gray-400 transition-colors scroll-mt-20"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h4 className="font-medium text-gray-900">{rule.title}</h4>
        <RuleBadge severity={rule.severity} />
      </div>
      
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {rule.canonicalWording}
      </p>

      {rule.shortReason && (
        <p className="text-xs text-gray-500 italic mb-2">
          💡 {rule.shortReason}
        </p>
      )}

      {rule.safeLaneRefs && rule.safeLaneRefs.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-green-700">Gợi ý: </span>
          <span className="text-xs text-green-600">
            {rule.safeLaneRefs.join(" • ")}
          </span>
        </div>
      )}

      {rule.avoidItems && rule.avoidItems.length > 0 && (
        <div className="mt-2">
          <span className="text-xs font-medium text-red-700">Tránh: </span>
          <span className="text-xs text-red-600">
            {rule.avoidItems.join(" • ")}
          </span>
        </div>
      )}

      {rule.referenceOnly && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-500">
          ⚠️ Đây là thông tin tham khảo, không nên tự diễn giải. Nếu lo lắng, hãy tham vấn thầy.
        </div>
      )}
    </article>
  );
}

function GroupSection({
  group,
}: {
  group: {
    groupKey: string;
    title: string;
    summary: string;
    rules: Array<{
      ruleKey: string;
      title: string;
      canonicalWording: string;
      severity: string;
      safeLaneRefs?: string[];
      avoidItems?: string[];
      shortReason: string | null;
      referenceOnly: boolean;
    }>;
    lastReviewedAt: string;
  };
}) {
  return (
    <section id={group.groupKey} className="scroll-mt-24">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.title}</h3>
      <p className="text-gray-600 mb-4">{group.summary}</p>
      
      <div className="space-y-3">
        {group.rules.map((rule) => (
          <RuleCard key={rule.ruleKey} rule={rule} />
        ))}
      </div>
      
      <p className="text-xs text-gray-400 mt-4">
        Cập nhật: {formatDate(group.lastReviewedAt)}
      </p>
    </section>
  );
}

function QuickChecklist({
  checklist,
}: {
  checklist: {
    beforeYouStart: string[];
    whenToPause: string[];
    safeLaneSuggestions: string[];
  };
}) {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
      <h3 className="text-lg font-semibold text-amber-900 mb-4">📋 Danh sách kiểm tra nhanh</h3>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-amber-800 mb-2">Trước khi bắt đầu</h4>
          <ul className="space-y-1">
            {checklist.beforeYouStart.map((item, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-amber-800 mb-2">Khi nào nên tạm dừng</h4>
          <ul className="space-y-1">
            {checklist.whenToPause.map((item, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-500">⏸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-amber-800 mb-2">Gợi ý an toàn</h4>
          <ul className="space-y-1">
            {checklist.safeLaneSuggestions.map((item, i) => (
              <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                <span className="text-amber-500">💡</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TableOfContents({
  groupCards,
}: {
  groupCards: Array<{
    groupKey: string;
    title: string;
    ruleCount: number;
  }>;
}) {
  return (
    <nav className="bg-gray-50 rounded-lg p-4 sticky top-4">
      <h3 className="font-semibold text-gray-900 mb-3">Mục lục</h3>
      <ul className="space-y-2">
        {groupCards.map((card) => (
          <li key={card.groupKey}>
            <a
              href={`#${card.groupKey}`}
              className="text-sm text-gray-600 hover:text-gray-900 flex justify-between items-center"
            >
              <span>{card.title}</span>
              <span className="text-xs text-gray-400">{card.ruleCount}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function RelatedGuides({
  guides,
}: {
  guides: Array<{
    title: string;
    href: string;
  }>;
}) {
  return (
    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">📚 Hướng dẫn liên quan</h3>
      <div className="flex flex-wrap gap-3">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href as Route}
            className="px-4 py-2 bg-white rounded-full border border-blue-200 text-sm text-blue-700 hover:bg-blue-100 transition-colors"
          >
            {guide.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function EnvironmentRulesPage({ data }: { data: EnvironmentRulesData }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <nav className="text-sm text-gray-500 mb-4">
          <Link href={"/" as Route} className="hover:text-gray-700">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link href={"/niem-kinh" as Route} className="hover:text-gray-700">Niệm kinh</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Lưu ý môi trường</span>
        </nav>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{data.intro.title}</h1>
        <p className="text-lg text-gray-600 max-w-3xl">{data.intro.summary}</p>
        <p className="text-sm text-gray-400 mt-2">
          Cập nhật: {formatDate(data.intro.updatedAt)}
        </p>
      </header>

      {/* Quick Checklist */}
      <section className="mb-10">
        <QuickChecklist checklist={data.quickChecklist} />
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 order-2 lg:order-1">
          <TableOfContents groupCards={data.groupCards} />
        </aside>

        {/* Content */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-12">
          {data.groups.map((group) => (
            <GroupSection key={group.groupKey} group={group} />
          ))}
        </div>
      </div>

      {/* Reference Only Cautions */}
      {data.referenceOnlyCautions.length > 0 && (
        <section className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ⚠️ Lưu ý quan trọng về những điều không nên tự diễn giải
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {data.referenceOnlyCautions.map((caution) => (
              <div key={caution.topic} className="p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-1">{caution.topic}</h4>
                <p className="text-sm text-gray-600 mb-2">{caution.summary}</p>
                <a
                  href={caution.ctaHref}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {caution.ctaLabel} →
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Guides */}
      <section className="mt-10">
        <RelatedGuides guides={data.relatedGuideRefs} />
      </section>
    </main>
  );
}
