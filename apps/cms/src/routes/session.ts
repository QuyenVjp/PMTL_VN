import { getCurrentSession, UserAuthError } from "@/collections/Users/service";
import { getCmsPayload } from "@/routes/public";

export async function getOptionalSession(headers: Headers) {
  const payload = await getCmsPayload();

  return getCurrentSession(payload, headers);
}

export async function requireSession(headers: Headers) {
  const session = await getOptionalSession(headers);

  if (!session) {
    throw new UserAuthError("AUTH_UNAUTHENTICATED", "Bạn chưa đăng nhập.", 401);
  }

  return session;
}
