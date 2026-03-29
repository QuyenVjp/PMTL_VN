import { QueryProvider } from "@/lib/providers";
import { requireSession } from "@/lib/session";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth guard — redirects to /dang-nhap if no valid session
  await requireSession();

  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </QueryProvider>
  );
}
