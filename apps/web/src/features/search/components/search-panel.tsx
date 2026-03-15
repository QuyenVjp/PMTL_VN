"use client";

import Link from "next/link";

import { ZenInput } from "@/components/ui-zen/zen-input";
import { ZenPanel } from "@/components/ui-zen/zen-panel";

import { useSearch } from "../hooks/use-search";

export function SearchPanel() {
  const { query, setQuery, results, isLoading } = useSearch();

  return (
    <ZenPanel className="space-y-4 p-6">
      <h2 className="mt-0 font-display text-2xl text-foreground">Tìm kiếm nội dung</h2>
      <p className="text-sm text-muted-foreground">
        Kết quả được truy vấn từ lớp search client, dữ liệu gốc đồng bộ từ Payload sang Meilisearch.
      </p>
      <ZenInput
        aria-label="Search content"
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder="Tìm bài viết hoặc sự kiện..."
        value={query}
      />
      <div className="section-stack mt-4">
        {isLoading ? <span className="text-sm text-muted-foreground">Đang tìm kiếm...</span> : null}
        {results.map((result) => (
          <Link className="rounded-xl border border-border/70 bg-background/70 p-4 transition-colors hover:border-gold/30" href={result.url} key={result.id}>
            <strong className="text-foreground">{result.title}</strong>
            <p className="mb-0 text-sm text-muted-foreground">
              {result.excerpt}
            </p>
          </Link>
        ))}
        {!results.length && query ? (
          <p className="mb-0 text-sm text-muted-foreground">
            Không tìm thấy kết quả phù hợp.
          </p>
        ) : null}
      </div>
    </ZenPanel>
  );
}

