export default function CmsHomePage() {
  return (
    <main
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        padding: "40px",
      }}
    >
      <section
        style={{
          background: "#ffffff",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
          padding: "32px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>PMTL CMS</h1>
        <p>
          Ứng dụng này đang host Payload theo hướng Next-native. Admin UI nằm tại{" "}
          <a href="/admin">/admin</a>, còn REST API tiếp tục expose tại <code>/api/*</code>.
        </p>
        <p>
          Boundary hiện tại được giữ nguyên: <code>apps/web</code> là public frontend,{" "}
          <code>apps/cms</code> là admin và content API riêng.
        </p>
      </section>
    </main>
  );
}
