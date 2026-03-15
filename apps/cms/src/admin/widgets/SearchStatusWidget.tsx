import type { WidgetServerProps } from "payload";

import { getPostSearchStatus } from "@/services/search.service";

import styles from "../components/admin-panel.module.css";

export async function SearchStatusWidget({ req }: WidgetServerProps) {
  const status = await getPostSearchStatus(req.payload);

  const cards = [
    {
      label: "Search engine",
      value: status.engine === "meilisearch" ? "Meilisearch" : "Fallback",
      hint: status.engine === "meilisearch" ? "Dang dung index bai viet rieng." : "Dang dung Payload fallback.",
    },
    {
      label: "Bai viet CMS",
      value: String(status.postsInCms),
      hint: "Tong so bai viet hien co trong CMS.",
    },
    {
      label: "Doc trong index",
      value: String(status.meilisearch.index?.numberOfDocuments ?? 0),
      hint: "So document dang nam trong index posts.",
    },
    {
      label: "Queue dang cho",
      value: String(status.queue.counts.waiting),
      hint: status.queue.enabled ? "Job search-sync dang cho Payload worker." : "Payload Jobs chua san sang.",
    },
    {
      label: "Queue dang chay",
      value: String(status.queue.counts.active),
      hint: "So job worker dang xu ly.",
    },
    {
      label: "Queue loi",
      value: String(status.queue.counts.failed),
      hint: "Can xem log neu chi so nay tang.",
    },
  ];

  return (
    <section className={styles.widgetCard}>
      <div>
        <h3 className={styles.widgetTitle}>Trang thai search</h3>
        <p className={styles.widgetDescription}>
          Theo doi index bai viet, hang doi sync va suc khoe search ngay trong dashboard.
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
