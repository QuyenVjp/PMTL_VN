"use client";

import Link from "next/link";

import { useSearch } from "../hooks/use-search";

export function SearchPanel() {
  const { query, setQuery, results, isLoading } = useSearch();

  return (
    <section className="panel" style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Search architecture</h2>
      <p className="muted">
        Web goi wrapper tim kiem. Projection source tu Payload sync qua Meilisearch.
      </p>
      <input
        aria-label="Search content"
        className="field"
        onChange={(event) => {
          setQuery(event.target.value);
        }}
        placeholder="Tim bai viet hoac su kien..."
        value={query}
      />
      <div className="section-stack" style={{ marginTop: 18 }}>
        {isLoading ? <span className="muted">Dang tim kiem...</span> : null}
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
            Khong tim thay ket qua phu hop.
          </p>
        ) : null}
      </div>
    </section>
  );
}

