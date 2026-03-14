import type { AuthUser } from "@pmtl/shared";

type ProfileSummaryCardProps = {
  user: AuthUser;
};

export function ProfileSummaryCard({ user }: ProfileSummaryCardProps) {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <h3 style={{ marginTop: 0 }}>Profile feature</h3>
      <div className="section-stack">
        <div>
          <strong>{user.displayName}</strong>
          <p className="muted" style={{ margin: "6px 0 0" }}>
            {user.email}
          </p>
        </div>
        <div className="pill-list">
          <span className="pill">{user.role}</span>
          <span className="pill">{user.status}</span>
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          {user.bio || "Chua co bio. Ban co the cap nhat trong profile settings."}
        </p>
      </div>
    </div>
  );
}
