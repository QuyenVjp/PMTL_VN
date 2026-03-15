import styles from "./admin-panel.module.css";

const quickLinks = [
  {
    href: "/admin/collections/posts",
    hint: "Vào danh sách bài viết để biên tập nhanh.",
    label: "Bài viết",
  },
  {
    href: "/admin/collections/postComments",
    hint: "Xem bình luận bài viết đang chờ kiểm duyệt.",
    label: "Bình luận bài viết",
  },
  {
    href: "/admin/globals/homepage",
    hint: "Sửa nội dung mặt tiền của website.",
    label: "Trang chủ",
  },
  {
    href: "/admin/globals/navigation",
    hint: "Cập nhật menu và nút điều hướng.",
    label: "Điều hướng",
  },
  {
    href: "/admin/globals/site-settings",
    hint: "Đổi tên site, thông tin liên hệ và SEO mặc định.",
    label: "Cài đặt website",
  },
];

export function DashboardIntro() {
  return (
    <section className={styles.introCard}>
      <div className={styles.introHeader}>
        <span className={styles.eyebrow}>PMTL CMS</span>
        <h2 className={styles.introTitle}>Bảng điều khiển cho biên tập viên</h2>
        <p className={styles.introText}>
          Tập trung vào nội dung chính, các trang hệ thống và những mục cần xem nhanh trong ngày.
          Không cần mở quá nhiều danh sách để biết tình hình hiện tại.
        </p>
      </div>

      <div className={styles.linkGrid}>
        {quickLinks.map((link) => (
          <a key={link.href} className={styles.linkCard} href={link.href}>
            <span className={styles.linkLabel}>{link.label}</span>
            <span className={styles.linkHint}>{link.hint}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
