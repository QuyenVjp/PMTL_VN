"use client";

import { useAuthSession } from "../hooks/use-auth-session";

export function AuthStatusPanel() {
  const { error, isLoading, session } = useAuthSession();

  return (
    <div className="panel" style={{ padding: 24 }}>
      <h3 style={{ marginTop: 0 }}>Trạng thái xác thực</h3>
      {isLoading ? <p className="muted">Đang tải session...</p> : null}
      {!isLoading && session ? (
        <div className="section-stack">
          <p className="muted" style={{ marginBottom: 0 }}>
            Đăng nhập với {session.user.email}
          </p>
          <div className="pill-list">
            <span className="pill">{session.user.role}</span>
            <span className="pill">{session.user.status}</span>
          </div>
        </div>
      ) : null}
      {!isLoading && !session ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          Chưa có session. Web sẽ chặn các route bảo vệ khi cookie auth không tồn tại.
        </p>
      ) : null}
      {error ? <p style={{ color: "#a33", marginBottom: 0 }}>{error}</p> : null}
    </div>
  );
}
