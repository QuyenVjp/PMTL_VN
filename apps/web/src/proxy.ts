import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("pmtl-session");

  if (!hasSession && request.nextUrl.pathname.startsWith("/profile")) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
