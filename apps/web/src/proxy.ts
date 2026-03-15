import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getAuthCookie(req: NextRequest) {
  return req.cookies.get("pmtl-session")?.value ?? req.cookies.get("auth_token")?.value;
}

export function proxy(req: NextRequest) {
  const idToken = req.nextUrl.searchParams.get("id_token");
  const accessToken = req.nextUrl.searchParams.get("access_token");

  // OAuth callback fallback: provider may redirect "/" with token query.
  if ((idToken || accessToken) && req.nextUrl.pathname !== "/auth/google/callback") {
    const callbackUrl = req.nextUrl.clone();
    callbackUrl.pathname = "/auth/google/callback";
    return NextResponse.redirect(callbackUrl);
  }

  const token = getAuthCookie(req);

  if (req.nextUrl.pathname.startsWith("/profile") && !token) {
    const redirectUrl = req.nextUrl.clone();
    const originalPath = req.nextUrl.pathname;
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("redirect", originalPath);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/profile/:path*"],
};
