import styles from "../components/admin-panel.module.css";

const links = [
  {
    href: "/admin/collections/posts",
    hint: "Tạo và cập nhật bài viết mới.",
    label: "Quản lý bài viết",
  },
  {
    href: "/admin/collections/media",
    hint: "Tải ảnh và bổ sung alt text.",
    label: "Thư viện media",
  },
  {
    href: "/admin/collections/comments",
    hint: "Lọc bình luận để xử lý kiểm duyệt.",
    label: "Bình luận",
  },
  {
    href: "/admin/globals/site-settings",
    hint: "Sửa tên site, liên hệ và SEO mặc định.",
    label: "Cài đặt hệ thống",
  },
];

export function QuickLinksWidget() {
  return (
    <section className={styles.widgetCard}>
      <div>
        <h3 className={styles.widgetTitle}>Đường dẫn nhanh</h3>
        <p className={styles.widgetDescription}>
          Các điểm vào thường dùng cho editor để thao tác nhanh hơn và ít lạc hướng.
        </p>
      </div>

      <div className={styles.linkGrid}>
        {links.map((link) => (
          <a key={link.href} className={styles.linkCard} href={link.href}>
            <span className={styles.linkLabel}>{link.label}</span>
            <span className={styles.linkHint}>{link.hint}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
