import type { WidgetServerProps } from "payload";

import styles from "../components/admin-panel.module.css";

async function countCollection(
  req: WidgetServerProps["req"],
  collection: "postComments" | "events" | "media" | "posts" | "downloads" | "hubPages",
) {
  const result = await req.payload.count({
    collection,
    req,
  });

  return result.totalDocs;
}

export async function ContentStatsWidget({ req }: WidgetServerProps) {
  const [posts, media, comments, events, downloads, hubPages, draftPosts] = await Promise.all([
    countCollection(req, "posts"),
    countCollection(req, "media"),
    countCollection(req, "postComments"),
    countCollection(req, "events"),
    countCollection(req, "downloads"),
    countCollection(req, "hubPages"),
    req.payload
      .count({
        collection: "posts",
        req,
        where: {
          _status: {
            equals: "draft",
          },
        },
      })
      .then((result) => result.totalDocs),
  ]);

  const stats = [
    {
      hint: "Tổng bài viết hiện có",
      label: "Bài viết",
      value: posts,
    },
    {
      hint: "Ảnh và tệp đã tải lên",
      label: "Media",
      value: media,
    },
    {
      hint: "Tổng bình luận trong hệ thống",
      label: "Bình luận",
      value: comments,
    },
    {
      hint: "Sự kiện đang quản lý",
      label: "Sự kiện",
      value: events,
    },
    {
      hint: "Tài liệu và tệp tải về",
      label: "Downloads",
      value: downloads,
    },
    {
      hint: "Trang hub/chuyên đề",
      label: "Hub",
      value: hubPages,
    },
    {
      hint: "Bản nháp chưa xuất bản",
      label: "Bài viết nháp",
      value: draftPosts,
    },
  ];

  return (
    <section className={styles.widgetCard}>
      <div>
        <h3 className={styles.widgetTitle}>Tổng quan nội dung</h3>
        <p className={styles.widgetDescription}>
          Số liệu nhìn nhanh ngay trong CMS, ưu tiên cho biên tập và kiểm duyệt hằng ngày.
        </p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <article key={stat.label} className={styles.statCard}>
            <span className={styles.statLabel}>{stat.label}</span>
            <strong className={styles.statValue}>{stat.value}</strong>
            <span className={styles.statHint}>{stat.hint}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
