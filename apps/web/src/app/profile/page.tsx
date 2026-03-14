import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireAuthSession } from "@/features/auth/api/session";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ProfileSummaryCard } from "@/features/profile/components/profile-summary-card";

export default async function ProfilePage() {
  const session = await requireAuthSession();

  return (
    <section className="content-grid">
      <div className="section-stack">
        <ProfileSummaryCard user={session.user} />
        <div className="panel" style={{ padding: 24 }}>
          <h3 style={{ marginTop: 0 }}>Session</h3>
          <p className="muted">Token exp: {session.exp ?? "N/A"}</p>
          <LogoutButton />
        </div>
      </div>
      <ProfileForm user={session.user} />
    </section>
  );
}
