"use client";

import Link from "next/link";

import { useSearch } from "../hooks/use-search";

export function SearchPanel() {
  const { query, setQuery, results, isLoading } = useSearch();

  return (
    <section className="panel" style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Tìm kiếm nội dung</h2>
      <p className="muted">
        Kết quả được truy vấn từ lớp search client, dữ liệu gốc đồng bộ từ Payload sang Meilisearch.
      </p>
      <input
        aria-label="Search content"
        className="field"
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder="Tìm bài viết hoặc sự kiện..."
        value={query}
      />
      <div className="section-stack" style={{ marginTop: 18 }}>
        {isLoading ? <span className="muted">Đang tìm kiếm...</span> : null}
        {results.map((result) => (
          <Link className="panel" href={result.url} key={result.id} style={{ padding: 16 }}>
            <strong>{result.title}</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {result.excerpt}
            </p>
          </Link>
        ))}
        {!results.length && query ? (
          <p className="muted" style={{ marginBottom: 0 }}>
            Không tìm thấy kết quả phù hợp.
          </p>
        ) : null}
      </div>
    </section>
  );
}

