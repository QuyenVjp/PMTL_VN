export function CommentGuidelines() {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <h3 style={{ marginTop: 0 }}>Luồng bình luận</h3>
      <p className="muted">
        Web chỉ gửi input đã validate schema. Moderation, rate limit, notification và search sync
        được xử lý ở CMS service.
      </p>
    </div>
  );
}

