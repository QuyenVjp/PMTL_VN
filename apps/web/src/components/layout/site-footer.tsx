export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="app-shell footer-inner">
        <section className="footer-grid">
          <article>
            <h3 className="footer-title">Pháp Môn Tâm Linh</h3>
            <p className="muted">
              Nền tảng nội dung tu học và khai thị. Dữ liệu được quản trị tập trung từ CMS, web chỉ
              chịu trách nhiệm hiển thị và trải nghiệm người dùng.
            </p>
          </article>
          <article>
            <h4 className="footer-subtitle">Điều hướng nhanh</h4>
            <ul className="footer-links">
              <li>
                <a href="/posts">Bài viết mới</a>
              </li>
              <li>
                <a href="/events">Sự kiện</a>
              </li>
              <li>
                <a href="/search">Tìm kiếm</a>
              </li>
            </ul>
          </article>
          <article>
            <h4 className="footer-subtitle">Kiến trúc</h4>
            <p className="muted" style={{ marginBottom: 0 }}>
              `apps/web` hiển thị, `apps/cms` quản trị và xử lý nghiệp vụ, `packages/shared` giữ
              hợp đồng dữ liệu dùng chung.
            </p>
          </article>
        </section>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Pháp Môn Tâm Linh</span>
          <span>Nam mô A Di Đà Phật</span>
        </div>
      </div>
    </footer>
  );
}

