import type { WidgetServerProps } from "payload";

import { getPostSearchStatus } from "@/services/search.service";

import styles from "../components/admin-panel.module.css";

export async function SearchStatusWidget({ req }: WidgetServerProps) {
  const status = await getPostSearchStatus(req.payload);

  const cards = [
    {
      label: "Search engine",
      value: status.engine === "meilisearch" ? "Meilisearch" : "Fallback",
      hint: status.engine === "meilisearch" ? "Đang dùng index bài viết riêng." : "Đang dùng Payload fallback.",
    },
    {
      label: "Bài viết CMS",
      value: String(status.postsInCms),
      hint: "Tổng số bài viết hiện có trong CMS.",
    },
    {
      label: "Đọc trong index",
      value: String(status.meilisearch.index?.numberOfDocuments ?? 0),
      hint: "Số document đang nằm trong index posts.",
    },
    {
      label: "Queue đang chờ",
      value: String(status.queue.counts.waiting),
      hint: status.queue.enabled ? "Job search-sync đang chờ Payload worker." : "Payload Jobs chưa sẵn sàng.",
    },
    {
      label: "Queue đang chạy",
      value: String(status.queue.counts.active),
      hint: "Số job worker đang xử lý.",
    },
    {
      label: "Queue lỗi",
      value: String(status.queue.counts.failed),
      hint: "Cần xem log nếu chỉ số này tăng.",
    },
  ];

  return (
    <section className={styles.widgetCard}>
      <div>
        <h3 className={styles.widgetTitle}>Trạng thái search</h3>
        <p className={styles.widgetDescription}>
          Theo dõi index bài viết, hàng đợi sync và sức khỏe search ngay trong dashboard.
        </p>
      </div>

      <div className={styles.statsGrid}>
        {cards.map((card) => (
          <article key={card.label} className={styles.statCard}>
            <span className={styles.statLabel}>{card.label}</span>
            <strong className={styles.statValue}>{card.value}</strong>
            <span className={styles.statHint}>{card.hint}</span>
          </article>
        ))}
      </div>

      <div className={styles.widgetMetaList}>
        <div className={styles.widgetMetaItem}>
          <span className={styles.widgetMetaLabel}>Health</span>
          <strong>{status.meilisearch.status}</strong>
        </div>
        <div className={styles.widgetMetaItem}>
          <span className={styles.widgetMetaLabel}>Index</span>
          <strong>{status.postsIndexName}</strong>
        </div>
        <div className={styles.widgetMetaItem}>
          <span className={styles.widgetMetaLabel}>Recent tasks</span>
          <strong>{status.meilisearch.recentTasks.length}</strong>
        </div>
      </div>
    </section>
  );
}
