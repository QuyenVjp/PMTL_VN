import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <section className="section-stack" style={{ maxWidth: 520, margin: "0 auto" }}>
      <LoginForm {...(resolvedSearchParams?.redirect ? { redirectTo: resolvedSearchParams.redirect } : {})} />
    </section>
  );
}
