import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "./lib/brand";
import { verifySessionToken } from "./lib/auth/session";

/**
 * First line of defence for /admin and /api/admin.
 * Every admin page, server action and route handler ALSO re-verifies the session (lib/auth/guard.ts).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const session = await verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value).catch(() => null);
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
