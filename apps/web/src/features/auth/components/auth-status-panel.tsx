"use client";

import { useAuthSession } from "../hooks/use-auth-session";

export function AuthStatusPanel() {
  const { error, isLoading, session } = useAuthSession();

  return (
    <div className="panel" style={{ padding: 24 }}>
      <h3 style={{ marginTop: 0 }}>Auth boundary</h3>
      {isLoading ? <p className="muted">Dang tai session...</p> : null}
      {!isLoading && session ? (
        <div className="section-stack">
          <p className="muted" style={{ marginBottom: 0 }}>
            Dang nhap voi {session.user.email}
          </p>
          <div className="pill-list">
            <span className="pill">{session.user.role}</span>
            <span className="pill">{session.user.status}</span>
          </div>
        </div>
      ) : null}
      {!isLoading && !session ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          Chua co session. Web se chuyen huong protected route neu cookie auth khong ton tai.
        </p>
      ) : null}
      {error ? <p style={{ color: "#a33", marginBottom: 0 }}>{error}</p> : null}
    </div>
  );
}
