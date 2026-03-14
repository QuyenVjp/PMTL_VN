import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams?.token;

  return (
    <section className="section-stack" style={{ maxWidth: 520, margin: "0 auto" }}>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="section-stack">
          <div className="panel" style={{ padding: 24 }}>
            <h1 style={{ marginTop: 0 }}>Thieu reset token</h1>
            <p className="muted" style={{ marginBottom: 0 }}>
              Ban can token hop le de dat lai mat khau. Tao lai request moi ben duoi.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
      )}
    </section>
  );
}
